import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

export default function AdminGcash() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ gcash_number: '', gcash_account_name: '', is_active: true });
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/gcash-settings');
      setSettings(response.data);
      setFormData({
        gcash_number: response.data.gcash_number || '',
        gcash_account_name: response.data.gcash_account_name || '',
        is_active: response.data.is_active ?? true,
      });
    } catch (error) {
      console.error('Failed to fetch GCash settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setQrCodeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('gcash_number', formData.gcash_number);
      data.append('gcash_account_name', formData.gcash_account_name);
      data.append('is_active', formData.is_active ? 1 : 0);
      data.append('_method', 'PUT'); // Laravel requirement for FormData with PUT
      
      if (qrCodeFile) {
        data.append('gcash_qr_code', qrCodeFile);
      }

      await api.post('/admin/gcash-settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('GCash Settings updated successfully!');
      fetchSettings();
      setQrCodeFile(null);
    } catch (error) {
      alert('Failed to update GCash settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">GCash Payment Settings</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">GCash Account Name</label>
                <input required type="text" value={formData.gcash_account_name} onChange={e => setFormData({...formData, gcash_account_name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 bg-gray-50" placeholder="e.g. John Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">GCash Number</label>
                <input required type="text" value={formData.gcash_number} onChange={e => setFormData({...formData, gcash_number: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 bg-gray-50" placeholder="e.g. 09123456789" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">Upload QR Code</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 bg-gray-50" />
                {settings?.gcash_qr_code && !qrCodeFile && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Current QR Code:</p>
                    <img src={`http://localhost:8000/storage/${settings.gcash_qr_code}`} alt="GCash QR" className="w-48 h-48 object-cover rounded-xl border border-gray-200 shadow-sm" />
                  </div>
                )}
                {qrCodeFile && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-600 font-medium">New file selected: {qrCodeFile.name}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500 border-gray-300" />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Enable GCash Payment</label>
              </div>

              <button type="submit" disabled={saving} className="w-full py-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-bold transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
