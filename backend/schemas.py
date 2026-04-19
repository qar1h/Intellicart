from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

class UserCreate(BaseModel):
    name: str
    email: EmailStr       
    password: str = Field(..., max_length=72)

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str         


class TokenData(BaseModel):
    user_id: Optional[int] = None


class ProductResponse(BaseModel):
    product_id: int
    name: str
    price: Decimal
    category: Optional[str]
    description: Optional[str]
    stock_quantity: Optional[int]

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    total_amount: Decimal

class OrderItemResponse(BaseModel):
    product_id: int
    name: Optional[str] = None
    quantity: int
    unit_price: Decimal
    line_total: Optional[Decimal] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    order_id: int
    order_date: datetime
    total_amount: Decimal
    status: str
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class ScheduledOrderCreate(BaseModel):
    product_id: int
    quantity: int
    frequency: str          
    next_order_date: date

    @field_validator('frequency')
    @classmethod
    def validate_frequency(cls, v):
        valid_frequencies = ['daily', 'weekly', 'monthly', 'odd_days', 'even_days']
        if v not in valid_frequencies:
            raise ValueError(f'frequency must be one of {valid_frequencies}')
        return v

class ScheduledOrderResponse(BaseModel):
    schedule_id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    frequency: str
    next_order_date: Optional[date]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ScheduledOrderStatusUpdate(BaseModel):
    status: str             



class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    review_id: int
    product_id: int
    rating: int
    comment: Optional[str]
    review_date: datetime

    class Config:
        from_attributes = True


class InteractionCreate(BaseModel):
    product_id: int
    interaction_type: str   # purchase, view
    interaction_value: float


class RecommendationResponse(BaseModel):
    product_id: int
    name: str
    category: str
    price: Decimal
    similarity: float