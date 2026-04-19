from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from database import get_db
from models import ScheduledOrder, Order, OrderItem, UserInteraction, Product
from schemas import ScheduledOrderCreate, ScheduledOrderResponse, ScheduledOrderStatusUpdate
from utils.jwt import get_current_user

def get_next_date(current_date, frequency):
    if frequency == "daily":
        return current_date + timedelta(days=1)
    elif frequency == "weekly":
        return current_date + timedelta(weeks=1)
    elif frequency == "monthly":
        month = current_date.month + 1
        year = current_date.year + (month // 13)
        month = month if month <= 12 else 1
        try:
            return current_date.replace(year=year, month=month)
        except ValueError:
            return current_date + timedelta(days=30)
    elif frequency == "odd_days":
        next_date = current_date + timedelta(days=1)
        while next_date.day % 2 == 0:
            next_date += timedelta(days=1)
        return next_date
    elif frequency == "even_days":
        next_date = current_date + timedelta(days=1)
        while next_date.day % 2 != 0:
            next_date += timedelta(days=1)
        return next_date
    return current_date + timedelta(weeks=1)

router = APIRouter(
    prefix="/api/scheduled",
    tags=["Scheduled Orders"]
)

@router.post("/", response_model=ScheduledOrderResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(schedule_data: ScheduledOrderCreate,db: Session = Depends(get_db),user_id: int = Depends(get_current_user)):

    product = db.query(Product).filter(
        Product.product_id == schedule_data.product_id
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    new_schedule = ScheduledOrder(
        user_id=user_id,
        product_id=schedule_data.product_id,
        quantity=schedule_data.quantity,
        frequency=schedule_data.frequency,
        next_order_date=schedule_data.next_order_date,
        status="active"
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)

    return ScheduledOrderResponse(
        schedule_id=new_schedule.schedule_id,
        product_id=new_schedule.product_id,
        product_name=product.name,
        quantity=new_schedule.quantity,
        frequency=new_schedule.frequency,
        next_order_date=new_schedule.next_order_date,
        status=new_schedule.status,
        created_at=new_schedule.created_at
    )


@router.get("/", response_model=List[ScheduledOrderResponse])
def get_schedules(db: Session = Depends(get_db),user_id: int = Depends(get_current_user)):
    schedules = db.query(ScheduledOrder).filter(
        ScheduledOrder.user_id == user_id
    ).order_by(ScheduledOrder.created_at.desc()).all()

    result = []
    for s in schedules:
        result.append(ScheduledOrderResponse(
            schedule_id=s.schedule_id,
            product_id=s.product_id,
            product_name=s.product.name,
            quantity=s.quantity,
            frequency=s.frequency,
            next_order_date=s.next_order_date,
            status=s.status,
            created_at=s.created_at
        ))
    return result


@router.patch("/{schedule_id}", response_model=ScheduledOrderResponse)
def update_schedule_status(schedule_id: int,status_update: ScheduledOrderStatusUpdate,db: Session = Depends(get_db),user_id: int = Depends(get_current_user)):

    valid_statuses = ["active", "paused", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {valid_statuses}"
        )

    schedule = db.query(ScheduledOrder).filter(
        ScheduledOrder.schedule_id == schedule_id,
        ScheduledOrder.user_id == user_id
    ).first()

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )

    schedule.status = status_update.status
    db.commit()
    db.refresh(schedule)

    return ScheduledOrderResponse(
        schedule_id=schedule.schedule_id,
        product_id=schedule.product_id,
        product_name=schedule.product.name,
        quantity=schedule.quantity,
        frequency=schedule.frequency,
        next_order_date=schedule.next_order_date,
        status=schedule.status,
        created_at=schedule.created_at
    )


@router.get("/suggestions", response_model=List[ScheduledOrderResponse])
def get_smart_suggestions(db: Session = Depends(get_db),user_id: int = Depends(get_current_user)):
    from sqlalchemy import func

    frequent_products = db.query(
        OrderItem.product_id,
        func.count(OrderItem.product_id).label("purchase_count")
    ).join(Order).filter(
        Order.user_id == user_id
    ).group_by(
        OrderItem.product_id
    ).having(
        func.count(OrderItem.product_id) >= 2
    ).all()

    scheduled_ids = db.query(ScheduledOrder.product_id).filter(
        ScheduledOrder.user_id == user_id,
        ScheduledOrder.status.in_(["active", "paused"])
    ).all()
    scheduled_ids = {s[0] for s in scheduled_ids}

    suggestions = []
    for fp in frequent_products:
        if fp.product_id in scheduled_ids:
            continue

        product = db.query(Product).filter(
            Product.product_id == fp.product_id
        ).first()

        if not product:
            continue

        if fp.purchase_count >= 10:
            frequency = "daily"
        elif fp.purchase_count >= 5:
            frequency = "weekly"
        else:
            frequency = "monthly"

        suggestions.append(ScheduledOrderResponse(
            schedule_id=0,
            product_id=product.product_id,
            product_name=product.name,
            quantity=1,
            frequency=frequency,
            next_order_date=date.today() + timedelta(days=1),
            status="suggested",
            created_at=date.today()
        ))

    return suggestions



@router.post("/process")
def process_due_schedules(db: Session = Depends(get_db)):
    today = date.today()
    due_schedules = db.query(ScheduledOrder).filter(
        ScheduledOrder.status == "active",
        ScheduledOrder.next_order_date <= today
    ).all()

    processed = 0
    for s in due_schedules:
        try:
            product = db.query(Product).filter(
                Product.product_id == s.product_id
            ).first()
            if not product:
                continue

            total = float(product.price) * s.quantity

            new_order = Order(
                user_id=s.user_id,
                total_amount=total,
                status="delivered"
            )
            db.add(new_order)
            db.flush()

            db.add(OrderItem(
                order_id=new_order.order_id,
                product_id=s.product_id,
                quantity=s.quantity,
                unit_price=product.price
            ))

            db.add(UserInteraction(
                user_id=s.user_id,
                product_id=s.product_id,
                interaction_type="purchase",
                interaction_value=1.0
            ))

            s.next_order_date = get_next_date(today, s.frequency)

            db.commit()
            processed += 1

        except Exception as e:
            db.rollback()
            print(f"Failed to process schedule {s.schedule_id}: {e}")

    return {"processed": processed, "message": f"✅ {processed} scheduled orders placed."}