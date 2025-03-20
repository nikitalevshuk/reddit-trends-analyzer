import sys
from pathlib import Path

# Add project root to Python path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

import asyncio
import asyncpraw
from backend.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_reddit_connection():
    logger.info("Starting Reddit API test...")
    logger.info(f"Using client_id: {settings.REDDIT_CLIENT_ID[:5]}...")
    logger.info(f"Using user_agent: {settings.REDDIT_USER_AGENT}")
    
    try:
        reddit = asyncpraw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            user_agent=settings.REDDIT_USER_AGENT
        )
        
        logger.info("Reddit client created, testing search...")
        subreddit = await reddit.subreddit("all")
        
        logger.info("Searching for 'python' posts...")
        count = 0
        async for submission in subreddit.search("python", limit=5):
            logger.info(f"Found post: {submission.title}")
            count += 1
            
        logger.info(f"Successfully found {count} posts")
        await reddit.close()
        
    except Exception as e:
        logger.error(f"Error during test: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(test_reddit_connection()) 