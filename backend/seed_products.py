import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database import SessionLocal
from models import Product

products = [
    # Dairy
    {"name": "Milk", "price": 50, "category": "Dairy", "description": "Fresh full-cream milk", "stock_quantity": 100},
    {"name": "Cheese", "price": 120, "category": "Dairy", "description": "Processed cheddar cheese", "stock_quantity": 50},
    {"name": "Butter", "price": 80, "category": "Dairy", "description": "Creamy salted butter", "stock_quantity": 75},
    {"name": "Curd", "price": 40, "category": "Dairy", "description": "Fresh homemade style curd", "stock_quantity": 80},
    {"name": "Paneer", "price": 90, "category": "Dairy", "description": "Soft fresh cottage cheese", "stock_quantity": 60},
    {"name": "Ghee", "price": 150, "category": "Dairy", "description": "Pure desi cow ghee", "stock_quantity": 40},
    {"name": "Yogurt", "price": 60, "category": "Dairy", "description": "Flavoured fruit yogurt", "stock_quantity": 55},
    {"name": "Cream", "price": 70, "category": "Dairy", "description": "Fresh cooking cream", "stock_quantity": 45},
    {"name": "Buttermilk", "price": 30, "category": "Dairy", "description": "Chilled spiced buttermilk", "stock_quantity": 60},
    {"name": "Condensed Milk", "price": 110, "category": "Dairy", "description": "Sweetened condensed milk", "stock_quantity": 40},

    # Vegetables
    {"name": "Tomato", "price": 30, "category": "Vegetables", "description": "Fresh red tomatoes", "stock_quantity": 120},
    {"name": "Potato", "price": 25, "category": "Vegetables", "description": "Farm fresh potatoes", "stock_quantity": 150},
    {"name": "Onion", "price": 35, "category": "Vegetables", "description": "Red onions", "stock_quantity": 130},
    {"name": "Carrot", "price": 40, "category": "Vegetables", "description": "Crunchy orange carrots", "stock_quantity": 90},
    {"name": "Spinach", "price": 20, "category": "Vegetables", "description": "Fresh green spinach leaves", "stock_quantity": 70},
    {"name": "Broccoli", "price": 55, "category": "Vegetables", "description": "Fresh broccoli florets", "stock_quantity": 50},
    {"name": "Capsicum", "price": 45, "category": "Vegetables", "description": "Green bell pepper", "stock_quantity": 60},
    {"name": "Cucumber", "price": 25, "category": "Vegetables", "description": "Fresh cucumbers", "stock_quantity": 80},
    {"name": "Beetroot", "price": 35, "category": "Vegetables", "description": "Fresh red beetroot", "stock_quantity": 55},
    {"name": "Cauliflower", "price": 40, "category": "Vegetables", "description": "Fresh white cauliflower", "stock_quantity": 65},
    {"name": "Peas", "price": 35, "category": "Vegetables", "description": "Fresh green peas", "stock_quantity": 75},
    {"name": "Corn", "price": 30, "category": "Vegetables", "description": "Sweet yellow corn", "stock_quantity": 60},
    {"name": "Garlic", "price": 25, "category": "Vegetables", "description": "Fresh garlic bulbs", "stock_quantity": 90},
    {"name": "Ginger", "price": 20, "category": "Vegetables", "description": "Fresh ginger root", "stock_quantity": 85},
    {"name": "Mushroom", "price": 60, "category": "Vegetables", "description": "Fresh button mushrooms", "stock_quantity": 40},

    # Fruits
    {"name": "Apple", "price": 100, "category": "Fruits", "description": "Fresh Himalayan apples", "stock_quantity": 80},
    {"name": "Banana", "price": 60, "category": "Fruits", "description": "Ripe yellow bananas", "stock_quantity": 100},
    {"name": "Orange", "price": 80, "category": "Fruits", "description": "Juicy Nagpur oranges", "stock_quantity": 75},
    {"name": "Mango", "price": 120, "category": "Fruits", "description": "Alphonso mangoes", "stock_quantity": 50},
    {"name": "Grapes", "price": 90, "category": "Fruits", "description": "Seedless green grapes", "stock_quantity": 60},
    {"name": "Watermelon", "price": 50, "category": "Fruits", "description": "Fresh whole watermelon", "stock_quantity": 30},
    {"name": "Papaya", "price": 70, "category": "Fruits", "description": "Ripe yellow papaya", "stock_quantity": 40},
    {"name": "Pineapple", "price": 80, "category": "Fruits", "description": "Fresh tropical pineapple", "stock_quantity": 35},
    {"name": "Pomegranate", "price": 110, "category": "Fruits", "description": "Fresh red pomegranate", "stock_quantity": 45},
    {"name": "Guava", "price": 60, "category": "Fruits", "description": "Fresh green guava", "stock_quantity": 55},
    {"name": "Strawberry", "price": 150, "category": "Fruits", "description": "Fresh red strawberries", "stock_quantity": 30},
    {"name": "Kiwi", "price": 130, "category": "Fruits", "description": "Fresh green kiwi", "stock_quantity": 35},
    {"name": "Pear", "price": 90, "category": "Fruits", "description": "Fresh juicy pears", "stock_quantity": 45},
    {"name": "Litchi", "price": 100, "category": "Fruits", "description": "Fresh sweet litchi", "stock_quantity": 30},
    {"name": "Coconut", "price": 50, "category": "Fruits", "description": "Fresh whole coconut", "stock_quantity": 40},

    # Snacks
    {"name": "Chips", "price": 20, "category": "Snacks", "description": "Crispy salted potato chips", "stock_quantity": 200},
    {"name": "Biscuits", "price": 25, "category": "Snacks", "description": "Butter flavoured biscuits", "stock_quantity": 180},
    {"name": "Chocolate", "price": 50, "category": "Snacks", "description": "Milk chocolate bar", "stock_quantity": 150},
    {"name": "Namkeen", "price": 45, "category": "Snacks", "description": "Spicy mixed namkeen", "stock_quantity": 120},
    {"name": "Popcorn", "price": 30, "category": "Snacks", "description": "Butter microwave popcorn", "stock_quantity": 100},
    {"name": "Peanuts", "price": 40, "category": "Snacks", "description": "Roasted salted peanuts", "stock_quantity": 130},
    {"name": "Granola Bar", "price": 55, "category": "Snacks", "description": "Oats and honey granola bar", "stock_quantity": 90},
    {"name": "Murukku", "price": 35, "category": "Snacks", "description": "Crispy rice flour murukku", "stock_quantity": 80},
    {"name": "Cashews", "price": 130, "category": "Snacks", "description": "Premium roasted cashews", "stock_quantity": 70},
    {"name": "Almonds", "price": 150, "category": "Snacks", "description": "Raw California almonds", "stock_quantity": 60},
    {"name": "Walnuts", "price": 180, "category": "Snacks", "description": "Fresh whole walnuts", "stock_quantity": 50},
    {"name": "Trail Mix", "price": 120, "category": "Snacks", "description": "Mixed nuts and dried fruits", "stock_quantity": 55},
    {"name": "Rice Cakes", "price": 40, "category": "Snacks", "description": "Light puffed rice cakes", "stock_quantity": 75},
    {"name": "Cookies", "price": 60, "category": "Snacks", "description": "Chocolate chip cookies", "stock_quantity": 90},
    {"name": "Protein Bar", "price": 80, "category": "Snacks", "description": "High protein energy bar", "stock_quantity": 65},

    # Beverages
    {"name": "Orange Juice", "price": 90, "category": "Beverages", "description": "Fresh squeezed orange juice", "stock_quantity": 60},
    {"name": "Apple Juice", "price": 85, "category": "Beverages", "description": "Cold pressed apple juice", "stock_quantity": 55},
    {"name": "Green Tea", "price": 120, "category": "Beverages", "description": "Premium green tea bags", "stock_quantity": 70},
    {"name": "Black Coffee", "price": 150, "category": "Beverages", "description": "Ground arabica coffee", "stock_quantity": 50},
    {"name": "Coconut Water", "price": 40, "category": "Beverages", "description": "Fresh tender coconut water", "stock_quantity": 80},
    {"name": "Lemonade", "price": 30, "category": "Beverages", "description": "Fresh squeezed lemonade", "stock_quantity": 65},
    {"name": "Mango Juice", "price": 70, "category": "Beverages", "description": "Alphonso mango juice", "stock_quantity": 55},
    {"name": "Milkshake", "price": 80, "category": "Beverages", "description": "Thick chocolate milkshake", "stock_quantity": 45},
    {"name": "Lassi", "price": 50, "category": "Beverages", "description": "Sweet mango lassi", "stock_quantity": 60},
    {"name": "Sparkling Water", "price": 35, "category": "Beverages", "description": "Chilled sparkling water", "stock_quantity": 90},

    # Bakery
    {"name": "White Bread", "price": 40, "category": "Bakery", "description": "Soft sliced white bread", "stock_quantity": 100},
    {"name": "Brown Bread", "price": 50, "category": "Bakery", "description": "Whole wheat brown bread", "stock_quantity": 85},
    {"name": "Croissant", "price": 60, "category": "Bakery", "description": "Buttery flaky croissant", "stock_quantity": 50},
    {"name": "Muffin", "price": 45, "category": "Bakery", "description": "Blueberry muffin", "stock_quantity": 60},
    {"name": "Donut", "price": 35, "category": "Bakery", "description": "Glazed chocolate donut", "stock_quantity": 70},
    {"name": "Cake Slice", "price": 80, "category": "Bakery", "description": "Fresh cream cake slice", "stock_quantity": 40},
    {"name": "Bagel", "price": 55, "category": "Bakery", "description": "Sesame seed bagel", "stock_quantity": 45},
    {"name": "Pita Bread", "price": 45, "category": "Bakery", "description": "Soft whole wheat pita", "stock_quantity": 55},
    {"name": "Banana Bread", "price": 70, "category": "Bakery", "description": "Homestyle banana bread", "stock_quantity": 35},
    {"name": "Rusk", "price": 30, "category": "Bakery", "description": "Crispy toasted rusk", "stock_quantity": 90},

    # Grains & Pulses
    {"name": "Basmati Rice", "price": 120, "category": "Grains & Pulses", "description": "Aged basmati rice 1kg", "stock_quantity": 80},
    {"name": "Toor Dal", "price": 90, "category": "Grains & Pulses", "description": "Yellow toor dal 500g", "stock_quantity": 75},
    {"name": "Chana Dal", "price": 85, "category": "Grains & Pulses", "description": "Split chickpea dal 500g", "stock_quantity": 70},
    {"name": "Moong Dal", "price": 80, "category": "Grains & Pulses", "description": "Green moong dal 500g", "stock_quantity": 65},
    {"name": "Wheat Flour", "price": 60, "category": "Grains & Pulses", "description": "Whole wheat atta 1kg", "stock_quantity": 90},
    {"name": "Oats", "price": 110, "category": "Grains & Pulses", "description": "Rolled oats 500g", "stock_quantity": 60},
    {"name": "Quinoa", "price": 200, "category": "Grains & Pulses", "description": "Organic white quinoa", "stock_quantity": 35},
    {"name": "Rajma", "price": 95, "category": "Grains & Pulses", "description": "Red kidney beans 500g", "stock_quantity": 55},
    {"name": "Chickpeas", "price": 85, "category": "Grains & Pulses", "description": "Dried white chickpeas", "stock_quantity": 60},
    {"name": "Semolina", "price": 50, "category": "Grains & Pulses", "description": "Fine semolina rava 500g", "stock_quantity": 75},

    # Personal Care
    {"name": "Shampoo", "price": 180, "category": "Personal Care", "description": "Herbal hair shampoo 200ml", "stock_quantity": 60},
    {"name": "Conditioner", "price": 160, "category": "Personal Care", "description": "Moisturising conditioner 200ml", "stock_quantity": 50},
    {"name": "Face Wash", "price": 120, "category": "Personal Care", "description": "Neem face wash 100ml", "stock_quantity": 65},
    {"name": "Moisturiser", "price": 150, "category": "Personal Care", "description": "Daily SPF moisturiser 50ml", "stock_quantity": 55},
    {"name": "Toothpaste", "price": 80, "category": "Personal Care", "description": "Whitening toothpaste 100g", "stock_quantity": 90},
    {"name": "Toothbrush", "price": 40, "category": "Personal Care", "description": "Soft bristle toothbrush", "stock_quantity": 100},
    {"name": "Soap", "price": 35, "category": "Personal Care", "description": "Antibacterial bathing soap", "stock_quantity": 120},
    {"name": "Deodorant", "price": 140, "category": "Personal Care", "description": "Roll-on deodorant 50ml", "stock_quantity": 55},
    {"name": "Sunscreen", "price": 200, "category": "Personal Care", "description": "SPF 50 sunscreen 75ml", "stock_quantity": 45},
    {"name": "Hand Wash", "price": 90, "category": "Personal Care", "description": "Liquid hand wash 250ml", "stock_quantity": 80},
]

def seed():
    db = SessionLocal()
    try:
        existing = db.query(Product).count()
        if existing > 0:
            print(f"⚠️ Products table already has {existing} products. Skipping seed.")
            return

        for p in products:
            db.add(Product(**p))

        db.commit()
        print(f"✅ Successfully seeded {len(products)} products!")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()