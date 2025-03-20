import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add the project root directory to PYTHONPATH
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from jose import JWTError, jwt
from backend.config import settings

data = {'sub': 'john_doe'}
import asyncio
import auth
async def bitch():
    token = auth.create_access_token(data, expires_delta=timedelta(minutes=15))
    user = await auth.get_current_user(token)
    print(user)

asyncio.run(bitch())