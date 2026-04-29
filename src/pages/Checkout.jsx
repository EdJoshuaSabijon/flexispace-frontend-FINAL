import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Shield, CreditCard, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shipping_address: user?.address || '',
    contact_number: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 500;
  const total = subtotal + shippingFee;

  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-PH')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      await api.post('/orders', {
        items,
        shipping_address: formData.shipping_address,
        contact_number: formData.contact_number,
      });

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gray-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🛒</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items before proceeding to checkout</p>
        <Link to="/products" className="inline-flex items-center bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-full font-semibold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-violet-600 transition">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/cart" className="hover:text-violet-600 transition">Cart</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Form Fields */}
        <div className="space-y-6">
          {/* Shipping Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <Truck className="text-violet-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Shipping Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={user?.first_name || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={user?.last_name || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="09XX XXX XXXX"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Complete Address</label>
                <textarea
                  required
                  placeholder="Street address, building, floor, unit number"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Makati, Quezon City"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 1200"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <CreditCard className="text-violet-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-violet-200 rounded-xl bg-violet-50 cursor-pointer">
                <input type="radio" name="payment" value="cod" defaultChecked className="text-violet-600" />
                <span className="font-medium">Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
            
            {/* Items */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_path
                        ? `http://localhost:8000/storage/${item.image_path}`
                        : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold text-slate-900">Grand Total</span>
                <span className="text-xl font-bold text-violet-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white py-4 rounded-full font-semibold transition-all duration-200 shadow-lg shadow-violet-600/25"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-sm">
              <Shield size={16} />
              <span>Secure Checkout • SSL Encrypted</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
