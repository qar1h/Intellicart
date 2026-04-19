import { useState, useEffect } from 'react';
import { getOrderHistory } from '../api/client';

const statusBadge = {
  delivered: 'badge-green',
  pending: 'badge-yellow',
  cancelled: 'badge-red',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getOrderHistory()
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page">
      <div style={{ color: '#64748B', textAlign: 'center', paddingTop: 60 }}>Loading orders...</div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Order History</h1>
      <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
            No orders yet
          </h3>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            Head to the Products page to place your first order.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => (
            <div key={order.order_id} className="card" style={{ overflow: 'hidden' }}>
              {/* Header row */}
              <div
                onClick={() => setExpanded(expanded === order.order_id ? null : order.order_id)}
                style={{
                  padding: '16px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: expanded === order.order_id ? '#FAFBFF' : 'white',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 700, color: '#0F172A',
                  }}>
                    Order #{order.order_id}
                  </div>
                  <span className={`badge ${statusBadge[order.status] || 'badge-blue'}`}>
                    {order.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>
                    {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#0D9488' }}>
                    Rs. {order.total_amount}
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: 12 }}>
                    {expanded === order.order_id ? 'Hide' : 'Details'}
                  </span>
                </div>
              </div>

              {/* Expanded */}
              {expanded === order.order_id && (
                <div style={{ padding: '0 24px 20px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr',
                    gap: 8, padding: '12px 0 8px',
                    fontSize: 11, fontWeight: 600, color: '#94A3B8',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    {['Product', 'Qty', 'Unit Price', 'Total'].map(h => <div key={h}>{h}</div>)}
                  </div>
                  {order.items.map((item, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr',
                      gap: 8, padding: '10px 0',
                      borderTop: '1px solid #F8FAFC',
                      fontSize: 14,
                    }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{item.name}</div>
                      <div style={{ color: '#64748B' }}>{item.quantity}</div>
                      <div style={{ color: '#64748B' }}>Rs. {item.unit_price}</div>
                      <div style={{ fontWeight: 700, color: '#0D9488' }}>Rs. {item.line_total}</div>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end',
                    paddingTop: 12, borderTop: '1px solid #F1F5F9', marginTop: 8,
                    gap: 32,
                  }}>
                    <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#0F172A' }}>Order Total</span>
                    <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: '#0D9488' }}>
                      Rs. {order.total_amount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}