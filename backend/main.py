from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, BaseSettings
from typing import List, Optional
import asyncpraw
import asyncio
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    REDDIT_CLIENT_ID: str
    REDDIT_CLIENT_SECRET: str
    REDDIT_USER_AGENT: str

    class Config:
        env_file = ".env"

# Initialize settings
settings = Settings()

# Reddit API configuration
async def get_reddit():
    return asyncpraw.Reddit(
        client_id=settings.REDDIT_CLIENT_ID,
        client_secret=settings.REDDIT_CLIENT_SECRET,
        user_agent=settings.REDDIT_USER_AGENT
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create Reddit instance
    app.reddit = await get_reddit()
    yield
    # Shutdown: close Reddit instance
    await app.reddit.close()

app = FastAPI(title="Reddit Topic Analyzer", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    topic: str
    limit: Optional[int] = 100

class RedditPost(BaseModel):
    id: str
    title: str
    text: str
    url: str
    score: int
    num_comments: int
    created_utc: float
    subreddit: str
    author: str
    permalink: str

@app.post("/api/search", response_model=List[RedditPost])
async def search_reddit(request: SearchRequest):
    try:
        logger.info(f"Searching for topic: {request.topic}")
        posts = []
        
        # Get subreddit instance
        subreddit = await app.reddit.subreddit("all")
        
        # Search for submissions
        async for submission in subreddit.search(
            query=request.topic,
            sort="new",
            time_filter="day",
            limit=request.limit
        ):
            try:
                # Get author name safely
                author_name = "[deleted]"
                if submission.author is not None:
                    author_name = submission.author.name

                post_data = RedditPost(
                    id=submission.id,
                    title=submission.title,
                    text=submission.selftext,
                    url=submission.url,
                    score=submission.score,
                    num_comments=submission.num_comments,
                    created_utc=submission.created_utc,
                    subreddit=submission.subreddit.display_name,
                    author=author_name,
                    permalink=f"https://reddit.com{submission.permalink}"
                )
                posts.append(post_data)
                logger.debug(f"Processed submission {submission.id}")
            except Exception as e:
                logger.error(f"Error processing submission {submission.id}: {str(e)}")
                continue

        logger.info(f"Found {len(posts)} posts")
        return posts
    except Exception as e:
        logger.error(f"Error in search_reddit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 