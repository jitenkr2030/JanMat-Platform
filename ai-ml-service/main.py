from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import re
import logging
from datetime import datetime
import json

# Import custom modules
from services.sentiment_analyzer import SentimentAnalyzer
from services.policy_explainer import PolicyExplainer
from services.fact_checker import FactChecker
from utils.data_loader import load_policies_data, load_fact_checks_data

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="JanMat AI/ML Service",
    description="AI/ML services for public opinion analysis, policy explanation, and fact checking",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
sentiment_analyzer = SentimentAnalyzer()
policy_explainer = PolicyExplainer()
fact_checker = FactChecker()

# Load data on startup
policies_data = {}
fact_checks_data = {}

@app.on_event("startup")
async def startup_event():
    """Load data and initialize services on startup"""
    global policies_data, fact_checks_data
    try:
        policies_data = load_policies_data()
        fact_checks_data = load_fact_checks_data()
        logger.info("Data loaded successfully")
    except Exception as e:
        logger.error(f"Error loading data: {e}")
        # Use mock data if files not found
        policies_data = get_mock_policies_data()
        fact_checks_data = get_mock_fact_checks_data()

# Request/Response Models
class SentimentAnalysisRequest(BaseModel):
    text: str
    context: Optional[str] = "general"  # poll, petition, comment, news
    language: Optional[str] = "en"

class SentimentAnalysisResponse(BaseModel):
    overall_sentiment: str  # positive, negative, neutral, mixed
    confidence: float
    emotions: Dict[str, float]
    political_tendency: str  # left, right, center, neutral
    urgency_level: float
    topics: List[str]
    sentiment_score: float  # -1 to 1
    analyzed_at: str

class PolicyExplanationRequest(BaseModel):
    policy_name: str
    user_question: str
    complexity_level: Optional[str] = "simple"  # simple, detailed, technical
    language: Optional[str] = "en"

class PolicyExplanationResponse(BaseModel):
    policy_name: str
    explanation: str
    key_points: List[str]
    impact_assessment: Dict[str, Any]
    pros_and_cons: Dict[str, List[str]]
    related_policies: List[str]
    complexity_level: str
    confidence: float
    sources: List[str]
    explained_at: str

class FactCheckRequest(BaseModel):
    statement: str
    claim_type: Optional[str] = "general"  # political, economic, social, scientific
    context: Optional[str] = ""

class FactCheckResponse(BaseModel):
    statement: str
    credibility_score: float  # 0 to 1
    verdict: str  # true, mostly_true, mostly_false, false, unverified
    confidence: float
    explanation: str
    evidence: List[Dict[str, Any]]
    fact_checker_rating: str  # high, medium, low
    last_verified: str
    related_claims: List[Dict[str, Any]]
    context_analysis: Dict[str, Any]

class BatchAnalysisRequest(BaseModel):
    texts: List[str]
    analysis_type: str  # sentiment, fact_check, both

class BatchAnalysisResponse(BaseModel):
    results: List[Dict[str, Any]]
    processed_count: int
    total_count: int
    processing_time: float
    analyzed_at: str

# Health Check
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "JanMat AI/ML Service",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "available_endpoints": [
            "/analyze/sentiment",
            "/explain/policy",
            "/fact-check",
            "/batch/analyze",
            "/health"
        ]
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "sentiment_analyzer": "active",
            "policy_explainer": "active", 
            "fact_checker": "active"
        },
        "data_loaded": {
            "policies": len(policies_data) > 0,
            "fact_checks": len(fact_checks_data) > 0
        },
        "timestamp": datetime.now().isoformat()
    }

# Sentiment Analysis Endpoint
@app.post("/analyze/sentiment", response_model=SentimentAnalysisResponse)
async def analyze_sentiment(request: SentimentAnalysisRequest):
    """
    Analyze sentiment of text with context-aware processing
    Supports: poll responses, petition text, comments, news articles
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        logger.info(f"Analyzing sentiment for text: {request.text[:100]}...")
        
        result = sentiment_analyzer.analyze(
            text=request.text,
            context=request.context,
            language=request.language
        )
        
        return SentimentAnalysisResponse(
            overall_sentiment=result["overall_sentiment"],
            confidence=result["confidence"],
            emotions=result["emotions"],
            political_tendency=result["political_tendency"],
            urgency_level=result["urgency_level"],
            topics=result["topics"],
            sentiment_score=result["sentiment_score"],
            analyzed_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")

# Policy Explanation Endpoint
@app.post("/explain/policy", response_model=PolicyExplanationResponse)
async def explain_policy(request: PolicyExplanationRequest):
    """
    Explain policies in simple language with context-aware responses
    """
    try:
        if not request.policy_name.strip():
            raise HTTPException(status_code=400, detail="Policy name cannot be empty")
        
        if not request.user_question.strip():
            raise HTTPException(status_code=400, detail="User question cannot be empty")
        
        logger.info(f"Explaining policy: {request.policy_name}")
        
        result = policy_explainer.explain(
            policy_name=request.policy_name,
            user_question=request.user_question,
            complexity_level=request.complexity_level,
            policies_data=policies_data,
            language=request.language
        )
        
        return PolicyExplanationResponse(
            policy_name=result["policy_name"],
            explanation=result["explanation"],
            key_points=result["key_points"],
            impact_assessment=result["impact_assessment"],
            pros_and_cons=result["pros_and_cons"],
            related_policies=result["related_policies"],
            complexity_level=result["complexity_level"],
            confidence=result["confidence"],
            sources=result["sources"],
            explained_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in policy explanation: {e}")
        raise HTTPException(status_code=500, detail=f"Policy explanation failed: {str(e)}")

# Fact Checking Endpoint
@app.post("/fact-check", response_model=FactCheckResponse)
async def fact_check_statement(request: FactCheckRequest):
    """
    Fact check statements with credibility assessment
    """
    try:
        if not request.statement.strip():
            raise HTTPException(status_code=400, detail="Statement cannot be empty")
        
        logger.info(f"Fact checking statement: {request.statement[:100]}...")
        
        result = fact_checker.check(
            statement=request.statement,
            claim_type=request.claim_type,
            context=request.context,
            fact_checks_data=fact_checks_data
        )
        
        return FactCheckResponse(
            statement=result["statement"],
            credibility_score=result["credibility_score"],
            verdict=result["verdict"],
            confidence=result["confidence"],
            explanation=result["explanation"],
            evidence=result["evidence"],
            fact_checker_rating=result["fact_checker_rating"],
            last_verified=result["last_verified"],
            related_claims=result["related_claims"],
            context_analysis=result["context_analysis"]
        )
        
    except Exception as e:
        logger.error(f"Error in fact checking: {e}")
        raise HTTPException(status_code=500, detail=f"Fact checking failed: {str(e)}")

# Batch Analysis Endpoint
@app.post("/batch/analyze", response_model=BatchAnalysisResponse)
async def batch_analyze(request: BatchAnalysisRequest):
    """
    Process multiple texts in batch for efficiency
    """
    try:
        if not request.texts:
            raise HTTPException(status_code=400, detail="Texts list cannot be empty")
        
        if len(request.texts) > 100:  # Limit batch size
            raise HTTPException(status_code=400, detail="Batch size cannot exceed 100 items")
        
        start_time = datetime.now()
        logger.info(f"Starting batch analysis of {len(request.texts)} texts")
        
        results = []
        
        for i, text in enumerate(request.texts):
            try:
                if request.analysis_type in ["sentiment", "both"]:
                    sentiment_result = sentiment_analyzer.analyze(
                        text=text,
                        context="batch_analysis",
                        language="en"
                    )
                
                if request.analysis_type in ["fact_check", "both"]:
                    fact_result = fact_checker.check(
                        statement=text,
                        claim_type="general",
                        context="batch_analysis",
                        fact_checks_data=fact_checks_data
                    )
                
                # Combine results
                combined_result = {
                    "index": i,
                    "text": text[:200] + "..." if len(text) > 200 else text,
                    "text_hash": hash(text)
                }
                
                if request.analysis_type in ["sentiment", "both"]:
                    combined_result["sentiment"] = sentiment_result
                
                if request.analysis_type in ["fact_check", "both"]:
                    combined_result["fact_check"] = fact_result
                
                results.append(combined_result)
                
            except Exception as e:
                logger.error(f"Error processing text {i}: {e}")
                results.append({
                    "index": i,
                    "text": text[:200] + "..." if len(text) > 200 else text,
                    "error": str(e)
                })
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return BatchAnalysisResponse(
            results=results,
            processed_count=len([r for r in results if "error" not in r]),
            total_count=len(request.texts),
            processing_time=processing_time,
            analyzed_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in batch analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

# Helper functions for mock data
def get_mock_policies_data():
    """Return mock policies data for development"""
    return {
        "Digital India": {
            "description": "Government initiative to transform India into a digitally empowered society",
            "objectives": ["Digital infrastructure", "Digital literacy", "Digital services"],
            "impact": "High",
            "implementation_status": "Ongoing",
            "budget": "₹1,13,000 crores",
            "key_beneficiaries": ["Citizens", "Businesses", "Government"],
            "related_policies": ["Make in India", "Startup India", "Skill India"]
        },
        "Swachh Bharat Mission": {
            "description": "Nation-wide campaign for clean India",
            "objectives": ["Waste management", "Sanitation", "Behavior change"],
            "impact": "High",
            "implementation_status": "Completed",
            "budget": "₹62,000 crores",
            "key_beneficiaries": ["Rural population", "Urban areas", "Schools"],
            "related_policies": ["National Rural Drinking Water Programme", "National Urban Livelihoods Mission"]
        },
        "Ayushman Bharat": {
            "description": "World's largest government healthcare programme",
            "objectives": ["Health insurance", "Primary healthcare", "Digital health"],
            "impact": "Very High",
            "implementation_status": "Ongoing",
            "budget": "₹64,180 crores",
            "key_beneficiaries": ["Poor families", "Vulnerable groups", "Senior citizens"],
            "related_policies": ["National Health Mission", "PM-JAY"]
        }
    }

def get_mock_fact_checks_data():
    """Return mock fact checks data for development"""
    return {
        "Digital India impact on rural areas": {
            "verdict": "mostly_true",
            "confidence": 0.85,
            "evidence": [
                {"source": "NITI Aayog Report 2024", "finding": "60% increase in rural internet usage"},
                {"source": "MeitY Annual Report", "finding": "2.5 lakh gram panchayats connected"}
            ]
        },
        "Swachh Bharat funding allocation": {
            "verdict": "true",
            "confidence": 0.95,
            "evidence": [
                {"source": "Budget Documents 2024", "finding": "₹62,000 crores allocated"},
                {"source": "CAG Report", "finding": "Funds utilized as per allocation"}
            ]
        },
        "Ayushman Bharat beneficiary numbers": {
            "verdict": "mostly_true",
            "confidence": 0.78,
            "evidence": [
                {"source": "NHA Official Data", "finding": "50+ crore beneficiaries registered"},
                {"source": "Independent Audit", "finding": "Some duplicate entries identified"}
            ]
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )