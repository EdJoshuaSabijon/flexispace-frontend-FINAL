import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { 
  ShoppingBag, Users, Coins, Package, Plus, ChevronRight, 
  LayoutDashboard, ClipboardList, LogOut, CheckCircle, Clock, Truck
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    // Set current date
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    setCurrentDate(date);
    
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/products'),
        api.get('/admin/customers'),
      ]);

      const totalRevenue = ordersRes.data
        .filter(order => order.status === 'Delivered')
        .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

      setStats({
        totalOrders: ordersRes.data.length,
        totalRevenue,
        totalProducts: productsRes.data.length,
        totalCustomers: customersRes.data.length,
      });
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      // Get last 5 orders, sorted by date
      const sorted = response.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentOrders(sorted);
    } catch (error) {
      console.error('Failed to fetch recent orders');
    }
  };

  const formatPrice = (price) => {
    return `₱${Number(price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Processing': 'bg-blue-100 text-blue-700',
      'Shipped': 'bg-purple-100 text-purple-700',
      'Delivered': 'bg-green-100 text-green-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { path: '/admin/customers', label: 'Customers', icon: Users },
  ];

  return (
    <AdminLayout>
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {greeting}, Admin! 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
          </div>
          <div className="text-right mt-4 sm:mt-0">
            <p className="text-sm text-gray-400">Today</p>
            <p className="text-lg font-semibold text-slate-900">{currentDate}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Orders */}
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-violet-500 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="text-violet-600" size={24} />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-emerald-500 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Coins className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Products</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customers</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Orders - Left 60% */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
              <Link 
                to="/admin/orders" 
                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                View All Orders <ChevronRight size={16} />
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Order ID</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Customer</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Total</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 text-sm font-medium text-slate-900">#{order.id}</td>
                        <td className="py-4 text-sm text-gray-600">{order.user?.name || 'Guest'}</td>
                        <td className="py-4 text-sm font-semibold text-slate-900">{formatPrice(order.total_amount)}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions - Right 40% */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            
            <div className="space-y-3">
              <Link
                to="/admin/products"
                className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition group"
              >
                <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
                  <Plus className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-violet-700">Add Product</p>
                  <p className="text-xs text-gray-500">Create new product listing</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-violet-600" size={20} />
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ClipboardList className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-blue-700">Manage Orders</p>
                  <p className="text-xs text-gray-500">View and update orders</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-blue-600" size={20} />
              </Link>

              <Link
                to="/admin/customers"
                className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition group"
              >
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-orange-700">View Customers</p>
                  <p className="text-xs text-gray-500">Manage customer accounts</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-orange-600" size={20} />
              </Link>

              <Link
                to="/admin/products"
                className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition group"
              >
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700">All Products</p>
                  <p className="text-xs text-gray-500">Browse product catalog</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-emerald-600" size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-violet-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Pro Tip</h3>
              <p className="text-sm text-gray-600">
                Keep your product inventory up to date by regularly checking stock levels. 
                Low stock items should be restocked promptly to avoid customer disappointment.
              </p>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
