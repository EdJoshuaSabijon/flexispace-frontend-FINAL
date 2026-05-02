import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Shield, CreditCard, ChevronRight, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    shipping_address: user?.address || '',
    contact_number: user?.phone || '',
    payment_method: 'cod',
    logistics_provider_id: ''
  });
  
  const [position, setPosition] = useState(null); // {lat, lng}
  const [logisticsProviders, setLogisticsProviders] = useState([]);
  const [gcashSettings, setGcashSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState(null);

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const selectedProvider = logisticsProviders.find(p => p.id.toString() === formData.logistics_provider_id.toString());
  const shippingFee = selectedProvider ? Number(selectedProvider.shipping_fee) : 0;
  const total = subtotal + shippingFee;

  useEffect(() => {
    fetchProviders();
    fetchGcashSettings();
    
    // Set user location from profile if it exists
    if (user?.latitude && user?.longitude) {
      setPosition({ lat: parseFloat(user.latitude), lng: parseFloat(user.longitude) });
    } else if (navigator.geolocation) {
      // Otherwise get current location
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setPosition({ lat: 14.5995, lng: 120.9842 }) // Default Manila
      );
    } else {
      setPosition({ lat: 14.5995, lng: 120.9842 });
    }
  }, [user]);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/logistics-providers');
      setLogisticsProviders(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, logistics_provider_id: response.data[0].id.toString() }));
      }
    } catch (error) {
      console.error('Failed to fetch logistics providers');
    }
  };

  const fetchGcashSettings = async () => {
    try {
      const response = await api.get('/gcash-settings');
      setGcashSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch gcash settings');
    }
  };

  const handleAddressSearch = async () => {
    if (!formData.shipping_address) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.shipping_address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        console.warn('Could not find that address on the map. Please pin it manually.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-PH')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.payment_method === 'gcash' && !proofFile) {
        throw new Error('Please upload proof of payment for GCash.');
      }

      const submitData = new FormData();
      submitData.append('shipping_address', formData.shipping_address);
      submitData.append('contact_number', formData.contact_number);
      submitData.append('payment_method', formData.payment_method);
      if (formData.logistics_provider_id) submitData.append('logistics_provider_id', formData.logistics_provider_id);
      if (position?.lat) submitData.append('latitude', position.lat);
      if (position?.lng) submitData.append('longitude', position.lng);
      
      if (formData.payment_method === 'gcash' && proofFile) {
        submitData.append('proof_of_payment', proofFile);
      }
      
      cart.forEach((item, index) => {
        submitData.append(`items[${index}][product_id]`, item.product_id);
        submitData.append(`items[${index}][quantity]`, item.quantity);
      });

      await api.post('/orders', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('storage'));
      navigate('/dashboard'); // Go back to dashboard
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-violet-600 transition">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/cart" className="hover:text-violet-600 transition">Cart</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-violet-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Pin Your Location</h2>
              </div>
              {user?.latitude && user?.longitude && (
                <button type="button" onClick={() => setPosition({ lat: parseFloat(user.latitude), lng: parseFloat(user.longitude) })} className="text-sm font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors">
                  Use Default Address
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-4">Click on the map to accurately pinpoint your delivery address. This defaults to your saved profile location.</p>
            <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0">
              {position && (
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              )}
            </div>
            {position && (
              <p className="text-xs text-slate-400 mt-2 text-right">
                Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <Truck className="text-violet-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Shipping Details</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">First Name</label>
                  <input type="text" readOnly value={user?.first_name || ''} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Last Name</label>
                  <input type="text" readOnly value={user?.last_name || ''} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Phone Number</label>
                <input required type="tel" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="09XX XXX XXXX" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Complete Address</label>
                <div className="flex gap-2">
                  <textarea required value={formData.shipping_address} onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })} onBlur={handleAddressSearch} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none" rows={2} placeholder="House/Unit No., Street, Barangay, City, Province" />
                  <button type="button" onClick={handleAddressSearch} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors self-start whitespace-nowrap border border-slate-200">
                    Find on Map
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Select Courier</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {logisticsProviders.map(provider => (
                    <label 
                      key={provider.id} 
                      className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all
                        ${formData.logistics_provider_id === provider.id.toString() 
                          ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600 shadow-sm' 
                          : 'border-gray-200 hover:border-violet-300'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{provider.name}</span>
                        <input 
                          type="radio" 
                          name="courier" 
                          value={provider.id}
                          checked={formData.logistics_provider_id === provider.id.toString()}
                          onChange={(e) => setFormData({...formData, logistics_provider_id: e.target.value})}
                          className="text-violet-600"
                        />
                      </div>
                      <span className="text-sm font-medium text-violet-600">₱{provider.shipping_fee}</span>
                    </label>
                  ))}
                </div>
                {logisticsProviders.length === 0 && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">No logistics providers available at the moment.</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <CreditCard className="text-violet-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all
                ${formData.payment_method === 'cod' ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600 shadow-sm' : 'border-gray-200 hover:border-violet-300'}`}>
                <input type="radio" name="payment" value="cod" checked={formData.payment_method === 'cod'} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="text-violet-600" />
                <span className="font-bold text-slate-800">Cash on Delivery</span>
              </label>

              {gcashSettings?.is_active && (
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all
                  ${formData.payment_method === 'gcash' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}>
                  <input type="radio" name="payment" value="gcash" checked={formData.payment_method === 'gcash'} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="text-blue-600" />
                  <span className="font-bold text-blue-800">GCash</span>
                </label>
              )}
            </div>

            {formData.payment_method === 'gcash' && gcashSettings && (
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col sm:flex-row gap-6 items-center animate-in fade-in slide-in-from-top-4">
                {gcashSettings.gcash_qr_code && (
                  <div className="w-48 h-48 bg-white p-2 rounded-2xl shadow-sm flex-shrink-0 border border-blue-100">
                    <img src={`http://localhost:8000/storage/${gcashSettings.gcash_qr_code}`} alt="GCash QR" className="w-full h-full object-contain rounded-xl" />
                  </div>
                )}
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Scan to Pay</h3>
                  <p className="text-blue-800 mb-1">Account Name: <strong>{gcashSettings.gcash_account_name}</strong></p>
                  <p className="text-blue-800 mb-4">Account Number: <strong>{gcashSettings.gcash_number}</strong></p>
                  <div className="bg-blue-100/50 p-4 rounded-xl mb-4">
                    <p className="text-sm text-blue-800">Please send the exact amount of <strong>{formatPrice(total)}</strong> to the GCash details above. Your order will remain pending until payment is verified by the admin.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-2">Upload Proof of Payment *</label>
                    <input required type="file" accept="image/*" onChange={e => setProofFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-gray-100 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.product_id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image_path ? `http://localhost:8000/storage/${item.image_path}` : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150&q=80'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-bold text-slate-800 truncate text-sm">{item.name}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      <p className="font-bold text-slate-800 text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping ({selectedProvider?.name || '...'})</span>
                <span className="font-medium">{formatPrice(shippingFee)}</span>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-end">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Grand Total</span>
                <span className="text-2xl font-black text-violet-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.logistics_provider_id}
              className="w-full mt-8 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-violet-600/30 hover:-translate-y-0.5"
            >
              {loading ? 'Processing...' : formData.payment_method === 'gcash' ? 'Confirm & Place Order' : 'Place Order'}
            </button>

            <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-sm font-medium">
              <Shield size={16} />
              <span>Secure Checkout • SSL Encrypted</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
