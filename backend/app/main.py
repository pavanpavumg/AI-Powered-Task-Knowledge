from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.api.v1 import auth, tasks, documents, search, analytics, activity
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Refactored API for TaskSphere KMS",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect API routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(tasks.router, prefix=f"{settings.API_V1_STR}/tasks", tags=["tasks"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
app.include_router(search.router, prefix=f"{settings.API_V1_STR}/search", tags=["search"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(activity.router, prefix=f"{settings.API_V1_STR}/activity-logs", tags=["activity-logs"])

@app.on_event("startup")
def startup_event():
    # Build MySQL tables
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"WARNING: DB connection failed or metadata creation failed: {e}")
        return

    db = SessionLocal()
    try:
        # Seed lowercase roles 'admin' and 'user'
        roles = {}
        for role_name in ["admin", "user"]:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name)
                db.add(role)
                db.commit()
                db.refresh(role)
            roles[role_name] = role
            
        # Seed Default Admin Account
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                name="Admin User",
                email="admin@example.com",
                password_hash=hash_password("adminpassword"),
                role_id=roles["admin"].id
            )
            db.add(admin)
            db.commit()
            print("INFO: Seeded admin account: admin@example.com / adminpassword")

        # Seed Default Regular User Account
        regular_user = db.query(User).filter(User.email == "user@example.com").first()
        if not regular_user:
            regular_user = User(
                name="Standard User",
                email="user@example.com",
                password_hash=hash_password("userpassword"),
                role_id=roles["user"].id
            )
            db.add(regular_user)
            db.commit()
            print("INFO: Seeded user account: user@example.com / userpassword")
            
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API v2",
        "docs": "/docs"
    }
