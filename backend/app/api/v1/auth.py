from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.auth_service import AuthService
from app.services.activity_service import log_activity
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role_name: str

    class Config:
        from_attributes = True

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    result = AuthService.authenticate_and_create_token(
        db, email=request.email, password=request.password
    )
    
    # Log login activity
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        log_activity(
            db,
            user_id=user.id,
            action="login",
            details=f"User logged in from email: {user.email}"
        )
        
    return result

@router.post("/register", response_model=UserOut)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = AuthService.register_user(
        db, name=request.name, email=request.email, password=request.password
    )
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role_name=user.role.name
    )
