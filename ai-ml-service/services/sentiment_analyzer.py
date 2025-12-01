import re
import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """
    Advanced sentiment analysis for public opinion and citizen feedback
    Supports multiple languages and context-aware analysis
    """
    
    def __init__(self):
        """Initialize sentiment analyzer with keyword dictionaries"""
        # Positive sentiment keywords
        self.positive_keywords = {
            'general': [
                'good', 'great', 'excellent', 'wonderful', 'fantastic', 'amazing', 'awesome',
                'positive', 'support', 'agree', 'yes', 'approve', 'accept', 'happy', 'pleased',
                'beneficial', 'helpful', 'useful', 'effective', 'successful', 'progress', 'improvement'
            ],
            'political': [
                'democracy', 'freedom', 'rights', 'justice', 'equality', 'development', 'growth',
                'prosperity', 'reform', 'change', 'hope', 'vision', 'leadership', 'governance'
            ],
            'economic': [
                'profit', 'wealth', 'rich', 'affordable', 'cost-effective', 'investment', 'returns',
                'economic growth', 'job creation', 'business success', 'financial stability'
            ]
        }
        
        # Negative sentiment keywords
        self.negative_keywords = {
            'general': [
                'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'disappointing', 'frustrating',
                'negative', 'oppose', 'disagree', 'no', 'reject', 'angry', 'disgusted', 'worried',
                'harmful', 'useless', 'ineffective', 'failure', 'decline', 'worsen', 'problem'
            ],
            'political': [
                'corruption', 'scam', 'controversy', 'scandal', 'mismanagement', 'inefficiency',
                'bias', 'discrimination', 'oppression', 'injustice', 'violation', 'abuse'
            ],
            'economic': [
                'loss', 'debt', 'expensive', 'costly', 'inflation', 'recession', 'unemployment',
                'poverty', 'inequality', 'burden', 'tax', 'fee', 'corruption in spending'
            ]
        }
        
        # Emotion indicators
        self.emotion_keywords = {
            'joy': ['happy', 'joy', 'celebrate', 'excited', 'thrilled', 'delighted'],
            'sadness': ['sad', 'depressed', 'grief', 'disappointed', 'heartbroken', 'tragic'],
            'anger': ['angry', 'furious', 'rage', 'mad', 'irritated', 'annoyed', 'outraged'],
            'fear': ['afraid', 'scared', 'worried', 'anxious', 'concerned', 'nervous', 'terror'],
            'surprise': ['surprised', 'shocked', 'amazed', 'unexpected', 'astonished', 'bewildered']
        }
        
        # Political tendency keywords
        self.political_tendencies = {
            'left': ['socialism', 'welfare', 'government', 'public', 'social justice', 'equality'],
            'right': ['capitalism', 'private', 'market', 'freedom', 'individual', 'conservative'],
            'center': ['balanced', 'moderate', 'pragmatic', 'practical', 'reform']
        }
        
        # Urgency indicators
        self.urgency_indicators = {
            'high': ['urgent', 'immediate', 'critical', 'emergency', 'crisis', 'asap', 'quickly'],
            'medium': ['important', 'significant', 'serious', 'necessary', 'soon'],
            'low': ['consider', 'think about', 'eventually', 'someday', 'future']
        }

    def analyze(self, text: str, context: str = "general", language: str = "en") -> Dict[str, Any]:
        """
        Analyze sentiment of text with context awareness
        
        Args:
            text: Text to analyze
            context: Context (poll, petition, comment, news)
            language: Language code
            
        Returns:
            Dict with sentiment analysis results
        """
        try:
            # Clean and preprocess text
            cleaned_text = self._preprocess_text(text)
            
            # Get base sentiment scores
            sentiment_scores = self._calculate_sentiment_scores(cleaned_text)
            
            # Detect emotions
            emotions = self._detect_emotions(cleaned_text)
            
            # Determine political tendency
            political_tendency = self._analyze_political_tendency(cleaned_text)
            
            # Assess urgency
            urgency_level = self._assess_urgency(cleaned_text)
            
            # Extract topics
            topics = self._extract_topics(cleaned_text)
            
            # Context-specific adjustments
            sentiment_scores = self._apply_context_adjustments(sentiment_scores, context)
            
            # Calculate overall sentiment
            overall_sentiment = self._determine_overall_sentiment(sentiment_scores)
            
            # Calculate confidence based on keyword density and clarity
            confidence = self._calculate_confidence(cleaned_text, sentiment_scores)
            
            return {
                "overall_sentiment": overall_sentiment,
                "confidence": confidence,
                "emotions": emotions,
                "political_tendency": political_tendency,
                "urgency_level": urgency_level,
                "topics": topics,
                "sentiment_score": sentiment_scores["compound_score"],
                "raw_scores": sentiment_scores,
                "word_count": len(cleaned_text.split()),
                "context": context,
                "language": language
            }
            
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            # Return neutral sentiment on error
            return {
                "overall_sentiment": "neutral",
                "confidence": 0.0,
                "emotions": {"neutral": 1.0},
                "political_tendency": "neutral",
                "urgency_level": 0.5,
                "topics": [],
                "sentiment_score": 0.0,
                "raw_scores": {"positive": 0, "negative": 0, "neutral": 0, "compound_score": 0},
                "word_count": 0,
                "context": context,
                "language": language,
                "error": str(e)
            }

    def _preprocess_text(self, text: str) -> str:
        """Clean and preprocess text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Convert to lowercase for analysis
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove hashtags but keep the text
        text = re.sub(r'#(\w+)', r'\1', text)
        
        return text

    def _calculate_sentiment_scores(self, text: str) -> Dict[str, float]:
        """Calculate sentiment scores using keyword matching"""
        words = text.split()
        
        positive_score = 0
        negative_score = 0
        
        # Count positive keywords
        for category, keywords in self.positive_keywords.items():
            for keyword in keywords:
                positive_score += text.count(keyword)
        
        # Count negative keywords
        for category, keywords in self.negative_keywords.items():
            for keyword in keywords:
                negative_score += text.count(keyword)
        
        # Calculate percentages
        total_words = len(words)
        if total_words == 0:
            return {"positive": 0, "negative": 0, "neutral": 1, "compound_score": 0}
        
        positive_pct = positive_score / total_words * 100
        negative_pct = negative_score / total_words * 100
        
        # Calculate compound score (-1 to 1)
        compound_score = (positive_pct - negative_pct) / 100
        
        # Normalize compound score
        compound_score = max(-1, min(1, compound_score))
        
        neutral_pct = max(0, 100 - positive_pct - negative_pct)
        
        return {
            "positive": positive_pct,
            "negative": negative_pct,
            "neutral": neutral_pct,
            "compound_score": compound_score
        }

    def _detect_emotions(self, text: str) -> Dict[str, float]:
        """Detect emotions in the text"""
        emotions = {}
        total_words = len(text.split())
        
        if total_words == 0:
            return {"neutral": 1.0}
        
        for emotion, keywords in self.emotion_keywords.items():
            emotion_score = 0
            for keyword in keywords:
                emotion_score += text.count(keyword)
            
            emotions[emotion] = min(emotion_score / total_words * 100, 100)
        
        # Add neutral emotion
        emotions["neutral"] = max(0, 100 - sum(emotions.values()))
        
        # Normalize to sum to 100
        total_emotion_score = sum(emotions.values())
        if total_emotion_score > 0:
            emotions = {k: v / total_emotion_score * 100 for k, v in emotions.items()}
        
        return emotions

    def _analyze_political_tendency(self, text: str) -> str:
        """Analyze political tendency of the text"""
        scores = {"left": 0, "right": 0, "center": 0}
        
        for tendency, keywords in self.political_tendencies.items():
            for keyword in keywords:
                scores[tendency] += text.count(keyword)
        
        if max(scores.values()) == 0:
            return "neutral"
        
        return max(scores, key=scores.get)

    def _assess_urgency(self, text: str) -> float:
        """Assess urgency level (0 to 1)"""
        urgency_scores = {"high": 0, "medium": 0, "low": 0}
        
        for level, indicators in self.urgency_indicators.items():
            for indicator in indicators:
                urgency_scores[level] += text.count(indicator)
        
        # Calculate weighted urgency
        weighted_urgency = (
            urgency_scores["high"] * 1.0 +
            urgency_scores["medium"] * 0.6 +
            urgency_scores["low"] * 0.3
        )
        
        # Normalize to 0-1 scale
        max_urgency = max(urgency_scores.values())
        if max_urgency == 0:
            return 0.3  # Default medium-low urgency
        
        return min(weighted_urgency / max_urgency, 1.0)

    def _extract_topics(self, text: str) -> List[str]:
        """Extract main topics from text"""
        # Define topic keywords
        topic_keywords = {
            'politics': ['government', 'policy', 'election', 'politician', 'parliament', 'democracy'],
            'economy': ['economy', 'economic', 'business', 'trade', 'market', 'finance', 'money'],
            'healthcare': ['health', 'medical', 'hospital', 'doctor', 'medicine', 'treatment'],
            'education': ['education', 'school', 'college', 'university', 'student', 'teacher'],
            'environment': ['environment', 'climate', 'pollution', 'green', 'sustainability', 'nature'],
            'technology': ['technology', 'digital', 'internet', 'computer', 'software', 'ai'],
            'infrastructure': ['infrastructure', 'road', 'transport', 'railway', 'airport', 'bridge'],
            'social': ['social', 'community', 'family', 'society', 'culture', 'tradition']
        }
        
        topics = []
        text_lower = text.lower()
        
        for topic, keywords in topic_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    topics.append(topic)
                    break  # Only add topic once
        
        return list(set(topics))  # Remove duplicates

    def _apply_context_adjustments(self, sentiment_scores: Dict[str, float], context: str) -> Dict[str, float]:
        """Apply context-specific adjustments to sentiment scores"""
        adjusted_scores = sentiment_scores.copy()
        
        # Adjustments based on context
        if context == "poll":
            # Poll responses tend to be more decisive
            if abs(adjusted_scores["compound_score"]) > 0.3:
                adjusted_scores["compound_score"] *= 1.1
        elif context == "petition":
            # Petitions often have stronger negative sentiment
            if adjusted_scores["compound_score"] < 0:
                adjusted_scores["negative"] *= 1.2
        elif context == "comment":
            # Comments can be more emotional
            adjusted_scores["compound_score"] *= 1.05
        
        return adjusted_scores

    def _determine_overall_sentiment(self, sentiment_scores: Dict[str, float]) -> str:
        """Determine overall sentiment category"""
        compound_score = sentiment_scores["compound_score"]
        
        if compound_score > 0.3:
            return "positive"
        elif compound_score < -0.3:
            return "negative"
        elif abs(compound_score) <= 0.1:
            return "neutral"
        else:
            return "mixed"

    def _calculate_confidence(self, text: str, sentiment_scores: Dict[str, float]) -> float:
        """Calculate confidence in sentiment analysis"""
        # Base confidence on keyword density
        word_count = len(text.split())
        if word_count < 5:
            return 0.3  # Low confidence for very short texts
        
        # Calculate keyword density
        total_positive_keywords = sum(len(keywords) for keywords in self.positive_keywords.values())
        total_negative_keywords = sum(len(keywords) for keywords in self.negative_keywords.values())
        
        total_keywords = total_positive_keywords + total_negative_keywords
        keyword_density = min(word_count / total_keywords, 1.0)
        
        # Adjust confidence based on sentiment clarity
        sentiment_strength = abs(sentiment_scores["compound_score"])
        clarity_factor = min(sentiment_strength * 1.5, 1.0)
        
        # Combine factors
        confidence = (keyword_density + clarity_factor) / 2
        
        return min(confidence, 0.95)  # Cap at 95%