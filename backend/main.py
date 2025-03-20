from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncpraw
import asyncio
from datetime import datetime, timedelta
import logging
from contextlib import asynccontextmanager
from backend.services.ai_service import analyze_posts
from backend.config import settings
from backend.api.auth import router as auth_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Configure CORS with specific origins for development
origins = [
    "http://localhost:3000",    # React default port
    "http://localhost:5173",    # Vite default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутер авторизации с префиксом
app.include_router(auth_router, prefix="/api")

class SearchRequest(BaseModel):
    topic: str
    limit: Optional[int] = 20

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

class AnalysisResponse(BaseModel):
    posts: List[RedditPost]
    analysis: Dict[str, Any]

@app.post("/api/search", response_model=AnalysisResponse)
async def search_reddit(request: SearchRequest):
    try:
        logger.info(f"Searching for topic: {request.topic}")
        posts = []
        
        # Get subreddit instance
        subreddit = await app.reddit.subreddit("all")
        
        # Search for submissions
        async for submission in subreddit.search(
            query=request.topic,
            sort="hot",
            time_filter="month",
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
        
        # Get AI analysis
        analysis_result = await analyze_posts([post.dict() for post in posts])
        
        return AnalysisResponse(posts=posts, analysis=analysis_result)
    except Exception as e:
        logger.error(f"Error in search_reddit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)