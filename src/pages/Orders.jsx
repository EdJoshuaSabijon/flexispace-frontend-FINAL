import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Package, CheckCircle, Clock, Truck, Home, ChevronRight, MapPin, Phone } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders');
    }
  };

  const getStatusSteps = (status) => {
    const steps = [
      { key: 'Pending', icon: Clock, label: 'Pending' },
      { key: 'Processing', icon: Package, label: 'Processing' },
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

  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-PH')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'Shipped': 'bg-violet-100 text-violet-700 border-violet-200',
      'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-violet-600 transition">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/dashboard" className="hover:text-violet-600 transition">Dashboard</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900">Orders</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Package className="text-gray-400" size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="inline-flex items-center bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full font-semibold">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const steps = getStatusSteps(order.status);
            const currentStepIndex = steps.findIndex(s => s.current);

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Step Tracker Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full -z-10"></div>
                    {/* Active Progress Bar */}
                    <div 
                      className="absolute top-5 left-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full -z-10 transition-all duration-500"
                      style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = step.active && !step.current;
                      const isCurrent = step.current;
                      const isPending = !step.active;

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isCurrent 
                                ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/25 scale-110' 
                                : isCompleted
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                          </div>
                          <span className={`text-xs mt-2 font-medium ${
                            isCurrent ? 'text-violet-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="text-sm font-medium text-slate-900 mb-3">Items ({order.order_items?.length || 0})</h4>
                  <div className="space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            🪑
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.product?.name || 'Product'}</p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-slate-900">{formatPrice(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="flex justify-between items-center py-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} />
                      {order.shipping_address}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <Phone size={14} />
                      {order.contact_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-violet-600">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
