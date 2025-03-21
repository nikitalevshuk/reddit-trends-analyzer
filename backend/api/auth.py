import sys
from pathlib import Path

project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
import sys
from backend.models.user import UserCreate, User, Token, TokenData, SearchHistory, SearchHistoryCreate
from backend.models.db_models import User as DBUser, SearchHistory as DBSearchHistory
from backend.database import get_async_session
from backend.config import settings

# Настройка логирования
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# Инициализация router
router = APIRouter(prefix="/auth", tags=["auth"])

# Настройка хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 схема
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_password_hash(password: str) -> str:
    """Хеширование пароля"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Создание JWT токена"""
    logger.debug("==================== START create_access_token ====================")
    logger.debug(f"Creating token with data: {data}")
    logger.debug(f"JWT_SECRET_KEY (first 10 chars): {settings.JWT_SECRET_KEY[:10]}...")
    logger.debug(f"JWT_ALGORITHM: {settings.JWT_ALGORITHM}")
    
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    
    token = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    logger.debug(f"✅ Token created successfully (first 10 chars): {token[:10]}...")
    logger.debug("==================== END create_access_token ====================")
    return token

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_async_session)
) -> DBUser:
    """Получение текущего пользователя из токена"""
    logger.debug("==================== START get_current_user ====================")
    logger.debug(f"Received token (first 10 chars): {token[:10]}...")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        logger.debug(f"JWT_SECRET_KEY (first 10 chars): {settings.JWT_SECRET_KEY[:10]}...")
        logger.debug(f"JWT_ALGORITHM: {settings.JWT_ALGORITHM}")
        
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        logger.debug(f"Token decoded successfully. Payload: {payload}")
        
        username: str = payload.get("sub")
        if username is None:
            logger.error("❌ No username found in token payload")
            raise credentials_exception
        
        logger.debug(f"✅ Username extracted from token: {username}")
        token_data = TokenData(username=username)
        
    except JWTError as jwt_error:
        logger.error(f"❌ JWT decode error: {str(jwt_error)}")
        logger.error("==================== END get_current_user (with error) ====================")
        raise credentials_exception
    except Exception as e:
        logger.error(f"❌ Unexpected error during token processing: {str(e)}")
        logger.error("==================== END get_current_user (with error) ====================")
        raise credentials_exception

    try:
        logger.debug(f"Querying database for user: {username}")
        result = await session.execute(select(DBUser).where(DBUser.username == username))
        user = result.scalar_one_or_none()
        
        if user is None:
            logger.error(f"❌ User not found in database: {username}")
            logger.error("==================== END get_current_user (with error) ====================")
            raise credentials_exception
        
        logger.debug(f"✅ User found successfully: {user.username}")
        logger.debug("==================== END get_current_user ====================")
        return user
        
    except Exception as db_error:
        logger.error(f"❌ Database error: {str(db_error)}")
        logger.error("==================== END get_current_user (with error) ====================")
        raise credentials_exception

@router.post("/register", response_model=User)
async def register(
    user: UserCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Регистрация нового пользователя"""
    # Проверяем, не занято ли имя пользователя
    result = await session.execute(select(DBUser).where(DBUser.username == user.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Проверяем, не занят ли email
    result = await session.execute(select(DBUser).where(DBUser.email == user.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Создаем пользователя
    db_user = DBUser(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    session.add(db_user)
    await session.commit()
    await session.refresh(db_user)
    
    return User(username=db_user.username, email=db_user.email, id=db_user.id, created_at=db_user.created_at)

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_async_session)
):
    """Вход в систему и получение токена"""
    result = await session.execute(select(DBUser).where(DBUser.username == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: DBUser = Depends(get_current_user)):
    """Получение информации о текущем пользователе"""
    return User(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at
    )

@router.get("/me/history", response_model=List[SearchHistory])
async def get_user_history(
    current_user: DBUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Получение истории поиска пользователя"""
    logger.debug(f"Getting search history for user: {current_user.username}")
    
    try:
        result = await session.execute(
            select(DBSearchHistory)
            .where(DBSearchHistory.user_id == current_user.id)
            .order_by(DBSearchHistory.created_at.desc())
        )
        history = result.scalars().all()
        
        logger.debug(f"Found {len(history)} search history entries")
        return history
    except Exception as e:
        logger.error(f"Error getting search history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving search history"
        )

@router.post("/me/history", response_model=SearchHistory)
async def create_search_history(
    history: SearchHistoryCreate,
    current_user: DBUser = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Создание записи в истории поиска"""
    logger.debug(f"Creating search history for user: {current_user.username}")
    
    try:
        db_history = DBSearchHistory(
            user_id=current_user.id,
            topic=history.topic,
            results=history.results
        )
        session.add(db_history)
        await session.commit()
        await session.refresh(db_history)
        
        logger.debug(f"Created search history entry with ID: {db_history.id}")
        return db_history
    except Exception as e:
        logger.error(f"Error creating search history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating search history"
        )