from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Text, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    orders = relationship("Order", back_populates="user")
    interactions = relationship("UserInteraction", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    scheduled_orders = relationship("ScheduledOrder", back_populates="user")

class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    category = Column(String(50))
    description = Column(Text)
    stock_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    order_items = relationship("OrderItem", back_populates="product")
    interactions = relationship("UserInteraction", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    scheduled_orders = relationship("ScheduledOrder", back_populates="product")

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    order_date = Column(DateTime, server_default=func.now())
    total_amount = Column(DECIMAL(10, 2))
    status = Column(String(50), default="pending")

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class UserInteraction(Base):
    __tablename__ = "user_interactions"

    interaction_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    interaction_type = Column(String(50))
    interaction_value = Column(Float)
    timestamp = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="interactions")
    product = relationship("Product", back_populates="interactions")

class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    rating = Column(Integer)
    comment = Column(Text)
    review_date = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

class ScheduledOrder(Base):
    __tablename__ = "scheduled_orders"

    schedule_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    frequency = Column(String(50))
    next_order_date = Column(Date)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="scheduled_orders")
    product = relationship("Product", back_populates="scheduled_orders")