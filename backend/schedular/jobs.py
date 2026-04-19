from datetime import date, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ScheduledOrder, Order, OrderItem, UserInteraction, Product

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

def process_scheduled_orders():
    print(f"[Scheduler] Running — {date.today()}")
    db: Session = SessionLocal()

    try:
        due = db.query(ScheduledOrder).filter(
            ScheduledOrder.status == "active",
            ScheduledOrder.next_order_date <= date.today()
        ).all()

        print(f"[Scheduler] Found {len(due)} due schedules.")

        for s in due:
            try:
                product = db.query(Product).filter(
                    Product.product_id == s.product_id
                ).first()

                if not product:
                    continue

                total = float(product.price) * s.quantity

                # Create order
                new_order = Order(
                    user_id=s.user_id,
                    total_amount=total,
                    status="delivered"
                )
                db.add(new_order)
                db.flush()

                # Create order item
                db.add(OrderItem(
                    order_id=new_order.order_id,
                    product_id=s.product_id,
                    quantity=s.quantity,
                    unit_price=product.price
                ))

                # Log interaction
                db.add(UserInteraction(
                    user_id=s.user_id,
                    product_id=s.product_id,
                    interaction_type="purchase",
                    interaction_value=1.0
                ))

                # Advance next_order_date
                today = date.today()
                s.next_order_date = get_next_date(today, s.frequency)

                db.commit()
                print(f"[Scheduler] Order placed — user {s.user_id}, product {s.product_id}, next: {s.next_order_date}")

            except Exception as e:
                db.rollback()
                print(f"[Scheduler] Failed for schedule {s.schedule_id}: {e}")

    except Exception as e:
        print(f"[Scheduler] Error: {e}")
    finally:
        db.close()