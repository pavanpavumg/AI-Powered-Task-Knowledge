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

    @staticmethod
    def register_user(db: Session, name: str, email: str, password: str) -> User:
        # Check if email is already registered
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
            
        # Fetch 'user' role
        from app.models.role import Role
        user_role = db.query(Role).filter(Role.name == "user").first()
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Default user role not found"
            )
            
        # Hash password and create user
        from app.core.security import hash_password
        hashed = hash_password(password)
        
        db_user = User(
            name=name,
            email=email,
            password_hash=hashed,
            role_id=user_role.id
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Log registration activity
        from app.services.activity_service import log_activity
        log_activity(
            db,
            user_id=db_user.id,
            action="register",
            details=f"New user registered: {db_user.email}"
        )
        
        return db_user
