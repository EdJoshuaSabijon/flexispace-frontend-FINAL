import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

export default function AdminLogistics() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', code: '', tracking_url: '', shipping_fee: 0, is_active: true });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/admin/logistics-providers');
      setProviders(response.data);
    } catch (error) {
      console.error('Failed to fetch providers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/logistics-providers/${editingId}`, formData);
      } else {
        await api.post('/admin/logistics-providers', formData);
      }
      setFormData({ name: '', code: '', tracking_url: '', shipping_fee: 0, is_active: true });
      setEditingId(null);
      fetchProviders();
    } catch (error) {
      alert('Failed to save provider');
    }
  };

  const handleEdit = (provider) => {
    setFormData(provider);
    setEditingId(provider.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      try {
        await api.delete(`/admin/logistics-providers/${id}`);
        fetchProviders();
      } catch (error) {
        alert('Failed to delete provider');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Logistics Provider</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500" placeholder="e.g. LBC Express" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500" placeholder="e.g. lbc" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Fee (₱)</label>
                <input required type="number" step="0.01" value={formData.shipping_fee} onChange={e => setFormData({...formData, shipping_fee: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tracking URL Base</label>
                <input type="text" value={formData.tracking_url} onChange={e => setFormData({...formData, tracking_url: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500" placeholder="Optional" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="rounded text-violet-600 focus:ring-violet-500" />
              <label className="text-sm font-medium">Active</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium">
                {editingId ? 'Update' : 'Save'} Provider
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', code: '', tracking_url: '', shipping_fee: 0, is_active: true }); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Providers</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 font-medium">Name</th>
                    <th className="py-2 font-medium">Code</th>
                    <th className="py-2 font-medium">Fee</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map(provider => (
                    <tr key={provider.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3">{provider.name}</td>
                      <td className="py-3">{provider.code}</td>
                      <td className="py-3">₱{provider.shipping_fee}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${provider.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {provider.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3">
                        <button onClick={() => handleEdit(provider)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                        <button onClick={() => handleDelete(provider.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
