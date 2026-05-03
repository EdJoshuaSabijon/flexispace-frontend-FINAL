import { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import { Mail, Phone, MapPin, Users, ShoppingBag, Trash2, X, CheckCircle } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching customers with token:', token ? 'Token exists' : 'NO TOKEN');
      
      const response = await api.get('/admin/customers');
      console.log('Admin customers API response:', response.data);
      console.log('Number of customers:', response.data?.length || 0);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      await api.delete(`/admin/customers/${customerId}`);
      setCustomers(customers.filter(c => c.id !== customerId));
      setMessage('Customer deleted successfully');
      setMessageType('success');
      setDeleteConfirm(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete customer');
      setMessageType('error');
      setDeleteConfirm(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Helper to get initials from name
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <AdminLayout>
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Management</h1>
          <p className="text-gray-500 mt-1">View and manage your customer accounts</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <Users className="text-violet-600" size={20} />
          <span className="font-semibold text-slate-900">{customers.length}</span>
          <span className="text-gray-500">customers</span>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
          messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {messageType === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
          <span className="font-medium">{message}</span>
          <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-400" size={28} />
                  </div>
                  <p className="text-gray-500">No customers found</p>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {getInitials(customer.first_name, customer.last_name)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-xs text-gray-500">ID: #{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="mr-2 text-gray-400" size={14} />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="mr-2 text-gray-400" size={14} />
                        {customer.phone || 'Not provided'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="mr-2 text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                      <span className="max-w-[200px] truncate">{customer.address || 'Not provided'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.joined_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                      <ShoppingBag size={14} />
                      <span className="font-medium">{customer.orders_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setDeleteConfirm(customer)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Delete customer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Customer?</h3>
                <p className="text-sm text-gray-500">Are you sure you want to remove this customer?</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{deleteConfirm.first_name} {deleteConfirm.last_name}</span>
                <br />
                <span className="text-gray-500">{deleteConfirm.email}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCustomer(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
