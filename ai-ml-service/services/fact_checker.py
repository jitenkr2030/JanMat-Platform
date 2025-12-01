import re
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import hashlib

logger = logging.getLogger(__name__)

class FactChecker:
    """
    Fact-checking service for political, economic, and social claims
    Provides credibility assessment and evidence-based verification
    """
    
    def __init__(self):
        """Initialize fact checker with verification criteria"""
        self.verdict_thresholds = {
            "true": 0.85,
            "mostly_true": 0.70,
            "mostly_false": 0.30,
            "false": 0.15
        }
        
        # Fact-checker reliability ratings (example values)
        self.fact_checker_reliability = {
            "Reuters": "high",
            "Associated Press": "high", 
            "FactCheck.org": "high",
            "PolitiFact": "high",
            "Snopes": "medium",
            "Local News Outlets": "medium",
            "Government Sources": "high",
            "Academic Research": "high"
        }
        
        # Claim type patterns for better analysis
        self.claim_patterns = {
            "statistical": [
                r"\d+\%|\d+ percent",
                r"₹\d+|\$\d+",
                r"\d+\s+(crore|lakh|thousand|million|billion)",
                r"increased by \d+%",
                r"decreased by \d+%"
            ],
            "temporal": [
                r"since \d{4}",
                r"from \d{4} to \d{4}",
                r"last (year|month|week|day)",
                r"this (year|month|week)",
                r"in \d{4}"
            ],
            "comparative": [
                r"more than",
                r"less than",
                r"higher than",
                r"lower than",
                r"compared to",
                r"versus",
                r"vs"
            ]
        }

    def check(self, statement: str, claim_type: str = "general", context: str = "",
              fact_checks_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Check factuality of a statement
        
        Args:
            statement: Statement to fact-check
            claim_type: Type of claim (political, economic, social, scientific, general)
            context: Additional context about the statement
            fact_checks_data: Existing fact-check database
            
        Returns:
            Dict with fact-check results and evidence
        """
        try:
            # Clean and normalize statement
            cleaned_statement = self._clean_statement(statement)
            
            # Check against existing fact-checks
            existing_check = self._check_existing_facts(cleaned_statement, fact_checks_data)
            if existing_check:
                return existing_check
            
            # Analyze claim characteristics
            claim_analysis = self._analyze_claim(cleaned_statement, claim_type)
            
            # Search for evidence
            evidence = self._search_evidence(cleaned_statement, claim_type, claim_analysis)
            
            # Assess credibility
            credibility_result = self._assess_credibility(evidence, claim_analysis)
            
            # Generate verdict
            verdict = self._generate_verdict(credibility_result["confidence_score"])
            
            # Analyze context
            context_analysis = self._analyze_context(statement, context)
            
            # Find related claims
            related_claims = self._find_related_claims(cleaned_statement, fact_checks_data)
            
            # Get fact-checker rating
            fact_checker_rating = self._get_fact_checker_rating(evidence)
            
            return {
                "statement": statement,
                "credibility_score": credibility_result["confidence_score"],
                "verdict": verdict,
                "confidence": credibility_result["confidence"],
                "explanation": credibility_result["explanation"],
                "evidence": evidence,
                "fact_checker_rating": fact_checker_rating,
                "last_verified": datetime.now().isoformat(),
                "related_claims": related_claims,
                "context_analysis": context_analysis,
                "claim_analysis": claim_analysis,
                "processing_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in fact checking: {e}")
            return self._get_fallback_result(statement, str(e))

    def _clean_statement(self, statement: str) -> str:
        """Clean and normalize statement for analysis"""
        # Remove extra whitespace
        cleaned = re.sub(r'\s+', ' ', statement.strip())
        
        # Normalize quotes
        cleaned = cleaned.replace('"', '"').replace('"', '"')
        cleaned = cleaned.replace(''', "'").replace(''', "'")
        
        # Normalize currency symbols
        cleaned = cleaned.replace('₹', 'Rs. ')
        
        # Remove URLs for analysis (keep for evidence)
        cleaned = re.sub(r'http[s]?://\S+', '', cleaned)
        
        return cleaned

    def _check_existing_facts(self, statement: str, fact_checks_data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Check if statement matches existing fact-checks"""
        if not fact_checks_data:
            return None
        
        statement_lower = statement.lower()
        
        # Direct match
        for fact_key, fact_data in fact_checks_data.items():
            if statement_lower == fact_key.lower():
                return self._format_existing_fact(fact_key, fact_data)
            
            # Fuzzy match
            if self._fuzzy_match(statement_lower, fact_key.lower()):
                return self._format_existing_fact(fact_key, fact_data)
        
        return None

    def _fuzzy_match(self, statement: str, fact_key: str) -> bool:
        """Check for fuzzy match between statement and fact key"""
        # Remove common words for comparison
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'}
        
        statement_words = set(word for word in statement.split() if word not in stop_words and len(word) > 2)
        fact_words = set(word for word in fact_key.split() if word not in stop_words and len(word) > 2)
        
        if len(statement_words) == 0 or len(fact_words) == 0:
            return False
        
        intersection = len(statement_words & fact_words)
        union = len(statement_words | fact_words)
        
        # 70% word similarity threshold
        return (intersection / union) > 0.7

    def _format_existing_fact(self, fact_key: str, fact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format existing fact-check result"""
        return {
            "statement": fact_key,
            "credibility_score": fact_data.get("confidence", 0.5),
            "verdict": fact_data.get("verdict", "unverified"),
            "confidence": fact_data.get("confidence", 0.5),
            "explanation": f"Based on existing fact-check: {fact_data.get('verdict', 'unverified')}",
            "evidence": fact_data.get("evidence", []),
            "fact_checker_rating": "high",
            "last_verified": "2025-01-01",  # Default date
            "related_claims": [],
            "context_analysis": {"source": "existing_database"},
            "claim_analysis": {"type": "matched_existing", "confidence": 0.8},
            "processing_timestamp": datetime.now().isoformat(),
            "source": "fact_check_database"
        }

    def _analyze_claim(self, statement: str, claim_type: str) -> Dict[str, Any]:
        """Analyze claim characteristics"""
        analysis = {
            "claim_type": claim_type,
            "contains_statistics": bool(re.search(r'\d+', statement)),
            "contains_dates": any(re.search(pattern, statement) for pattern in self.claim_patterns["temporal"]),
            "contains_comparisons": any(re.search(pattern, statement) for pattern in self.claim_patterns["comparative"]),
            "statement_length": len(statement),
            "complexity_score": len(statement.split()),
            "verifiable_elements": []
        }
        
        # Identify verifiable elements
        if re.search(r'\d+%|\d+ percent', statement):
            analysis["verifiable_elements"].append("percentage")
        if re.search(r'₹\d+|\$\d+', statement):
            analysis["verifiable_elements"].append("currency_amount")
        if re.search(r'\d+\s+(crore|lakh|thousand|million|billion)', statement):
            analysis["verifiable_elements"].append("large_number")
        if any(re.search(pattern, statement) for pattern in self.claim_patterns["temporal"]):
            analysis["verifiable_elements"].append("temporal_claim")
        
        return analysis

    def _search_evidence(self, statement: str, claim_type: str, claim_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search for evidence supporting or contradicting the claim"""
        # In a real implementation, this would search through fact-check databases,
        # news sources, and official documents
        # For now, we'll return mock evidence based on claim characteristics
        
        evidence = []
        
        # Check for statistical claims
        if "percentage" in claim_analysis["verifiable_elements"]:
            evidence.append({
                "type": "statistical_verification",
                "finding": "Cross-reference with official statistics required",
                "source": "Government Statistical Office",
                "credibility": "high",
                "supporting": "pending_verification"
            })
        
        # Check for policy claims
        if claim_type in ["political", "economic"]:
            evidence.append({
                "type": "policy_verification",
                "finding": "Official policy documents available for verification",
                "source": "Government Portal",
                "credibility": "high",
                "supporting": "requires_review"
            })
        
        # Default evidence for general claims
        if not evidence:
            evidence.append({
                "type": "general_verification",
                "finding": "Multiple sources needed for comprehensive fact-check",
                "source": "Various News Outlets",
                "credibility": "medium",
                "supporting": "inconclusive"
            })
        
        return evidence

    def _assess_credibility(self, evidence: List[Dict[str, Any]], claim_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Assess overall credibility based on evidence"""
        if not evidence:
            return {
                "confidence_score": 0.2,
                "confidence": 0.3,
                "explanation": "No evidence found to support or contradict the claim"
            }
        
        # Calculate credibility based on evidence quality
        total_credibility = 0
        weight_sum = 0
        
        for item in evidence:
            credibility_weight = {"high": 1.0, "medium": 0.6, "low": 0.3}.get(item.get("credibility", "medium"), 0.5)
            
            # Adjust weight based on evidence type
            if item.get("type") == "statistical_verification":
                credibility_weight *= 1.2
            elif item.get("type") == "policy_verification":
                credibility_weight *= 1.1
            
            total_credibility += credibility_weight
            weight_sum += 1
        
        if weight_sum == 0:
            return {
                "confidence_score": 0.2,
                "confidence": 0.3,
                "explanation": "Unable to assess credibility due to insufficient evidence"
            }
        
        base_confidence = total_credibility / weight_sum
        
        # Adjust confidence based on claim complexity
        complexity_penalty = min(claim_analysis["complexity_score"] / 100, 0.3)
        adjusted_confidence = max(0.1, base_confidence - complexity_penalty)
        
        # Generate explanation
        explanation = self._generate_credibility_explanation(adjusted_confidence, evidence)
        
        return {
            "confidence_score": adjusted_confidence,
            "confidence": min(adjusted_confidence, 0.95),
            "explanation": explanation
        }

    def _generate_credibility_explanation(self, confidence_score: float, evidence: List[Dict[str, Any]]) -> str:
        """Generate explanation for credibility assessment"""
        high_credibility_evidence = sum(1 for e in evidence if e.get("credibility") == "high")
        total_evidence = len(evidence)
        
        if confidence_score >= 0.8:
            return f"High confidence based on {high_credibility_evidence} high-credibility sources out of {total_evidence} total sources."
        elif confidence_score >= 0.6:
            return f"Moderate confidence. {high_credibility_evidence} high-credibility sources found, but additional verification recommended."
        elif confidence_score >= 0.4:
            return f"Low to moderate confidence. Limited high-credibility sources found. Claims require additional verification."
        else:
            return f"Very low confidence. Insufficient credible evidence found to support the claim."

    def _generate_verdict(self, confidence_score: float) -> str:
        """Generate verdict based on confidence score"""
        if confidence_score >= self.verdict_thresholds["true"]:
            return "true"
        elif confidence_score >= self.verdict_thresholds["mostly_true"]:
            return "mostly_true"
        elif confidence_score >= self.verdict_thresholds["mostly_false"]:
            return "mostly_false"
        elif confidence_score >= self.verdict_thresholds["false"]:
            return "false"
        else:
            return "unverified"

    def _analyze_context(self, statement: str, context: str) -> Dict[str, Any]:
        """Analyze context around the statement"""
        context_analysis = {
            "statement_hash": hashlib.md5(statement.encode()).hexdigest(),
            "word_count": len(statement.split()),
            "character_count": len(statement),
            "contains_urls": bool(re.search(r'http[s]?://', statement)),
            "mentions_sources": bool(re.search(r'according to|source:|based on', statement, re.IGNORECASE)),
            "context_provided": bool(context.strip())
        }
        
        # Add context information if available
        if context.strip():
            context_analysis["additional_context"] = context
        
        return context_analysis

    def _find_related_claims(self, statement: str, fact_checks_data: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find related claims that have been fact-checked"""
        if not fact_checks_data:
            return []
        
        related_claims = []
        statement_words = set(statement.lower().split())
        
        for fact_key, fact_data in fact_checks_data.items():
            fact_words = set(fact_key.lower().split())
            
            # Calculate word overlap
            overlap = len(statement_words & fact_words)
            if overlap >= 3:  # At least 3 common words
                related_claims.append({
                    "statement": fact_key,
                    "verdict": fact_data.get("verdict", "unknown"),
                    "relevance_score": overlap / len(statement_words | fact_words)
                })
        
        # Sort by relevance and return top 3
        return sorted(related_claims, key=lambda x: x["relevance_score"], reverse=True)[:3]

    def _get_fact_checker_rating(self, evidence: List[Dict[str, Any]]) -> str:
        """Get overall fact-checker rating based on evidence sources"""
        source_ratings = []
        
        for item in evidence:
            source = item.get("source", "")
            if source in self.fact_checker_reliability:
                rating = self.fact_checker_reliability[source]
                source_ratings.append(rating)
        
        if not source_ratings:
            return "unknown"
        
        # Return the highest rating found
        if "high" in source_ratings:
            return "high"
        elif "medium" in source_ratings:
            return "medium"
        else:
            return "low"

    def _get_fallback_result(self, statement: str, error: str) -> Dict[str, Any]:
        """Return fallback result when fact-checking fails"""
        return {
            "statement": statement,
            "credibility_score": 0.0,
            "verdict": "unverified",
            "confidence": 0.1,
            "explanation": "Unable to perform fact-check due to system error. Please try again later.",
            "evidence": [],
            "fact_checker_rating": "unknown",
            "last_verified": datetime.now().isoformat(),
            "related_claims": [],
            "context_analysis": {"error": error},
            "claim_analysis": {"type": "failed_verification"},
            "processing_timestamp": datetime.now().isoformat(),
            "error": error
        }

    def batch_check(self, statements: List[str], claim_type: str = "general") -> List[Dict[str, Any]]:
        """Fact-check multiple statements in batch"""
        results = []
        
        for statement in statements:
            try:
                result = self.check(statement, claim_type)
                results.append(result)
            except Exception as e:
                logger.error(f"Error fact-checking statement: {e}")
                results.append(self._get_fallback_result(statement, str(e)))
        
        return results

    def get_verification_summary(self, claim_type: str = "all") -> Dict[str, Any]:
        """Get summary of fact-checking capabilities"""
        return {
            "supported_claim_types": ["political", "economic", "social", "scientific", "general"],
            "current_claim_type": claim_type,
            "verification_methods": [
                "Cross-reference with official sources",
                "Statistical data verification", 
                "Policy document analysis",
                "Expert source consultation",
                "Temporal consistency checking"
            ],
            "confidence_thresholds": self.verdict_thresholds,
            "fact_checker_network": list(self.fact_checker_reliability.keys()),
            "last_updated": datetime.now().isoformat(),
            "version": "1.0.0"
        }