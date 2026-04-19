from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from database import get_db
from models import Order, OrderItem, Product, UserInteraction
from schemas import OrderCreate, OrderResponse, OrderItemResponse
from utils.jwt import get_current_user

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)

@router.post("/", response_model=OrderResponse,status_code=status.HTTP_201_CREATED)
def get_order(order_data:OrderCreate,db: Session=Depends(get_db),user_id:int =Depends(get_current_user)):
    new_order = Order(
        user_id=user_id,
        total_amount=order_data.total_amount,
        status="delivered"
    )
    db.add(new_order)
    db.flush()
    for item in order_data.items:

        product = db.query(Product).filter(
            Product.product_id == item.product_id
        ).first()
        if not product:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )

        order_item = OrderItem(
            order_id=new_order.order_id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db.add(order_item)

        interaction = UserInteraction(
            user_id=user_id,
            product_id=item.product_id,
            interaction_type="purchase",
            interaction_value=1.0
        )
        db.add(interaction)

    db.commit()
    db.refresh(new_order)

    items_response = []
    for item in new_order.items:
        items_response.append(OrderItemResponse(
            product_id=item.product_id,
            name=item.product.name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            line_total=Decimal(str(item.quantity)) * item.unit_price
        ))

    return OrderResponse(
        order_id=new_order.order_id,
        order_date=new_order.order_date,
        total_amount=new_order.total_amount,
        status=new_order.status,
        items=items_response
    )

@router.get("/",response_model=List[OrderResponse])
def get_order_history(db: Session=Depends(get_db),user_id:int =Depends(get_current_user)):
    orders = db.query(Order).filter(
        Order.user_id == user_id
    ).order_by(Order.order_date.desc()).all()

    result = []
    for order in orders:
        items_response = []
        for item in order.items:
            items_response.append(OrderItemResponse(
                product_id=item.product_id,
                name=item.product.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=Decimal(str(item.quantity)) * item.unit_price
            ))
        result.append(OrderResponse(
            order_id=order.order_id,
            order_date=order.order_date,
            total_amount=order.total_amount,
            status=order.status,
            items=items_response
        ))

    return result

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int,db: Session = Depends(get_db),user_id: int = Depends(get_current_user)):
    order = db.query(Order).filter(
        Order.order_id == order_id,
        Order.user_id == user_id  
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    items_response = []
    for item in order.items:
        items_response.append(OrderItemResponse(
            product_id=item.product_id,
            name=item.product.name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            line_total=Decimal(str(item.quantity)) * item.unit_price
        ))

    return OrderResponse(
        order_id=order.order_id,
        order_date=order.order_date,
        total_amount=order.total_amount,
        status=order.status,
        items=items_response
    )