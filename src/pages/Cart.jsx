import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Minus, Plus, ArrowLeft, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.product_id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const formatPrice = (price) => {
    const num = Number(price || 0);
    return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const shippingFee = 500;
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item?.price || 0);
    const qty = Number(item?.quantity || 1);
    return sum + (price * qty);
  }, 0);
  const total = subtotal + shippingFee;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-full w-32 h-32 mx-auto mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gray-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="text-gray-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Start exploring our collection!
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
        >
          Continue Shopping <ArrowLeft className="ml-2 rotate-180" size={18} />
        </Link>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-violet-600 transition">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Shopping Cart</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, index) => {
            // Skip invalid items
            if (!item || typeof item !== 'object') return null;
            
            const productId = item.product_id || item.id || index;
            const name = item.name || 'Unnamed Product';
            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 1);
            const imagePath = item.image_path || null;
            
            return (
              <div key={productId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={imagePath 
                      ? `http://localhost:8000/storage/${imagePath}`
                      : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80'}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
                  <p className="text-violet-600 font-bold">{formatPrice(price)}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(productId, quantity - 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(productId, quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Item Total */}
                <p className="font-bold text-slate-900 w-28 text-right">
                  {formatPrice(price * quantity)}
                </p>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(productId)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          {/* Continue Shopping Link */}
          <Link to="/products" className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium mt-4">
            <ArrowLeft size={18} className="mr-2" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck size={16} />
                  Shipping
                </span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-violet-600">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-violet-600 hover:bg-violet-700 text-white text-center py-4 rounded-full font-semibold transition-colors shadow-lg shadow-violet-600/25"
            >
              Proceed to Checkout
            </Link>

            <p className="text-xs text-gray-500 text-center mt-4">
              Shipping fee is flat rate ₱500 for all orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
