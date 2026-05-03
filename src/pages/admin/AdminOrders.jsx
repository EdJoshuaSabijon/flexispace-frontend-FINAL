import { useEffect, useState } from 'react';
import { Eye, Package, Download, ShieldX } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    // Optimistic update
    const previousOrders = [...orders];
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      // We don't necessarily need to fetch again if optimistic update works,
      // but if we do, maybe it causes a flicker. Let's just keep the optimistic state.
    } catch (error) {
      // Revert on error
      setOrders(previousOrders);
      alert('Failed to update order status');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/orders/export', {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export orders');
    }
  };

  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-PH')}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-300',
      'Processing': 'bg-blue-100 text-blue-700 border-blue-300',
      'Shipped': 'bg-violet-100 text-violet-700 border-violet-300',
      'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'Cancelled': 'bg-orange-100 text-orange-700 border-orange-300',
      'Rejected': 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <AdminLayout>
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Orders</h1>
          <p className="text-gray-500 mt-1">View and update customer order statuses</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-400" size={28} />
                  </div>
                  <p className="text-gray-500">No orders found</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {order.customer?.name}
                    </div>
                    <div className="text-xs text-gray-500">{order.customer?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-violet-600">
                    {formatPrice(order.total_amount || order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className={`text-sm font-medium rounded-lg px-3 py-2 border focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer transition-all duration-300 ${getStatusColor(order.status)}`}
                    >
                      <option value="Pending" className="bg-white text-gray-900">Pending</option>
                      <option value="Processing" className="bg-white text-gray-900">Processing</option>
                      <option value="Shipped" className="bg-white text-gray-900">Shipped</option>
                      <option value="Delivered" className="bg-white text-gray-900">Delivered</option>
                      <option value="Cancelled" className="bg-white text-gray-900">Cancelled</option>
                      <option value="Rejected" className="bg-white text-gray-900">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button
                      onClick={() => {
                        console.log('Order data:', JSON.stringify(order, null, 2));
                        setSelectedOrder(order);
                      }}
                      className="inline-flex items-center gap-1 text-violet-600 hover:bg-violet-50 px-3 py-2 rounded-lg transition"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-400">Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-PH', {year:'numeric',month:'long',day:'numeric'})}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  👤 Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">{selectedOrder.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium">{selectedOrder.customer?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium">{
                      selectedOrder.contact_number ||
                      selectedOrder.phone ||
                      selectedOrder.user?.phone ||
                      selectedOrder.user?.contact_number ||
                      'N/A'
                    }</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  📍 Shipping Address
                </h3>
                <p className="text-sm text-gray-700">{
                  selectedOrder.shipping_address ||
                  selectedOrder.address ||
                  selectedOrder.delivery_address ||
                  'No address provided'
                }</p>
              </div>

              {/* Order Items */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  📦 Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => {
                    const itemPrice = Number(item.unit_price || item.price || item.product?.price || 0);
                    const itemTotal = (itemPrice * Number(item.quantity || 1)).toLocaleString('en-PH');
                    return (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          IMG
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_name || item.product?.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-purple-700 text-sm">
                          ₱{itemTotal}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      selectedOrder.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-bold text-gray-800 uppercase">
                    {selectedOrder.payment_method?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="text-xl font-bold text-purple-700">
                    ₱{Number(selectedOrder.total_amount || selectedOrder.total || 0).toLocaleString('en-PH')}
                  </span>
                </div>
              </div>

              {/* Proof of Payment */}
              {selectedOrder.payment_method === 'gcash' && selectedOrder.proof_of_payment && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    🧾 Proof of Payment
                  </h3>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <img 
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${selectedOrder.proof_of_payment}`} 
                      alt="Proof of Payment" 
                      className="w-full h-auto max-h-96 object-contain bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Cancel/Rejection Info */}
              {selectedOrder.cancel_reason && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <h3 className="font-semibold text-orange-700 mb-1">🚫 Cancellation Reason</h3>
                  <p className="text-sm text-orange-600">{selectedOrder.cancel_reason}</p>
                </div>
              )}
              {selectedOrder.rejection_reason && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h3 className="font-semibold text-red-700 mb-1">❌ Rejection Reason</h3>
                  <p className="text-sm text-red-600">{selectedOrder.rejection_reason}</p>
                </div>
              )}

              {/* Reject Button for GCash orders */}
              {selectedOrder.payment_method === 'gcash' && selectedOrder.status === 'Pending' && (
                <button
                  onClick={() => {
                    setRejectOrderId(selectedOrder.id);
                    setSelectedOrder(null);
                    setShowRejectModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                >
                  <ShieldX size={18} />
                  Reject Order (Unreliable Proof)
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-purple-700 text-white py-3 rounded-xl font-semibold hover:bg-purple-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Reject Order Modal */}
    {showRejectModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
            <ShieldX size={22} /> Reject Order #{rejectOrderId}
          </h2>
          <p className="text-sm text-gray-500 mb-4">This will reject the order due to unreliable proof of payment.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!rejectionReason.trim()) { alert('Please provide a reason.'); return; }
            try {
              await api.patch(`/admin/orders/${rejectOrderId}/reject`, { rejection_reason: rejectionReason });
              alert('Order rejected successfully.');
              setShowRejectModal(false);
              setRejectionReason('');
              fetchOrders();
            } catch (error) {
              alert(error.response?.data?.message || 'Failed to reject order.');
            }
          }}>
            <textarea
              required
              rows="3"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why the proof of payment is being rejected..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition">Reject Order</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </AdminLayout>
  );
}
