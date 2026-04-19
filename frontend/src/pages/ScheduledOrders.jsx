import { useState, useEffect } from 'react';
import {
  getSchedules, createSchedule, updateScheduleStatus,
  getSmartSuggestions, getAllProducts,
} from '../api/client';

const frequencyLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  odd_days: 'Odd Days (1st, 3rd, 5th...)',
  even_days: 'Even Days (2nd, 4th, 6th...)',
};

const productEmojis = {
  'Milk': '🥛', 'Cheese': '🧀', 'Butter': '🧈', 'Curd': '🍶',
  'Paneer': '🫙', 'Ghee': '✨', 'Yogurt': '🥣', 'Cream': '🍦',
  'Buttermilk': '🥛', 'Condensed Milk': '🍯', 'Tomato': '🍅',
  'Potato': '🥔', 'Onion': '🧅', 'Carrot': '🥕', 'Spinach': '🥬',
  'Broccoli': '🥦', 'Capsicum': '🫑', 'Cucumber': '🥒',
  'Beetroot': '❤️', 'Cauliflower': '🤍', 'Peas': '🫛',
  'Corn': '🌽', 'Garlic': '🧄', 'Ginger': '🫚', 'Mushroom': '🍄',
  'Apple': '🍎', 'Banana': '🍌', 'Orange': '🍊', 'Mango': '🥭',
  'Grapes': '🍇', 'Watermelon': '🍉', 'Papaya': '🍈',
  'Pineapple': '🍍', 'Pomegranate': '🍑', 'Guava': '🍏',
  'Strawberry': '🍓', 'Kiwi': '🥝', 'Pear': '🍐',
  'Litchi': '🍒', 'Coconut': '🥥', 'Chips': '🥔',
  'Biscuits': '🍪', 'Chocolate': '🍫', 'Namkeen': '🥜',
  'Popcorn': '🍿', 'Peanuts': '🥜', 'Granola Bar': '🌾',
  'Murukku': '🌀', 'Cashews': '🌰', 'Almonds': '🌰',
  'Walnuts': '🌰', 'Trail Mix': '🥗', 'Rice Cakes': '🍘',
  'Cookies': '🍪', 'Protein Bar': '💪', 'Orange Juice': '🍊',
  'Apple Juice': '🍎', 'Green Tea': '🍵', 'Black Coffee': '☕',
  'Coconut Water': '🥥', 'Lemonade': '🍋', 'Mango Juice': '🥭',
  'Milkshake': '🥤', 'Lassi': '🥛', 'Sparkling Water': '💧',
  'White Bread': '🍞', 'Brown Bread': '🍞', 'Croissant': '🥐',
  'Muffin': '🧁', 'Donut': '🍩', 'Cake Slice': '🎂',
  'Bagel': '🥯', 'Pita Bread': '🫓', 'Banana Bread': '🍌',
  'Rusk': '🍞', 'Basmati Rice': '🍚', 'Toor Dal': '🫘',
  'Chana Dal': '🫘', 'Moong Dal': '🫘', 'Wheat Flour': '🌾',
  'Oats': '🥣', 'Quinoa': '🌾', 'Rajma': '🫘',
  'Chickpeas': '🫘', 'Semolina': '🌾', 'Shampoo': '🧴',
  'Conditioner': '🧴', 'Face Wash': '🧼', 'Moisturiser': '🧴',
  'Toothpaste': '🪥', 'Toothbrush': '🪥', 'Soap': '🧼',
  'Deodorant': '🧴', 'Sunscreen': '🧴', 'Hand Wash': '🧼',
};

const statusBadge = {
  active: 'badge-green',
  paused: 'badge-yellow',
  cancelled: 'badge-red',
};

export default function ScheduledOrders() {
  const [schedules, setSchedules] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [formProduct, setFormProduct] = useState('');
  const [formQty, setFormQty] = useState(1);
  const [formFreq, setFormFreq] = useState('weekly');
  const [formDate, setFormDate] = useState(tomorrow.toISOString().split('T')[0]);

  const reload = () =>
    Promise.all([getSchedules(), getSmartSuggestions()])
      .then(([s, sg]) => {
        setSchedules(s.data);
        setSuggestions(sg.data);
      });

  useEffect(() => {
    Promise.all([getSchedules(), getSmartSuggestions(), getAllProducts()])
      .then(([s, sg, p]) => {
        setSchedules(s.data);
        setSuggestions(sg.data);
        setProducts(p.data);
        if (p.data.length) setFormProduct(p.data[0].product_id);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setFormLoading(true);
    try {
      await createSchedule(parseInt(formProduct), formQty, formFreq, formDate);
      await reload();
      setFormSuccess('Schedule created successfully.');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateScheduleStatus(id, status);
      await reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggest = async (s) => {
    try {
      await createSchedule(s.product_id, 1, s.frequency, s.next_order_date);
      await reload();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = ['all', 'active', 'paused', 'cancelled'];
  const filtered = schedules.filter(s => activeTab === 'all' || s.status === activeTab);

  const selectStyle = {
    padding: '11px 14px',
    background: 'white',
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    fontSize: 14,
    color: '#0F172A',
    outline: 'none',
    width: '100%',
  };

  if (loading) return (
    <div className="page">
      <div style={{ color: '#64748B', textAlign: 'center', paddingTop: 60 }}>
        Loading...
      </div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Scheduled Orders</h1>
      <p className="page-subtitle">Automate recurring grocery purchases.</p>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: '#0F172A' }}>
              Smart Suggestions
            </h2>
            <span className="badge badge-blue">AI</span>
          </div>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
            Based on your order history
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {suggestions.slice(0, 4).map((s, i) => (
              <div key={i} className="card card-blue-top" style={{
                padding: '24px 20px', minWidth: 180, textAlign: 'center',
              }}>
                <div style={{
                  width: 56, height: 56,
                  background: '#CCFBF1',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                  margin: '0 auto 12px',
                }}>
                  {productEmojis[s.product_name] || '🛒'}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 4 }}>
                  {s.product_name}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16, textTransform: 'capitalize' }}>
                  {frequencyLabels[s.frequency] || s.frequency}
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: '8px 0', fontSize: 13 }}
                  onClick={() => handleSuggest(s)}
                >
                  Schedule
                </button>
              </div>
            ))}
          </div>
          <hr className="divider" />
        </div>
      )}

      {/* Create Form */}
      <div className="card" style={{ padding: 28, marginBottom: 40 }}>
        <h2 style={{
          fontFamily: 'Fraunces, serif', fontSize: 20,
          fontWeight: 600, color: '#0F172A', marginBottom: 24,
        }}>
          Create New Schedule
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr) auto',
          gap: 16,
          alignItems: 'end',
        }}>
          <div>
            <label className="label">Product</label>
            <select
              value={formProduct}
              onChange={e => setFormProduct(e.target.value)}
              style={selectStyle}
            >
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Quantity</label>
            <input
              className="input"
              type="number"
              min="1"
              max="50"
              value={formQty}
              onChange={e => setFormQty(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Frequency</label>
            <select
              value={formFreq}
              onChange={e => setFormFreq(e.target.value)}
              style={selectStyle}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="odd_days">Odd Days (1st, 3rd, 5th...)</option>
              <option value="even_days">Even Days (2nd, 4th, 6th...)</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input
              className="input"
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            style={{ padding: '11px 20px', whiteSpace: 'nowrap' }}
            onClick={handleCreate}
            disabled={formLoading}
          >
            {formLoading ? 'Saving...' : 'Schedule'}
          </button>
        </div>
        {formSuccess && (
          <div className="alert-success" style={{ marginTop: 16 }}>{formSuccess}</div>
        )}
      </div>

      {/* Schedules list */}
      <h2 style={{
        fontFamily: 'Fraunces, serif', fontSize: 22,
        fontWeight: 600, color: '#0F172A', marginBottom: 20,
      }}>
        Your Schedules
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 18px',
            background: activeTab === t ? '#CCFBF1' : 'white',
            border: `1.5px solid ${activeTab === t ? '#99F6E4' : '#E2E8F0'}`,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: activeTab === t ? 600 : 400,
            color: activeTab === t ? '#0D9488' : '#64748B',
            textTransform: 'capitalize',
            transition: 'all 0.15s',
            cursor: 'pointer',
          }}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '32px 24px', color: '#64748B', fontSize: 14, textAlign: 'center' }}>
          No schedules in this category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(s => (
            <div key={s.schedule_id} className="card" style={{ overflow: 'hidden' }}>
              {/* Row header */}
              <div
                onClick={() => setExpanded(expanded === s.schedule_id ? null : s.schedule_id)}
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: expanded === s.schedule_id ? '#F0FDFA' : 'white',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: '#CCFBF1',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {productEmojis[s.product_name] || '🛒'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>
                      {s.product_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                      Qty: {s.quantity} &middot; {frequencyLabels[s.frequency] || s.frequency}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>
                    Next: {s.next_order_date}
                  </span>
                  <span className={`badge ${statusBadge[s.status] || 'badge-blue'}`}>
                    {s.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>
                    {expanded === s.schedule_id ? 'Hide' : 'Actions'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {expanded === s.schedule_id && (
                <div style={{
                  padding: '16px 24px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  gap: 10,
                }}>
                  {s.status === 'active' && (
                    <>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: 13, padding: '8px 16px' }}
                        onClick={() => handleStatus(s.schedule_id, 'paused')}
                      >
                        Pause
                      </button>
                      <button
                        className="btn-danger"
                        style={{ fontSize: 13 }}
                        onClick={() => handleStatus(s.schedule_id, 'cancelled')}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {s.status === 'paused' && (
                    <>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 13, padding: '8px 16px' }}
                        onClick={() => handleStatus(s.schedule_id, 'active')}
                      >
                        Resume
                      </button>
                      <button
                        className="btn-danger"
                        style={{ fontSize: 13 }}
                        onClick={() => handleStatus(s.schedule_id, 'cancelled')}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {s.status === 'cancelled' && (
                    <button
                      className="btn-primary"
                      style={{ fontSize: 13, padding: '8px 16px' }}
                      onClick={() => handleStatus(s.schedule_id, 'active')}
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}