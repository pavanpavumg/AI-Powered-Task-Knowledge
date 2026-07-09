from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token
from fastapi import HTTPException, status

class AuthService:
    @staticmethod
    def authenticate_and_create_token(db: Session, email: str, password: str) -> dict:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password"
            )
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password"
            )
            
        token = create_access_token(user_id=user.id, email=user.email, role_name=user.role.name)
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": user.role.name
        }
