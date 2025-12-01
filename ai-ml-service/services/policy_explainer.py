import re
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class PolicyExplainer:
    """
    Policy explanation service that breaks down complex policies 
    into understandable language for citizens
    """
    
    def __init__(self):
        """Initialize policy explainer with knowledge base"""
        self.complexity_levels = {
            "simple": {
                "max_words": 100,
                "max_sentences": 3,
                "use_jargon": False,
                "include_examples": True
            },
            "detailed": {
                "max_words": 300,
                "max_sentences": 8,
                "use_jargon": True,
                "include_examples": True
            },
            "technical": {
                "max_words": 500,
                "max_sentences": 15,
                "use_jargon": True,
                "include_examples": False
            }
        }
        
        # Policy impact assessment categories
        self.impact_categories = {
            "economic": ["GDP growth", "Employment", "Investment", "Inflation", "Tax revenue"],
            "social": ["Education", "Healthcare", "Poverty", "Inequality", "Social welfare"],
            "environmental": ["Pollution", "Climate change", "Natural resources", "Biodiversity"],
            "technological": ["Digital infrastructure", "Innovation", "Research", "Automation"],
            "political": ["Governance", "Transparency", "Democracy", "Federalism"]
        }

    def explain(self, policy_name: str, user_question: str, complexity_level: str = "simple", 
                policies_data: Dict[str, Any] = None, language: str = "en") -> Dict[str, Any]:
        """
        Explain a policy based on user question
        
        Args:
            policy_name: Name of the policy
            user_question: User's specific question about the policy
            complexity_level: Explanation complexity (simple, detailed, technical)
            policies_data: Available policies data
            language: Language for explanation
            
        Returns:
            Dict with explanation and related information
        """
        try:
            # Validate complexity level
            if complexity_level not in self.complexity_levels:
                complexity_level = "simple"
            
            # Get policy information
            policy_info = self._get_policy_info(policy_name, policies_data)
            
            # Generate explanation
            explanation = self._generate_explanation(
                policy_info, user_question, complexity_level, language
            )
            
            # Extract key points
            key_points = self._extract_key_points(policy_info, user_question)
            
            # Assess impact
            impact_assessment = self._assess_policy_impact(policy_info, user_question)
            
            # Generate pros and cons
            pros_and_cons = self._generate_pros_and_cons(policy_info, user_question)
            
            # Find related policies
            related_policies = self._find_related_policies(policy_name, policies_data)
            
            # Calculate confidence
            confidence = self._calculate_explanation_confidence(policy_info, user_question)
            
            # Get sources
            sources = self._get_policy_sources(policy_name, policy_info)
            
            return {
                "policy_name": policy_name,
                "explanation": explanation,
                "key_points": key_points,
                "impact_assessment": impact_assessment,
                "pros_and_cons": pros_and_cons,
                "related_policies": related_policies,
                "complexity_level": complexity_level,
                "confidence": confidence,
                "sources": sources,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in policy explanation: {e}")
            return self._get_fallback_explanation(policy_name, user_question, str(e))

    def _get_policy_info(self, policy_name: str, policies_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Get policy information from data source"""
        if not policies_data:
            return self._get_mock_policy_info(policy_name)
        
        # Try exact match
        if policy_name in policies_data:
            return policies_data[policy_name]
        
        # Try fuzzy match
        normalized_name = policy_name.lower().strip()
        for name, info in policies_data.items():
            if normalized_name in name.lower() or name.lower() in normalized_name:
                return info
        
        # Return mock data if no match found
        return self._get_mock_policy_info(policy_name)

    def _get_mock_policy_info(self, policy_name: str) -> Dict[str, Any]:
        """Return mock policy information for development"""
        mock_policies = {
            "digital india": {
                "full_name": "Digital India Programme",
                "description": "Government flagship programme for inclusive growth",
                "launch_year": "2015",
                "budget": "₹1,13,000 crores",
                "objectives": [
                    "Digital Infrastructure Development",
                    "Digital Literacy",
                    "Digital Service Delivery"
                ],
                "beneficiaries": [
                    "Citizens", "Businesses", "Government Departments",
                    "Educational Institutions", "Healthcare Providers"
                ],
                "key_components": [
                    "Broadband for All",
                    "Digital Locker",
                    "e-Governance Platform",
                    "Mobile Governance"
                ],
                "impact_metrics": [
                    "2.5 lakh gram panchayats connected",
                    "65% increase in internet users",
                    "130 crore digital transactions monthly"
                ]
            },
            "ayushman bharat": {
                "full_name": "Ayushman Bharat Programme",
                "description": "World's largest government healthcare programme",
                "launch_year": "2018",
                "budget": "₹64,180 crores",
                "objectives": [
                    "Health Insurance Coverage",
                    "Primary Healthcare Strengthening",
                    "Digital Health Platform"
                ],
                "beneficiaries": [
                    "Poor Families", "Vulnerable Groups", "Senior Citizens",
                    "Rural Population", "Urban Poor"
                ],
                "key_components": [
                    "Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
                    "Health and Wellness Centres",
                    "Digital Health ID"
                ],
                "impact_metrics": [
                    "50+ crore beneficiaries",
                    "3 crore hospital admissions",
                    "1.5 lakh hospitals empanelled"
                ]
            },
            "swachh bharat": {
                "full_name": "Swachh Bharat Mission",
                "description": "Nation-wide cleanliness campaign",
                "launch_year": "2014",
                "budget": "₹62,000 crores",
                "objectives": [
                    "Waste Management",
                    "Sanitation Infrastructure",
                    "Behavior Change Communication"
                ],
                "beneficiaries": [
                    "Rural Population", "Urban Communities", "Schools",
                    "Public Places", "Religious Sites"
                ],
                "key_components": [
                    "Construction of Toilets",
                    "Solid Waste Management",
                    "Awareness Campaigns"
                ],
                "impact_metrics": [
                    "10 crore toilets built",
                    "100% rural sanitation coverage",
                    "4.5 lakh villages declared ODF"
                ]
            }
        }
        
        policy_key = policy_name.lower().strip()
        return mock_policies.get(policy_key, {
            "full_name": policy_name,
            "description": f"Information about {policy_name} policy",
            "launch_year": "2020",
            "budget": "₹10,000 crores",
            "objectives": ["Improve citizen welfare", "Enhance service delivery"],
            "beneficiaries": ["Citizens", "Government"],
            "key_components": ["Implementation", "Monitoring"],
            "impact_metrics": ["Under assessment"]
        })

    def _generate_explanation(self, policy_info: Dict[str, Any], user_question: str, 
                             complexity_level: str, language: str) -> str:
        """Generate policy explanation based on user question and complexity"""
        config = self.complexity_levels[complexity_level]
        
        # Extract relevant information based on question
        question_context = self._analyze_question_context(user_question)
        
        explanation_parts = []
        
        # Basic explanation
        explanation_parts.append(f"The {policy_info.get('full_name', 'Policy')} is a {policy_info.get('description', 'government initiative')}.")
        
        # Add objectives if relevant
        if any(keyword in user_question.lower() for keyword in ['why', 'what for', 'objective', 'goal']):
            objectives = policy_info.get('objectives', [])
            if objectives:
                if complexity_level == "simple":
                    explanation_parts.append(f"It aims to {objectives[0].lower()}.")
                else:
                    explanation_parts.append(f"Its main objectives include: {', '.join(objectives[:3])}.")
        
        # Add beneficiary information if asked
        if any(keyword in user_question.lower() for keyword in ['who', 'beneficiary', 'help', 'for whom']):
            beneficiaries = policy_info.get('beneficiaries', [])
            if beneficiaries:
                if complexity_level == "simple":
                    explanation_parts.append(f"It helps {', '.join(beneficiaries[:2]).lower()}.")
                else:
                    explanation_parts.append(f"Key beneficiaries include: {', '.join(beneficiaries[:4])}.")
        
        # Add budget information if relevant
        if any(keyword in user_question.lower() for keyword in ['cost', 'budget', 'money', 'expense']):
            budget = policy_info.get('budget', '')
            if budget:
                explanation_parts.append(f"The allocated budget is {budget}.")
        
        # Add impact if asked
        if any(keyword in user_question.lower() for keyword in ['impact', 'result', 'effect', 'outcome']):
            impact_metrics = policy_info.get('impact_metrics', [])
            if impact_metrics:
                if complexity_level == "simple":
                    explanation_parts.append(f"So far, it has achieved: {impact_metrics[0]}.")
                else:
                    explanation_parts.append(f"Key impacts include: {'; '.join(impact_metrics[:2])}.")
        
        # Combine explanation
        explanation = ' '.join(explanation_parts)
        
        # Apply complexity constraints
        if complexity_level == "simple":
            # Simplify language
            explanation = self._simplify_language(explanation)
        
        return explanation

    def _analyze_question_context(self, question: str) -> Dict[str, str]:
        """Analyze question to understand what user wants to know"""
        question_lower = question.lower()
        
        context = {
            "focus": "general",
            "aspect": "overview"
        }
        
        # Identify focus
        if any(word in question_lower for word in ['what', 'overview', 'about']):
            context["focus"] = "overview"
        elif any(word in question_lower for word in ['why', 'purpose', 'reason']):
            context["focus"] = "purpose"
        elif any(word in question_lower for word in ['how', 'mechanism', 'process']):
            context["focus"] = "implementation"
        elif any(word in question_lower for word in ['impact', 'result', 'effect']):
            context["focus"] = "impact"
        elif any(word in question_lower for word in ['cost', 'budget', 'money']):
            context["focus"] = "financial"
        
        return context

    def _simplify_language(self, text: str) -> str:
        """Simplify complex language for basic explanations"""
        simplifications = {
            "implement": "put into action",
            "infrastructure": "basic facilities",
            "comprehensive": "complete",
            "initiative": "program",
            "strengthening": "improving",
            "enhancing": "making better",
            "facilitate": "help",
            "allocate": "set aside",
            "beneficiary": "person who benefits",
            "empanelled": "officially included"
        }
        
        for complex_word, simple_word in simplifications.items():
            text = text.replace(complex_word, simple_word)
        
        return text

    def _extract_key_points(self, policy_info: Dict[str, Any], user_question: str) -> List[str]:
        """Extract key points relevant to user's question"""
        points = []
        
        # Basic policy info
        points.append(f"Policy: {policy_info.get('full_name', 'N/A')}")
        points.append(f"Launched: {policy_info.get('launch_year', 'N/A')}")
        
        # Objectives
        objectives = policy_info.get('objectives', [])
        if objectives:
            points.append(f"Main goals: {', '.join(objectives[:2])}")
        
        # Budget
        budget = policy_info.get('budget', '')
        if budget:
            points.append(f"Budget: {budget}")
        
        # Beneficiaries
        beneficiaries = policy_info.get('beneficiaries', [])
        if beneficiaries:
            points.append(f"Who it helps: {', '.join(beneficiaries[:3])}")
        
        # Impact
        impact_metrics = policy_info.get('impact_metrics', [])
        if impact_metrics:
            points.append(f"Key results: {impact_metrics[0]}")
        
        return points[:5]  # Limit to 5 key points

    def _assess_policy_impact(self, policy_info: Dict[str, Any], user_question: str) -> Dict[str, Any]:
        """Assess policy impact across different categories"""
        impact = {
            "overall_score": 0.7,  # Default moderate impact
            "categories": {},
            "regional_coverage": "National",
            "timeline": policy_info.get('launch_year', '2020') + " - Ongoing",
            "success_indicators": []
        }
        
        # Categorize impact based on policy name
        policy_name = policy_info.get('full_name', '').lower()
        
        if 'digital' in policy_name or 'technology' in policy_name:
            impact["categories"]["technological"] = 0.8
            impact["categories"]["economic"] = 0.7
            impact["overall_score"] = 0.75
        elif 'health' in policy_name or 'ayushman' in policy_name:
            impact["categories"]["social"] = 0.9
            impact["categories"]["economic"] = 0.6
            impact["overall_score"] = 0.75
        elif 'clean' in policy_name or 'swachh' in policy_name:
            impact["categories"]["environmental"] = 0.8
            impact["categories"]["social"] = 0.8
            impact["overall_score"] = 0.8
        
        # Add impact metrics if available
        impact_metrics = policy_info.get('impact_metrics', [])
        if impact_metrics:
            impact["success_indicators"] = impact_metrics[:3]
        
        return impact

    def _generate_pros_and_cons(self, policy_info: Dict[str, Any], user_question: str) -> Dict[str, List[str]]:
        """Generate pros and cons based on policy information"""
        policy_name = policy_info.get('full_name', '').lower()
        
        # Default pros and cons based on policy type
        if 'digital' in policy_name:
            pros = [
                "Improves digital infrastructure across India",
                "Increases digital literacy and adoption",
                "Facilitates online government services",
                "Creates employment opportunities in tech sector",
                "Reduces bureaucratic delays through digitization"
            ]
            cons = [
                "Requires significant infrastructure investment",
                "May increase digital divide in rural areas",
                "Needs continuous technology upgrades",
                "Privacy and security concerns with digital systems"
            ]
        elif 'health' in policy_name or 'ayushman' in policy_name:
            pros = [
                "Provides health insurance to poor families",
                "Reduces out-of-pocket medical expenses",
                "Improves access to quality healthcare",
                "Strengthens hospital infrastructure",
                "Promotes preventive healthcare"
            ]
            cons = [
                "High implementation costs",
                "Potential for insurance fraud",
                "May strain existing healthcare resources",
                "Complex claim processing procedures"
            ]
        elif 'clean' in policy_name or 'swachh' in policy_name:
            pros = [
                "Improves public health and hygiene",
                "Reduces waterborne diseases",
                "Creates employment in waste management",
                "Enhances tourism potential",
                "Promotes environmental consciousness"
            ]
            cons = [
                "Requires behavioral change from citizens",
                "High maintenance costs for infrastructure",
                "May face implementation challenges in rural areas",
                "Needs continuous monitoring and evaluation"
            ]
        else:
            pros = [
                "Addresses important social need",
                "Improves citizen welfare",
                "Supports government development goals",
                "Creates positive social impact"
            ]
            cons = [
                "Implementation challenges",
                "Requires coordination across agencies",
                "May face budget constraints",
                "Long-term sustainability concerns"
            ]
        
        return {
            "pros": pros[:4],  # Limit to 4 items
            "cons": cons[:4]
        }

    def _find_related_policies(self, policy_name: str, policies_data: Optional[Dict[str, Any]]) -> List[str]:
        """Find policies related to the given policy"""
        if not policies_data:
            return self._get_default_related_policies(policy_name)
        
        related = []
        policy_lower = policy_name.lower()
        
        # Find policies with shared keywords
        shared_keywords = ['digital', 'health', 'education', 'infrastructure', 'social']
        
        for name in policies_data.keys():
            if name != policy_lower:
                for keyword in shared_keywords:
                    if keyword in policy_lower and keyword in name.lower():
                        related.append(name.title())
                        break
        
        # Add some default related policies
        if 'digital' in policy_lower:
            related.extend(['Make in India', 'Startup India'])
        elif 'health' in policy_lower:
            related.extend(['National Health Mission', 'Pradhan Mantri Suraksha Bima'])
        elif 'clean' in policy_lower:
            related.extend(['National Rural Drinking Water Programme', 'Smart Cities Mission'])
        
        return list(set(related))[:5]  # Remove duplicates and limit

    def _get_default_related_policies(self, policy_name: str) -> List[str]:
        """Return default related policies"""
        policy_lower = policy_name.lower()
        
        if 'digital' in policy_lower:
            return ['Make in India', 'Startup India', 'Skill India']
        elif 'health' in policy_lower:
            return ['National Health Mission', 'Pradhan Mantri Suraksha Bima']
        elif 'clean' in policy_lower:
            return ['Smart Cities Mission', 'National Rural Drinking Water Programme']
        else:
            return ['Make in India', 'Skill India', 'Startup India']

    def _calculate_explanation_confidence(self, policy_info: Dict[str, Any], user_question: str) -> float:
        """Calculate confidence in the explanation"""
        confidence = 0.5  # Base confidence
        
        # Boost confidence based on available information
        if policy_info.get('description'):
            confidence += 0.1
        if policy_info.get('objectives'):
            confidence += 0.1
        if policy_info.get('budget'):
            confidence += 0.1
        if policy_info.get('impact_metrics'):
            confidence += 0.1
        if policy_info.get('beneficiaries'):
            confidence += 0.1
        
        # Adjust based on question specificity
        if len(user_question) > 50:
            confidence += 0.1
        
        return min(confidence, 0.95)

    def _get_policy_sources(self, policy_name: str, policy_info: Dict[str, Any]) -> List[str]:
        """Get sources for policy information"""
        sources = [
            f"Government of India - {policy_info.get('full_name', policy_name)}",
            "Ministry concerned with the policy implementation",
            "NITI Aayog Policy Documents"
        ]
        
        # Add year-specific sources
        launch_year = policy_info.get('launch_year')
        if launch_year:
            sources.append(f"Annual Report {launch_year}")
        
        return sources

    def _get_fallback_explanation(self, policy_name: str, user_question: str, error: str) -> Dict[str, Any]:
        """Return fallback explanation when processing fails"""
        return {
            "policy_name": policy_name,
            "explanation": f"I'm unable to provide detailed information about {policy_name} at the moment. Please try rephrasing your question or contact the relevant government department for official information.",
            "key_points": [
                f"Policy: {policy_name}",
                "Official information should be verified from government sources"
            ],
            "impact_assessment": {
                "overall_score": 0.0,
                "categories": {},
                "status": "Information unavailable"
            },
            "pros_and_cons": {
                "pros": ["Requires official verification"],
                "cons": ["Information not available in current system"]
            },
            "related_policies": ["Make in India", "Skill India"],
            "complexity_level": "simple",
            "confidence": 0.1,
            "sources": ["Government Official Sources"],
            "error": error,
            "generated_at": datetime.now().isoformat()
        }