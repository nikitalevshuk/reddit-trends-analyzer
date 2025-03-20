import sys
from pathlib import Path
import ssl
import aiohttp
from datetime import datetime

project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncpraw
import logging
import sys
from contextlib import asynccontextmanager
from backend.services.ai_service import analyze_posts
from backend.config import settings
from backend.api.auth import router as auth_router
from backend.api.auth import get_current_user
from backend.database import get_async_session
from backend.models.db_models import User as DBUser, SearchHistory as DBSearchHistory
from sqlalchemy.ext.asyncio import AsyncSession

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


# Reddit API configuration
async def get_reddit():
    logger.debug("Initializing Reddit client...")
    logger.debug(f"Using client_id: {settings.REDDIT_CLIENT_ID[:5]}...")  # Log only first 5 chars for security
    logger.debug(f"Using user_agent: {settings.REDDIT_USER_AGENT}")
    
    try:
        reddit = asyncpraw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            user_agent=settings.REDDIT_USER_AGENT
        )
        logger.debug("Reddit client initialized successfully")
        return reddit
    except Exception as e:
        logger.error(f"Error initializing Reddit client: {str(e)}")
        raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create Reddit instance
    app.reddit = await get_reddit()
    yield
    # Shutdown: close Reddit instance
    await app.reddit.close()

app = FastAPI(title="Reddit Topic Analyzer", lifespan=lifespan)

# Configure CORS with specific origins for development and production
origins = [
    "http://localhost:3000",    # React default port
    "http://localhost:5173",    # Vite default port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://*.up.railway.app",  # Railway domains
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
async def search_reddit(
    request: SearchRequest,
    current_user: DBUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    try:
        logger.debug(f"Searching for topic: {request.topic}")
        posts = []
        
        # Get subreddit instance
        logger.debug("Getting subreddit instance")
        try:
            subreddit = await app.reddit.subreddit("all")
            logger.debug("Successfully got subreddit instance")
            
            # Search for submissions
            logger.debug(f"Starting search with parameters: query='{request.topic}', limit={request.limit}")
            async for submission in subreddit.search(
                query=request.topic,
                sort="hot",
                time_filter="month",
                limit=request.limit
            ):
                try:
                    logger.debug(f"Processing submission: {submission.id}")
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
                    logger.debug(f"Successfully processed submission {submission.id}")
                except Exception as e:
                    logger.error(f"Error processing submission {submission.id}: {str(e)}")
                    continue

            logger.debug(f"Found {len(posts)} posts")
            
            # Get AI analysis
            logger.debug("Starting AI analysis...")
            analysis_result = await analyze_posts([post.dict() for post in posts])
            logger.debug("AI analysis completed")
            
            # Save search history
            logger.debug("Saving search history")
            search_history = DBSearchHistory(
                user_id=current_user.id,
                topic=request.topic,
                results={"posts": [post.dict() for post in posts], "analysis": analysis_result}
            )
            session.add(search_history)
            await session.commit()
            logger.debug("Search history saved successfully")
            
            return AnalysisResponse(posts=posts, analysis=analysis_result)
        except Exception as e:
            logger.error(f"Error in Reddit API operations: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Reddit API error: {str(e)}")
    except Exception as e:
        logger.error(f"Error in search_reddit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 