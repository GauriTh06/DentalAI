from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from bson import ObjectId
from backend.app.database import db_instance
from backend.app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.app.models.user import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

def serialize_user(user_doc) -> dict:
    if not user_doc:
        return None
    user = dict(user_doc)
    user["_id"] = str(user["_id"])
    return user

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    # Check if user email already exists
    existing_user = await db_instance.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # Hash password and save user
    user_dict = user_in.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["created_at"] = datetime.utcnow()
    
    # Insert to db
    result = await db_instance.users.insert_one(user_dict)
    
    # Fetch and serialize response
    created_user = await db_instance.users.find_one({"_id": result.inserted_id})
    return serialize_user(created_user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by email
    user = await db_instance.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create token
    access_token = create_access_token(
        subject=user["email"], role=user.get("role", "patient")
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.get("role", "patient"),
        "name": user.get("name", "User")
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user)
