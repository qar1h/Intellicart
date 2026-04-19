import { useState, useEffect } from 'react';
import { getAllProducts, getCategories, getRecommendations } from '../api/client';
import { useAuth } from '../context/AuthContext';

const categoryIcons = {
  'Dairy': 'D', 'Vegetables': 'V', 'Fruits': 'F', 'Snacks': 'S',
  'Beverages': 'B', 'Bakery': 'Ba', 'Grains & Pulses': 'G', 'Personal Care': 'P',
};

const productEmojis = {
  'Milk': '🥛', 'Cheese': '🧀', 'Butter': '🧈', 'Curd': '🍶',
  'Paneer': '🫙', 'Ghee': '✨', 'Yogurt': '🥣', 'Cream': '🍦',
  'Buttermilk': '🥛', 'Condensed Milk': '🍯',
  'Tomato': '🍅', 'Potato': '🥔', 'Onion': '🧅', 'Carrot': '🥕',
  'Spinach': '🥬', 'Broccoli': '🥦', 'Capsicum': '🫑',
  'Cucumber': '🥒', 'Beetroot': '❤️', 'Cauliflower': '🤍',
  'Peas': '🫛', 'Corn': '🌽', 'Garlic': '🧄', 'Ginger': '🫚',
  'Mushroom': '🍄', 'Apple': '🍎', 'Banana': '🍌', 'Orange': '🍊',
  'Mango': '🥭', 'Grapes': '🍇', 'Watermelon': '🍉', 'Papaya': '🍈',
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

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const emoji = productEmojis[product.name] || '🛒';

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '0 0 14px 0',
        textAlign: 'center',
        minWidth: 150,
        maxWidth: 150,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,148,136,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Emoji image area */}
      <div style={{
        width: '100%',
        height: 90,
        background: '#CCFBF1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        fontSize: 42,
      }}>
        {emoji}
      </div>

      <div style={{ padding: '0 12px' }}>
        <div style={{
          fontWeight: 600, fontSize: 13, color: '#0F172A',
          marginBottom: 4, lineHeight: 1.3,
        }}>
          {product.name}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0D9488', marginBottom: 12 }}>
          Rs. {product.price}
        </div>
        <button
          onClick={handleAdd}
          style={{
            width: '100%',
            padding: '7px 0',
            background: added ? '#DCFCE7' : '#CCFBF1',
            border: `1px solid ${added ? '#BBF7D0' : '#99F6E4'}`,
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            color: added ? '#16A34A' : '#0D9488',
            transition: 'all 0.15s',
            cursor: 'pointer',
          }}
        >
          {added ? 'Added' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default function Products({ cart, addToCart }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([getAllProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setLoading(false));

    if (user) {
      getRecommendations()
        .then(res => setRecommendations(res.data))
        .catch(() => { });
    }
  }, [user]);

  const handleAdd = (product) => {
    addToCart({ id: product.product_id, name: product.name, price: parseFloat(product.price), category: product.category });
    setToast(`${product.name} added to cart`);
    setTimeout(() => setToast(''), 2000);
  };

  if (loading) return (
    <div className="page">
      <div style={{ color: '#64748B', textAlign: 'center', paddingTop: 60 }}>Loading products...</div>
    </div>
  );

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'white', border: '1px solid #99F6E4',
          borderLeft: '4px solid #0D9488',
          borderRadius: 10, padding: '12px 20px',
          fontSize: 14, fontWeight: 500, color: '#0F172A',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          {toast}
        </div>
      )}

      <h1 className="page-title">Products</h1>
      <p className="page-subtitle">Browse our full catalogue of fresh groceries and essentials.</p>

      {/* Cart banner */}
      {cart.length > 0 && (
        <div style={{
          background: '#CCFBF1', border: '1px solid #99F6E4',
          borderRadius: 10, padding: '12px 18px',
          fontSize: 14, fontWeight: 500, color: '#0D9488',
          marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{cart.length} item{cart.length > 1 ? 's' : ''} in your cart</span>
          <a href="/cart" style={{ fontWeight: 600, color: '#0D9488', textDecoration: 'underline', fontSize: 13 }}>
            View Cart
          </a>
        </div>
      )}

      {/* Recommendations */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: '#0F172A' }}>
            Recommended for You
          </h2>
          <span className="badge badge-blue">AI</span>
        </div>

        {!user ? (
          <div className="card" style={{ padding: '20px 24px', color: '#64748B', fontSize: 14 }}>
            Sign in to see personalised recommendations based on your purchase history.
          </div>
        ) : recommendations.length === 0 ? (
          <div className="card" style={{ padding: '20px 24px', color: '#64748B', fontSize: 14 }}>
            Place your first order to start receiving personalised recommendations.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16 }}>
            {recommendations.map((rec, i) => (
              <div key={i} className="card card-blue-top" style={{
                padding: '0 0 20px 0',
                minWidth: 180,
                textAlign: 'center',
                overflow: 'hidden',
              }}>
                {/* Emoji image area */}
                <div style={{
                  width: '100%', height: 80,
                  background: '#CCFBF1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                  fontSize: 38,
                }}>
                  {productEmojis[rec.name] || '🛒'}
                </div>

                <div style={{ padding: '0 18px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 2 }}>
                    {rec.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                    {rec.category}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0D9488', marginBottom: 8 }}>
                    Rs. {rec.price}
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: 11, marginBottom: 12, display: 'inline-flex' }}>
                    Recommended
                  </span>
                  <button
                    onClick={() => handleAdd(rec)}
                    className="btn-primary"
                    style={{ width: '100%', padding: '8px 0', fontSize: 13, marginTop: 10 }}
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="divider" />

      {/* Categories */}
      {categories.map(cat => {
        const catProducts = products.filter(p => p.category === cat);
        return (
          <div key={cat} style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32,
                background: '#CCFBF1', border: '1px solid #99F6E4',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#0D9488',
              }}>
                {categoryIcons[cat] || cat[0]}
              </div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#0F172A' }}>
                {cat}
              </h3>
              <span style={{ fontSize: 13, color: '#94A3B8' }}>{catProducts.length} items</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {catProducts.map(p => (
                <ProductCard key={p.product_id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}