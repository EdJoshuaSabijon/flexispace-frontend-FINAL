import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, ShoppingBag, User, Settings, ChevronRight, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchOrders();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  // Extract order ID from notification message (e.g., "Order #1 status updated...")
  const getOrderIdFromNotification = (notification) => {
    const message = notification.data?.message || '';
    const match = message.match(/Order #(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const handleNotificationClick = (notification) => {
    const orderId = getOrderIdFromNotification(notification);
    if (orderId) {
      navigate(`/orders`);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-PH')}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'Shipped': 'bg-violet-100 text-violet-700 border-violet-200',
      'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name || 'Guest'}!</h1>
        <p className="text-violet-100">Manage your orders, view notifications, and update your profile.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
            <Package className="text-violet-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
            <p className="text-gray-500 text-sm">Total Orders</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Clock className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{pendingOrders}</p>
            <p className="text-gray-500 text-sm">Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{deliveredOrders}</p>
            <p className="text-gray-500 text-sm">Delivered</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
              <Link to="/orders" className="text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                View All <ChevronRight size={18} />
              </Link>
            </div>
            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No orders yet</p>
                <Link to="/products" className="text-violet-600 hover:text-violet-700 text-sm mt-2 inline-block">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Order ID</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                        <td className="py-4 font-medium text-slate-900">#{order.id}</td>
                        <td className="py-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-right font-semibold text-slate-900">{formatPrice(order.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bell size={20} className="text-violet-600" />
                Notifications
              </h2>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-500">
                {loadingOrders ? 'Loading...' : 'No notifications yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-xl cursor-pointer transition ${notification.read_at ? 'bg-gray-50 hover:bg-gray-100' : 'bg-violet-50 border border-violet-100 hover:bg-violet-100'}`}
                  >
                    <p className="text-sm text-slate-900">{notification.data?.message || 'Notification'}</p>
                    {!notification.read_at && (
                      <button
                        onClick={(e) => markAsRead(notification.id, e)}
                        className="text-xs text-violet-600 hover:text-violet-700 mt-2 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links & Profile */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
                <User className="text-violet-600" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{user?.first_name} {user?.last_name}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>
            <Link 
              to="#" 
              className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              <Settings size={16} />
              Edit Profile
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link
                to="/orders"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                <ShoppingBag className="text-violet-600" size={20} />
                <span className="flex-1 font-medium text-slate-900 group-hover:text-violet-600">View Orders</span>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
              <Link
                to="/products"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
              >
                <Package className="text-violet-600" size={20} />
                <span className="flex-1 font-medium text-slate-900 group-hover:text-violet-600">Browse Products</span>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
