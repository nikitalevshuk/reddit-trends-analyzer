from typing import List, Dict, Any
from openai import AsyncOpenAI
import logging
import json
from backend.config import settings  # Import settings from centralized config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client without proxies
client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
    http_client=None  # Let OpenAI create its own client
)

async def analyze_posts(posts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze Reddit posts using OpenAI API to generate insights.
    
    Args:
        posts: List of Reddit posts with their metadata
        
    Returns:
        Dictionary containing analysis results including sentiment, toxicity, etc.
    """
    try:
        # Prepare posts data for analysis
        logger.debug("Starting to prepare posts data for analysis")
        posts_text = []
        for post in posts:
            post_content = f"Title: {post['title']}\nText: {post['text']}\n"
            post_content += f"Author: {post['author']}, Score: {post['score']}, "
            post_content += f"Comments: {post['num_comments']}\n---\n"
            posts_text.append(post_content)
        logger.debug(f"Prepared {len(posts_text)} posts for analysis")

        # Create analysis prompt
        logger.debug("Creating analysis prompt")
        prompt = f"""Analyze the following Reddit posts and provide insights in JSON format.
        Posts to analyze:
        {''.join(posts_text[:20])}  # Limit to first 20 posts for API context length

        Please provide analysis in the following JSON format:
        {{
            "overall_sentiment": "positive/negative/neutral",
            "toxicity_level": 0.0-1.0,
            "frequent_words": ["word1", "word2", "word3", ...],
            "influential_accounts": ["user1", "user2", "user3", ...]
        }}

        Focus on:
        1. Overall sentiment of the discussion
        2. Toxicity level as a decimal between 0 and 1
        3. Most frequently used meaningful words (exclude common words)
        4. Top 5 most influential accounts based on engagement
        
        Return ONLY the JSON response without any additional text.
        """

        # Call OpenAI API
        logger.debug("Calling OpenAI API")
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI trained to analyze Reddit posts and provide insights in JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        logger.debug("Received response from OpenAI API")

        # Parse the response
        analysis_text = response.choices[0].message.content.strip()
        logger.debug(f"Analysis text: {analysis_text}")
        analysis_result = json.loads(analysis_text)

        # Validate and clean up the response
        logger.debug("Validating and cleaning up the response")
        required_keys = ["overall_sentiment", "toxicity_level", "frequent_words", "influential_accounts"]
        for key in required_keys:
            if key not in analysis_result:
                analysis_result[key] = [] if key in ["frequent_words", "influential_accounts"] else "neutral" if key == "overall_sentiment" else 0.0

        # Ensure toxicity is within bounds
        analysis_result["toxicity_level"] = max(0.0, min(1.0, float(analysis_result["toxicity_level"])))

        # Limit arrays to reasonable sizes
        analysis_result["frequent_words"] = analysis_result["frequent_words"][:10]
        analysis_result["influential_accounts"] = analysis_result["influential_accounts"][:5]
        logger.debug(f"Analysis result: {analysis_result}")

        logger.debug("Successfully analyzed Reddit posts")
        return analysis_result

    except Exception as e:
        logger.error(f"Error analyzing posts: {str(e)}")
        # Return a safe default response in case of error
        return {
            "overall_sentiment": "neutral",
            "toxicity_level": 0.0,
            "frequent_words": [],
            "influential_accounts": []
        }