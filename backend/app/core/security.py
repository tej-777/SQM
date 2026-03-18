from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Password hashing context - use a more compatible configuration
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=12
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set in environment variables")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        # Check if it's a SHA256 hash (fallback method)
        if len(hashed_password) == 64 and all(c in '0123456789abcdef' for c in hashed_password.lower()):
            import hashlib
            # It's a SHA256 hash, verify directly
            return hashlib.sha256(plain_password.encode('utf-8')).hexdigest() == hashed_password
        
        # Try bcrypt verification
        # Ensure password is string and handle encoding
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        
        # Truncate password if too long (bcrypt limitation)
        if len(plain_password) > 72:
            plain_password = plain_password[:72]
        
        # Convert back to string if needed
        if isinstance(plain_password, bytes):
            plain_password = plain_password.decode('utf-8', errors='ignore')
            
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # Fallback verification method
        try:
            # Try bcrypt with truncated password
            return pwd_context.verify(plain_password[:72], hashed_password)
        except:
            # Last resort - try SHA256 comparison
            try:
                import hashlib
                return hashlib.sha256(plain_password.encode('utf-8')).hexdigest() == hashed_password
            except:
                return False

def get_password_hash(password: str) -> str:
    """Generate password hash."""
    try:
        # Ensure password is string and handle encoding
        if isinstance(password, str):
            password = password.encode('utf-8')
        
        # Truncate password if too long (bcrypt limitation)
        if len(password) > 72:
            password = password[:72]
        
        # Convert back to string if needed
        if isinstance(password, bytes):
            password = password.decode('utf-8', errors='ignore')
            
        return pwd_context.hash(password)
    except Exception as e:
        # Fallback hashing method
        try:
            return pwd_context.hash(password[:72])
        except Exception as fallback_error:
            # Last resort - use a simple hash (not recommended for production)
            import hashlib
            return hashlib.sha256(password.encode('utf-8')).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return staff_id."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        staff_id: str = payload.get("sub")
        if staff_id is None:
            return None
        return staff_id
    except JWTError:
        return None
    except Exception:
        return None
