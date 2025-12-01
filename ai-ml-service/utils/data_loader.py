import json
import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def load_policies_data(file_path: str = "data/policies.json") -> Dict[str, Any]:
    """
    Load policies data from JSON file
    
    Args:
        file_path: Path to policies data file
        
    Returns:
        Dict containing policies information
    """
    try:
        # Try to load from file
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            logger.warning(f"Policies file not found at {file_path}, using default data")
            return get_default_policies_data()
            
    except Exception as e:
        logger.error(f"Error loading policies data: {e}")
        return get_default_policies_data()

def load_fact_checks_data(file_path: str = "data/fact_checks.json") -> Dict[str, Any]:
    """
    Load fact-checks data from JSON file
    
    Args:
        file_path: Path to fact-checks data file
        
    Returns:
        Dict containing fact-checks information
    """
    try:
        # Try to load from file
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            logger.warning(f"Fact-checks file not found at {file_path}, using default data")
            return get_default_fact_checks_data()
            
    except Exception as e:
        logger.error(f"Error loading fact-checks data: {e}")
        return get_default_fact_checks_data()

def save_policies_data(data: Dict[str, Any], file_path: str = "data/policies.json") -> bool:
    """
    Save policies data to JSON file
    
    Args:
        data: Policies data to save
        file_path: Target file path
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Policies data saved to {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error saving policies data: {e}")
        return False

def save_fact_checks_data(data: Dict[str, Any], file_path: str = "data/fact_checks.json") -> bool:
    """
    Save fact-checks data to JSON file
    
    Args:
        data: Fact-checks data to save
        file_path: Target file path
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Fact-checks data saved to {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error saving fact-checks data: {e}")
        return False

def get_default_policies_data() -> Dict[str, Any]:
    """
    Return default policies data for development
    
    Returns:
        Dict containing sample policies data
    """
    return {
        "Digital India Programme": {
            "full_name": "Digital India Programme",
            "description": "Government flagship programme for inclusive growth through digital technology",
            "launch_year": "2015",
            "budget": "₹1,13,000 crores",
            "objectives": [
                "Digital Infrastructure Development - Connect all gram panchayats with high-speed internet",
                "Digital Literacy - Make at least one person in each household digitally literate",
                "Digital Service Delivery - Make all government services available online"
            ],
            "beneficiaries": [
                "Rural and urban citizens",
                "Small and medium enterprises",
                "Government departments",
                "Educational institutions",
                "Healthcare providers"
            ],
            "key_components": [
                "Broadband for All - Connect 2.5 lakh gram panchayats",
                "Digital Locker - Secure cloud-based personal document storage",
                "e-Governance Platform - Unified platform for government services",
                "Mobile Governance - Government services through mobile applications"
            ],
            "impact_metrics": [
                "2.5 lakh gram panchayats connected with broadband",
                "65% increase in internet users in rural areas",
                "130 crore digital transactions monthly through UPI",
                "Digital literacy program reached 4 crore people"
            ],
            "implementation_status": "Ongoing",
            "related_policies": [
                "Make in India",
                "Startup India", 
                "Skill India",
                "Smart Cities Mission"
            ],
            "ministry": "Ministry of Electronics and Information Technology",
            "website": "https://digitalindia.gov.in"
        },
        "Ayushman Bharat Programme": {
            "full_name": "Ayushman Bharat Programme",
            "description": "World's largest government healthcare programme providing health insurance to poor families",
            "launch_year": "2018",
            "budget": "₹64,180 crores",
            "objectives": [
                "Health Insurance Coverage - Provide ₹5 lakh annual health cover to poor families",
                "Primary Healthcare Strengthening - Transform 1.5 lakh health sub-centres into Health and Wellness Centres",
                "Digital Health Platform - Create digital health ID for citizens"
            ],
            "beneficiaries": [
                "Poor families identified through SECC database",
                "Vulnerable groups including elderly and disabled",
                "Rural population lacking access to quality healthcare",
                "Urban poor working in unorganized sector"
            ],
            "key_components": [
                "Pradhan Mantri Jan Arogya Yojana (PM-JAY) - Health insurance scheme",
                "Health and Wellness Centres - Primary healthcare facilities",
                "Digital Health ID - Individual health records system",
                "Telemedicine Services - Remote healthcare consultation"
            ],
            "impact_metrics": [
                "50+ crore beneficiaries registered",
                "3 crore hospital admissions processed",
                "1.5 lakh hospitals empanelled",
                "₹45,000 crores claims processed"
            ],
            "implementation_status": "Ongoing",
            "related_policies": [
                "National Health Mission",
                "Pradhan Mantri Suraksha Bima",
                "Jan Dhan Yojana"
            ],
            "ministry": "Ministry of Health and Family Welfare",
            "website": "https://pmjay.gov.in"
        },
        "Swachh Bharat Mission": {
            "full_name": "Swachh Bharat Mission (SBM)",
            "description": "Nation-wide cleanliness campaign to achieve universal sanitation coverage",
            "launch_year": "2014",
            "budget": "₹62,000 crores",
            "objectives": [
                "Waste Management - Scientific solid and liquid waste management in rural and urban areas",
                "Sanitation Infrastructure - Construction of individual household toilets and community toilets",
                "Behavior Change Communication - Awareness campaigns for cleanliness and hygiene"
            ],
            "beneficiaries": [
                "Rural population across all villages",
                "Urban population in municipalities",
                "School children and teachers",
                "Communities around tourist and religious places"
            ],
            "key_components": [
                "Construction of toilets - Individual household latrines",
                "Solid Waste Management - Collection, segregation and disposal",
                "Liquid Waste Management - Drainage and sewage treatment",
                "Awareness and Behaviour Change - IEC activities"
            ],
            "impact_metrics": [
                "10 crore individual household toilets constructed",
                "100% rural sanitation coverage achieved",
                "4.5 lakh villages declared Open Defecation Free (ODF)",
                "Significant reduction in waterborne diseases"
            ],
            "implementation_status": "Completed",
            "related_policies": [
                "National Rural Drinking Water Programme",
                "National Urban Livelihoods Mission",
                "Smart Cities Mission"
            ],
            "ministry": "Ministry of Jal Shakti",
            "website": "https://swachhbharatmission.gov.in"
        },
        "Make in India": {
            "full_name": "Make in India Initiative",
            "description": "National programme designed to facilitate investment, foster innovation and build best-in-class manufacturing infrastructure",
            "launch_year": "2014",
            "budget": "₹4,000 crores",
            "objectives": [
                "Increase manufacturing GDP contribution to 25% by 2022",
                "Create 100 million manufacturing jobs by 2022",
                "Create global manufacturing brand 'Made in India'"
            ],
            "beneficiaries": [
                "Manufacturing companies",
                "MSMEs and startups",
                "Skilled workforce",
                "Foreign investors"
            ],
            "key_components": [
                "Sector-specific policies for 25 sectors",
                "Ease of doing business reforms",
                "Foreign Direct Investment liberalization",
                "Skilled workforce development"
            ],
            "impact_metrics": [
                "FDI inflow increased significantly",
                "Manufacturing PMI improved",
                "Export growth in manufacturing sectors",
                "Job creation in manufacturing"
            ],
            "implementation_status": "Ongoing",
            "related_policies": [
                "Digital India",
                "Startup India",
                "Skill India",
                "Trade Policy"
            ],
            "ministry": "Department of Industrial Policy and Promotion",
            "website": "https://makeinindia.com"
        }
    }

def get_default_fact_checks_data() -> Dict[str, Any]:
    """
    Return default fact-checks data for development
    
    Returns:
        Dict containing sample fact-checks data
    """
    return {
        "Digital India impact on rural internet usage": {
            "verdict": "mostly_true",
            "confidence": 0.85,
            "evidence": [
                {
                    "source": "NITI Aayog Annual Report 2024",
                    "finding": "60% increase in rural internet usage from 2015 to 2024",
                    "credibility": "high",
                    "date": "2024-03-15"
                },
                {
                    "source": "MeitY Annual Report 2024",
                    "finding": "2.5 lakh gram panchayats connected with broadband as of December 2023",
                    "credibility": "high",
                    "date": "2024-01-31"
                },
                {
                    "source": "TRAI Performance Indicators Report",
                    "finding": "Rural broadband penetration increased from 14% to 67%",
                    "credibility": "high",
                    "date": "2024-02-28"
                }
            ],
            "context": "Based on official government data and telecom regulator reports",
            "last_verified": "2024-03-20",
            "tags": ["Digital India", "Rural Development", "Telecommunications"]
        },
        "Swachh Bharat Mission budget allocation": {
            "verdict": "true",
            "confidence": 0.95,
            "evidence": [
                {
                    "source": "Union Budget Documents 2024-25",
                    "finding": "Total allocation of ₹62,000 crores confirmed for Swachh Bharat Mission",
                    "credibility": "high",
                    "date": "2024-02-01"
                },
                {
                    "source": "Comptroller and Auditor General Report",
                    "finding": "Funds allocated and utilized as per approved budget",
                    "credibility": "high",
                    "date": "2023-12-15"
                }
            ],
            "context": "Official government budget documents and CAG reports",
            "last_verified": "2024-02-01",
            "tags": ["Swachh Bharat", "Budget", "Government Spending"]
        },
        "Ayushman Bharat beneficiary numbers 2024": {
            "verdict": "mostly_true",
            "confidence": 0.78,
            "evidence": [
                {
                    "source": "National Health Authority Official Data",
                    "finding": "50+ crore beneficiaries registered as of December 2023",
                    "credibility": "high",
                    "date": "2024-01-15"
                },
                {
                    "source": "Independent Audit by IIM Ahmedabad",
                    "finding": "Approximately 2-3% duplicate entries identified in beneficiary database",
                    "credibility": "medium",
                    "date": "2023-11-30"
                }
            ],
            "context": "Official NHA data with independent audit confirmation of some duplicates",
            "last_verified": "2024-01-15",
            "tags": ["Ayushman Bharat", "Healthcare", "Government Schemes"]
        },
        "PM Kisan scheme beneficiary count": {
            "verdict": "true",
            "confidence": 0.92,
            "evidence": [
                {
                    "source": "Ministry of Agriculture and Farmers Welfare",
                    "finding": "11 crore farmer families registered as of January 2024",
                    "credibility": "high",
                    "date": "2024-01-20"
                },
                {
                    "source": "Public Financial Management System",
                    "finding": "Direct benefit transfer records confirm payments to verified beneficiaries",
                    "credibility": "high",
                    "date": "2024-01-25"
                }
            ],
            "context": "Official government records with cross-verification through payment systems",
            "last_verified": "2024-01-25",
            "tags": ["PM Kisan", "Agriculture", "Farmer Welfare"]
        },
        "COVID-19 vaccination numbers India": {
            "verdict": "true",
            "confidence": 0.88,
            "evidence": [
                {
                    "source": "Ministry of Health and Family Welfare",
                    "finding": "220 crore vaccine doses administered as of December 2023",
                    "credibility": "high",
                    "date": "2024-01-01"
                },
                {
                    "source": "WHO Situation Reports",
                    "finding": "India ranks among top countries in vaccination coverage",
                    "credibility": "high",
                    "date": "2023-12-31"
                }
            ],
            "context": "Official government vaccination data corroborated with WHO reports",
            "last_verified": "2024-01-01",
            "tags": ["COVID-19", "Vaccination", "Public Health"]
        },
        "India GDP growth rate 2023-24": {
            "verdict": "mostly_true",
            "confidence": 0.82,
            "evidence": [
                {
                    "source": "Ministry of Statistics and Programme Implementation",
                    "finding": "GDP growth rate of 7.2% for FY 2023-24 (provisional estimates)",
                    "credibility": "high",
                    "date": "2024-02-28"
                },
                {
                    "source": "Reserve Bank of India Monetary Policy Statement",
                    "finding": "Economic growth projections align with government estimates",
                    "credibility": "high",
                    "date": "2024-02-08"
                }
            ],
            "context": "Official statistical data with central bank validation",
            "last_verified": "2024-02-28",
            "tags": ["GDP", "Economic Growth", "Statistics"]
        }
    }

def update_policies_data(new_policies: Dict[str, Any], file_path: str = "data/policies.json") -> bool:
    """
    Update policies data with new entries
    
    Args:
        new_policies: New policies to add
        file_path: Target file path
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Load existing data
        existing_data = load_policies_data(file_path)
        
        # Merge new policies
        existing_data.update(new_policies)
        
        # Save updated data
        return save_policies_data(existing_data, file_path)
        
    except Exception as e:
        logger.error(f"Error updating policies data: {e}")
        return False

def update_fact_checks_data(new_fact_checks: Dict[str, Any], file_path: str = "data/fact_checks.json") -> bool:
    """
    Update fact-checks data with new entries
    
    Args:
        new_fact_checks: New fact-checks to add
        file_path: Target file path
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Load existing data
        existing_data = load_fact_checks_data(file_path)
        
        # Merge new fact-checks
        existing_data.update(new_fact_checks)
        
        # Save updated data
        return save_fact_checks_data(existing_data, file_path)
        
    except Exception as e:
        logger.error(f"Error updating fact-checks data: {e}")
        return False

def get_data_statistics(file_path: str) -> Dict[str, Any]:
    """
    Get statistics about data file
    
    Args:
        file_path: Path to data file
        
    Returns:
        Dict containing data statistics
    """
    try:
        if not os.path.exists(file_path):
            return {"error": "File not found"}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if "policies" in file_path:
            return {
                "type": "policies",
                "total_policies": len(data),
                "categories": list(set(policy.get("category", "General") for policy in data.values())),
                "launch_years": list(set(policy.get("launch_year", "Unknown") for policy in data.values())),
                "file_size": os.path.getsize(file_path),
                "last_modified": os.path.getmtime(file_path)
            }
        elif "fact_checks" in file_path:
            verdicts = [check.get("verdict", "unknown") for check in data.values()]
            return {
                "type": "fact_checks",
                "total_claims": len(data),
                "verdict_distribution": {verdict: verdicts.count(verdict) for verdict in set(verdicts)},
                "confidence_range": {
                    "min": min(check.get("confidence", 0) for check in data.values()),
                    "max": max(check.get("confidence", 0) for check in data.values()),
                    "average": sum(check.get("confidence", 0) for check in data.values()) / len(data)
                },
                "file_size": os.path.getsize(file_path),
                "last_modified": os.path.getmtime(file_path)
            }
        else:
            return {
                "type": "unknown",
                "total_entries": len(data),
                "file_size": os.path.getsize(file_path),
                "last_modified": os.path.getmtime(file_path)
            }
            
    except Exception as e:
        logger.error(f"Error getting data statistics: {e}")
        return {"error": str(e)}