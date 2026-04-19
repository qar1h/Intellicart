import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import random
from datetime import datetime, timedelta
from database import SessionLocal
from models import User, Product, Order, OrderItem, UserInteraction
from utils.hashing import hash

NUM_USERS = 50

CATEGORY_PROFILES = [
    ["Dairy", "Bakery", "Beverages"],
    ["Vegetables", "Fruits", "Grains & Pulses"],
    ["Snacks", "Beverages"],
    ["Personal Care", "Dairy"],
    ["Fruits", "Snacks", "Bakery"],
]

def generate_data():
    db = SessionLocal()
    try:
        # Fetch all products
        products = db.query(Product).all()
        if not products:
            print("No products found. Run seed_products.py first.")
            return

        # Group by category
        products_by_category = {}
        for p in products:
            if p.category not in products_by_category:
                products_by_category[p.category] = []
            products_by_category[p.category].append(p)

        # Create dummy users
        created_users = []
        for i in range(1, NUM_USERS + 1):
            email = f"dummyuser{i}@intellicart.com"
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                created_users.append(existing)
                continue
            user = User(
                name=f"User {i}",
                email=email,
                password=hash("password123")
            )
            db.add(user)
            db.flush()
            created_users.append(user)

        db.commit()
        print(f"Users ready: {len(created_users)}")

        total_orders       = 0
        total_interactions = 0

        for user in created_users:
            profile    = random.choice(CATEGORY_PROFILES)
            num_orders = random.randint(5, 15)

            for _ in range(num_orders):
                order_products = []
                for category in profile:
                    if category in products_by_category and random.random() > 0.4:
                        order_products.append(random.choice(products_by_category[category]))

                if not order_products:
                    continue

                days_ago   = random.randint(1, 180)
                order_date = datetime.now() - timedelta(days=days_ago)
                total      = sum(float(p.price) for p in order_products)

                new_order = Order(
                    user_id=user.user_id,
                    total_amount=total,
                    status="delivered",
                    order_date=order_date
                )
                db.add(new_order)
                db.flush()
                total_orders += 1

                for p in order_products:
                    db.add(OrderItem(
                        order_id=new_order.order_id,
                        product_id=p.product_id,
                        quantity=1,
                        unit_price=p.price
                    ))
                    db.add(UserInteraction(
                        user_id=user.user_id,
                        product_id=p.product_id,
                        interaction_type="purchase",
                        interaction_value=1.0,
                        timestamp=order_date
                    ))
                    total_interactions += 1

                # View interactions
                for category in profile:
                    if category in products_by_category:
                        viewed = random.sample(
                            products_by_category[category],
                            min(3, len(products_by_category[category]))
                        )
                        for p in viewed:
                            db.add(UserInteraction(
                                user_id=user.user_id,
                                product_id=p.product_id,
                                interaction_type="view",
                                interaction_value=0.5,
                                timestamp=order_date
                            ))
                            total_interactions += 1

                db.commit()

        print(f"Generated {total_orders} orders and {total_interactions} interactions.")

    except Exception as e:
        db.rollback()
        print(f"Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    generate_data()