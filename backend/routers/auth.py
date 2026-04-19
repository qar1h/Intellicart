from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserResponse, UserLogin, Token
from utils.hashing import hash, verify
from utils.jwt import create_access_token, get_current_user
from datetime import timedelta

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

#sign up
@router.post("/register",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
def register(user_data:UserCreate,db:Session=Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashedpwd=hash(user_data.password)
    new_user=User(name=user_data.name,
        email=user_data.email,
        password=hashedpwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

#login
@router.post("/login",response_model=Token)
def login(user_data:UserLogin,db:Session=Depends(get_db)):
    user=db.query(User).filter(User.email==user_data.email).first()
    if not user or not verify(user_data.password,user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Invalid Credentials")
    
    access_token=create_access_token(data={"user_id":user.user_id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(db:Session=Depends(get_db),user_id: int=Depends(get_current_user)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="User not found")
    return user
