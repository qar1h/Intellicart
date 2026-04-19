import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../api/client';

export default function Cart({ cart, removeFromCart, clearCart }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleBuyNow = async () => {
    if (!user) { setError('Please sign in to place an order.'); return; }
    setLoading(true); setError('');
    try {
      await placeOrder(cart, total);
      clearCart();
      setOrderPlaced(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <h1 className="page-title">Your Cart</h1>
      <p className="page-subtitle">Review your items before checkout.</p>

      {orderPlaced && (
        <div className="alert-success" style={{ marginBottom: 24 }}>
          Order placed successfully. Your items will be delivered soon.
        </div>
      )}
      {error && (
        <div className="alert-error" style={{ marginBottom: 24 }}>{error}</div>
      )}

      {cart.length === 0 ? (
        <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64,
            background: '#CCFBF1', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontFamily: 'Fraunces, serif', fontSize: 24, color: '#0D9488', fontWeight: 700,
          }}>
            0
          </div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
            Your cart is empty
          </h3>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
            Add items from the Products page to get started.
          </p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Items */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
                {cart.length} item{cart.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={clearCart}
                style={{ fontSize: 13, color: '#94A3B8', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer' }}
              >
                Clear all
              </button>
            </div>
            {cart.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: i < cart.length - 1 ? '1px solid #F8FAFC' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: '#CCFBF1', borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#0D9488',
                  }}>
                    {item.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.category}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Rs. {item.price}</span>
                  <button className="btn-danger" onClick={() => removeFromCart(i)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card card-blue-top" style={{ padding: 24, position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 20 }}>
              Order Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748B', marginBottom: 10 }}>
              <span>Subtotal ({cart.length} items)</span>
              <span>Rs. {total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748B', marginBottom: 16 }}>
              <span>Delivery</span>
              <span style={{ color: '#16A34A', fontWeight: 600 }}>Free</span>
            </div>
            <hr className="divider" style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Total</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#0D9488' }}>Rs. {total}</span>
            </div>
            {!user && (
              <div className="alert-error" style={{ marginBottom: 16, fontSize: 13 }}>
                Please sign in to place an order.
              </div>
            )}
            <button
              className="btn-primary"
              style={{ width: '100%', padding: 13, fontSize: 15 }}
              onClick={handleBuyNow}
              disabled={loading || !user}
            >
              {loading ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}