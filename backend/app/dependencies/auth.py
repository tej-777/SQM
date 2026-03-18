from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.staff import Staff
from app.core.security import verify_token
from uuid import UUID

# HTTP Bearer token scheme
security = HTTPBearer()

def get_current_staff(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Staff:
    """Get current authenticated staff member."""
    
    # Extract token from credentials
    token = credentials.credentials
    
    # Verify token and get staff UUID
    staff_uuid = verify_token(token)
    if staff_uuid is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get staff from database by UUID
    staff = db.query(Staff).filter(Staff.id == UUID(staff_uuid)).first()
    if staff is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Staff member not found",
        )
    
    return staff
