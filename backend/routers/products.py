from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Product
from schemas import ProductResponse
from utils.jwt import get_current_user

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)

@router.get("/",response_model=List[ProductResponse])
def get_products(db:Session=Depends(get_db),category: Optional[str] = None, search: Optional[str] = None):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    products = query.order_by(Product.category, Product.product_id).all()
    return products

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Get all unique product categories"""
    categories = db.query(Product.category).distinct().order_by(Product.category).all()
    return [c[0] for c in categories if c[0] is not None]

@router.get("/{product_id}",response_model=ProductResponse)
def get_product(product_id:int ,db:Session=Depends(get_db)):
    product=db.query(Product).filter(Product.product_id==product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Product not found")
    return product




