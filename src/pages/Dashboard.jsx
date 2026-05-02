import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, User, Settings, Bell, MapPin, Truck, Home, LogOut, Phone, CreditCard, ChevronRight, Activity, CornerUpLeft, RefreshCcw, XCircle, Camera, Ban } from 'lucide-react';
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

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile state
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', phone: '', address: '', latitude: null, longitude: null });
  const [profilePosition, setProfilePosition] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Return state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [defectImage, setDefectImage] = useState(null);
  const [defectPreview, setDefectPreview] = useState(null);

  // Cancel state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const cancelReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery time is too long',
    'Want to change shipping address',
    'Want to modify order items',
    'Financial reasons',
    'Other',
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        latitude: user.latitude || null,
        longitude: user.longitude || null
      });
      if (user.latitude && user.longitude) {
        setProfilePosition({ lat: parseFloat(user.latitude), lng: parseFloat(user.longitude) });
      } else {
        setProfilePosition({ lat: 14.5995, lng: 120.9842 }); // Default Manila
      }
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/returns')
      ]);
      setOrders(ordersRes.data);
      setReturns(returnsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const dataToSave = { ...profileData };
      if (profilePosition) {
        dataToSave.latitude = profilePosition.lat;
        dataToSave.longitude = profilePosition.lng;
      }
      const response = await api.put('/profile', dataToSave);
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.response && error.response.data) {
        alert('Server Error: ' + JSON.stringify(error.response.data));
      } else {
        alert('Network Error or no response data: ' + error.message);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSearch = async () => {
    if (!profileData.address) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profileData.address)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setProfilePosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        console.warn('Could not find that address on the map. Please pin it manually.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!defectImage) {
      alert('Please upload a photo of the defect.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('order_id', returnOrderId);
      formData.append('reason', returnReason);
      formData.append('defect_image', defectImage);
      await api.post('/returns', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Return request submitted!');
      setShowReturnModal(false);
      setReturnReason('');
      setDefectImage(null);
      setDefectPreview(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason) {
      alert('Please select a reason for cancellation.');
      return;
    }
    try {
      await api.patch(`/orders/${cancelOrderId}/cancel`, { cancel_reason: cancelReason });
      alert('Order cancelled successfully.');
      setShowCancelModal(false);
      setCancelReason('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleDefectImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDefectImage(file);
      setDefectPreview(URL.createObjectURL(file));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatPrice = (price) => `₱${Number(price).toLocaleString('en-PH')}`;

  const getStatusSteps = (status) => {
    const steps = [
      { key: 'Pending', icon: Clock, label: 'Pending' },
      { key: 'Processing', icon: Activity, label: 'Processing' },
      { key: 'Shipped', icon: Truck, label: 'Shipped' },
      { key: 'Delivered', icon: Home, label: 'Delivered' },
    ];
    const currentIndex = steps.findIndex(step => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      active: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const renderTimeline = (status) => {
    const steps = getStatusSteps(status);
    const currentStepIndex = steps.findIndex(s => s.current);
    
    return (
      <div className="relative pt-4 pb-2">
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200/50 rounded-full -z-10"></div>
        <div 
          className="absolute top-8 left-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full -z-10 transition-all duration-700"
          style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
        ></div>
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.active && !step.current;
            const isCurrent = step.current;
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 backdrop-blur-sm
                  ${isCurrent ? 'bg-violet-600/90 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-110' : 
                    isCompleted ? 'bg-emerald-500/90 border-emerald-400 text-white' : 
                    'bg-white/50 border-gray-300 text-gray-400'}`}>
                  {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-violet-700 font-bold' : isCompleted ? 'text-emerald-700' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div></div>;
  }

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-fixed bg-center">
      {/* Glass Overlay */}
      <div className="min-h-screen bg-slate-50/80 backdrop-blur-md pb-12 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-4">
              <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4">
                  <span className="text-2xl font-bold text-white">{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{user?.first_name} {user?.last_name}</h2>
                <p className="text-sm text-slate-500 mb-6">{user?.email}</p>
                
                <nav className="space-y-2 text-left">
                  {[
                    { id: 'overview', icon: Activity, label: 'Overview' },
                    { id: 'orders', icon: Package, label: 'My Orders' },
                    { id: 'returns', icon: CornerUpLeft, label: 'Returns' },
                    { id: 'profile', icon: User, label: 'Edit Profile' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200
                        ${activeTab === tab.id 
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 scale-[1.02]' 
                          : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  ))}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-red-500 hover:bg-red-50 transition-all duration-200 mt-4">
                    <LogOut size={18} />
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
              
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 rounded-3xl p-8 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Welcome back, {user?.first_name}! ✨</h1>
                  <p className="text-violet-100 text-lg max-w-xl">Track your recent orders, manage returns, and explore premium furniture tailored to your space.</p>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="transition-all duration-300">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform">
                        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 shadow-inner">
                          <Package size={28} />
                        </div>
                        <div>
                          <p className="text-3xl font-black text-slate-800">{orders.length}</p>
                          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Orders</p>
                        </div>
                      </div>
                      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform">
                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                          <Clock size={28} />
                        </div>
                        <div>
                          <p className="text-3xl font-black text-slate-800">{pendingOrders}</p>
                          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
                        </div>
                      </div>
                      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                          <CheckCircle size={28} />
                        </div>
                        <div>
                          <p className="text-3xl font-black text-slate-800">{deliveredOrders}</p>
                          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed</p>
                        </div>
                      </div>
                    </div>

                    {/* Latest Order Quick Track */}
                    {orders.length > 0 && (
                      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-lg shadow-slate-200/50">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-slate-800">Latest Order Tracking</h3>
                          <button onClick={() => setActiveTab('orders')} className="text-violet-600 text-sm font-bold hover:text-fuchsia-600 flex items-center gap-1">
                            View All <ChevronRight size={16}/>
                          </button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center bg-slate-50/50 p-4 rounded-2xl">
                          <div className="w-20 h-20 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Package className="text-violet-600" size={32} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-800">Order #{orders[0].id}</p>
                            <p className="text-slate-500">{new Date(orders[0].created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="md:ml-auto text-right">
                            <p className="text-2xl font-black text-violet-600">{formatPrice(orders[0].total_amount)}</p>
                            <p className="text-slate-500 text-sm">{orders[0].order_items?.length || 0} items</p>
                          </div>
                        </div>
                        {renderTimeline(orders[0].status)}
                      </div>
                    )}
                  </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Package className="text-violet-600"/> My Orders</h2>
                    {orders.length === 0 ? (
                      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/50 shadow-sm">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No orders yet</h3>
                        <p className="text-slate-500 mb-6">When you place an order, it will appear here.</p>
                        <Link to="/products" className="inline-block bg-violet-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-violet-500/30 hover:-translate-y-1 transition-transform">Start Shopping</Link>
                      </div>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-md shadow-slate-200/50 group hover:shadow-lg transition-shadow">
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-8 border-b border-slate-100 pb-6">
                            <div>
                              <h3 className="text-xl font-black text-slate-800">Order #{order.id}</h3>
                              <p className="text-slate-500 mt-1 flex items-center gap-2">
                                <Clock size={14}/> {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-violet-600">{formatPrice(order.total_amount)}</p>
                              <span className="inline-block mt-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold uppercase tracking-wider">{order.payment_method}</span>
                            </div>
                          </div>

                          <div className="mb-8">
                            {renderTimeline(order.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 rounded-2xl p-6">
                            <div>
                              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><MapPin size={16} className="text-violet-500"/> Shipping Details</h4>
                              <p className="text-slate-600 text-sm">{order.shipping_address}</p>
                              <p className="text-slate-600 text-sm mt-1">{order.contact_number}</p>
                              {order.logistics_provider && (
                                <p className="text-sm font-medium text-slate-800 mt-3 flex items-center gap-2"><Truck size={16} className="text-violet-500"/> Courier: {order.logistics_provider.name}</p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Package size={16} className="text-violet-500"/> Items</h4>
                              <div className="space-y-2">
                                {order.order_items?.map(item => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-slate-600">{item.quantity}x {item.product?.name}</span>
                                    <span className="font-medium text-slate-800">{formatPrice(item.unit_price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Cancel Button - only for Pending/Processing */}
                          {['Pending', 'Processing'].includes(order.status) && (
                            <div className="mt-6 flex justify-end gap-3">
                              <button 
                                onClick={() => { setCancelOrderId(order.id); setShowCancelModal(true); }}
                                className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors"
                              >
                                <Ban size={16} /> Cancel Order
                              </button>
                            </div>
                          )}

                          {/* Return Button - only for Delivered */}
                          {order.status === 'Delivered' && !returns.find(r => r.order_id === order.id) && (
                            <div className="mt-6 flex justify-end">
                              <button 
                                onClick={() => { setReturnOrderId(order.id); setShowReturnModal(true); }}
                                className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                              >
                                <CornerUpLeft size={16} /> Request Return
                              </button>
                            </div>
                          )}

                          {/* Cancelled/Rejected badge */}
                          {order.status === 'Cancelled' && (
                            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                              <p className="text-sm font-bold text-orange-700 flex items-center gap-2"><XCircle size={16}/> Order Cancelled</p>
                              {order.cancel_reason && <p className="text-sm text-orange-600 mt-1">Reason: {order.cancel_reason}</p>}
                            </div>
                          )}
                          {order.status === 'Rejected' && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                              <p className="text-sm font-bold text-red-700 flex items-center gap-2"><XCircle size={16}/> Order Rejected</p>
                              {order.rejection_reason && <p className="text-sm text-red-600 mt-1">Reason: {order.rejection_reason}</p>}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* RETURNS TAB */}
                {activeTab === 'returns' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><RefreshCcw className="text-violet-600"/> My Returns</h2>
                    {returns.length === 0 ? (
                      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/50 shadow-sm">
                        <RefreshCcw size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No returns</h3>
                        <p className="text-slate-500">You haven't requested any returns.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {returns.map(ret => (
                          <div key={ret.id} className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                              <p className="font-bold text-slate-800">Return for Order #{ret.order_id}</p>
                              <p className="text-sm text-slate-500 mt-1">Requested on {new Date(ret.created_at).toLocaleDateString()}</p>
                              <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-sm text-slate-700 italic">"{ret.reason}"</p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                                ret.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                ret.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {ret.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-lg shadow-slate-200/50">
                      <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2"><Settings className="text-violet-600"/> Edit Profile Details</h2>
                      <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                            <input type="text" required value={profileData.first_name} onChange={e => setProfileData({...profileData, first_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow bg-white/50 backdrop-blur-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                            <input type="text" required value={profileData.last_name} onChange={e => setProfileData({...profileData, last_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow bg-white/50 backdrop-blur-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                          <input type="tel" required value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow bg-white/50 backdrop-blur-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Complete Address</label>
                          <div className="flex gap-2">
                            <textarea required value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} onBlur={handleAddressSearch} rows="2" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow bg-white/50 backdrop-blur-sm resize-none" placeholder="House/Unit No., Street, Barangay, City, Province" />
                            <button type="button" onClick={handleAddressSearch} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors self-start whitespace-nowrap border border-slate-200">
                              Find on Map
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Pin Default Location</label>
                          <p className="text-sm text-slate-500 mb-4">Set your default location so it automatically populates during checkout.</p>
                          <div className="h-[250px] w-full rounded-xl overflow-hidden border border-slate-200 z-0">
                            {profilePosition && (
                              <MapContainer center={profilePosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker position={profilePosition} setPosition={setProfilePosition} />
                              </MapContainer>
                            )}
                          </div>
                        </div>
                        <button type="submit" disabled={savingProfile} className="w-full sm:w-auto px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><Ban className="text-orange-500"/> Cancel Order</h3>
            <p className="text-slate-500 mb-6">Order #{cancelOrderId}</p>
            <form onSubmit={handleCancelOrder}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Select a reason for cancellation</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cancelReasons.map((reason) => (
                    <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      cancelReason === reason ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50/50'
                    }`}>
                      <input type="radio" name="cancelReason" value={reason} checked={cancelReason === reason} onChange={(e) => setCancelReason(e.target.value)} className="accent-orange-500" />
                      <span className="text-sm text-slate-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowCancelModal(false); setCancelReason(''); }} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Back</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-colors">Confirm Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal with Defect Image */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><CornerUpLeft className="text-red-500"/> Request Return</h3>
            <p className="text-slate-500 mb-6">Order #{returnOrderId}</p>
            <form onSubmit={handleReturnSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason for return</label>
                <textarea 
                  required 
                  rows="3" 
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  placeholder="Describe the defect or issue with the product..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Camera size={16}/> Upload Photo of Defect <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-violet-400 transition-colors cursor-pointer" onClick={() => document.getElementById('defectImageInput').click()}>
                  {defectPreview ? (
                    <img src={defectPreview} alt="Defect preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <div className="py-6">
                      <Camera size={32} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Click to upload a photo of the defect</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                  <input id="defectImageInput" type="file" accept="image/*" className="hidden" onChange={handleDefectImageChange} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowReturnModal(false); setDefectImage(null); setDefectPreview(null); setReturnReason(''); }} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">Submit Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
