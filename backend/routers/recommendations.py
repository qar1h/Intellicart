from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import OrderItem, Order
from schemas import RecommendationResponse
from utils.jwt import get_current_user
import sys
import os

router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendations"]
)

@router.get("/", response_model=List[RecommendationResponse])
def get_recommendations(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    try:
        # Get user's purchased product IDs
        purchased = db.query(OrderItem.product_id).join(Order).filter(
            Order.user_id == user_id
        ).distinct().all()

        purchased_ids = [p[0] for p in purchased]

        if not purchased_ids:
            return []

        # Load inference from models folder
        models_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '..', '..', 'models')
        )
        if models_path not in sys.path:
            sys.path.insert(0, models_path)

        from inference import get_recommendations as model_recommend
        recommendations = model_recommend(purchased_ids, top_n=5)
        return recommendations

    except Exception as e:
        print(f"Recommendation error: {e}")
        return []