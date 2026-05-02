import { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Activity, CreditCard, ChevronDown, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminFinancial() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/admin/financial/report');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (period) => {
    setIsExportMenuOpen(false);
    try {
      const response = await api.get(`/admin/financial/export?period=${period}`);
      const exportData = response.data;
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text(exportData.title, 14, 22);
      
      // Metadata
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
      doc.text(`Total Orders: ${exportData.total_orders}`, 14, 40);
      doc.text(`Total Revenue: P${Number(exportData.total_revenue).toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2})}`, 14, 48);
      
      // Table
      const tableColumn = ["Order ID", "Date", "Customer", "Payment Method", "Amount (P)"];
      const tableRows = [];

      exportData.orders.forEach(order => {
        const orderData = [
          `#${order.id}`,
          new Date(order.created_at).toLocaleDateString(),
          `${order.user?.first_name} ${order.user?.last_name}`,
          order.payment_method.toUpperCase(),
          Number(order.total_amount).toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2})
        ];
        tableRows.push(orderData);
      });

      const tableConfig = {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
      };

      try {
        if (typeof autoTable === 'function') {
          autoTable(doc, tableConfig);
        } else if (autoTable && typeof autoTable.default === 'function') {
          autoTable.default(doc, tableConfig);
        } else {
          throw new Error('autoTable missing');
        }
      } catch (tableErr) {
        console.warn("Using fallback PDF generation", tableErr);
        // Fallback: Manually draw text if autoTable fails
        let yPos = 60;
        doc.setFontSize(10);
        doc.text(tableColumn.join("  |  "), 14, yPos);
        yPos += 8;
        
        tableRows.forEach(row => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(row.join("  |  "), 14, yPos);
          yPos += 8;
        });
      }
      
      doc.save(`flexispace-${period}-report.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert(`Failed to generate report: ${err.message || 'Unknown error'}`);
    }
  };

  const formatPrice = (price) => `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>;
  }

  const { summary, monthly_revenue, payment_methods, recent_transactions } = data;

  // Format data for Recharts
  const chartData = monthly_revenue.map(item => ({
    name: item.month,
    Revenue: parseFloat(item.revenue)
  })).reverse();

  const pieData = payment_methods.map(item => ({
    name: item.payment_method.toUpperCase(),
    value: parseFloat(item.total)
  }));

  return (
    <AdminLayout>
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Coins className="text-violet-600" /> Financial Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of revenue, transactions, and payment metrics.</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} 
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-sm text-sm"
          >
            <Download size={16} /> Export Report <ChevronDown size={16} />
          </button>
          
          {isExportMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsExportMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button onClick={() => handleExportPDF('weekly')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition-colors font-medium">
                  Weekly Report
                </button>
                <button onClick={() => handleExportPDF('monthly')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition-colors font-medium">
                  Monthly Report
                </button>
                <button onClick={() => handleExportPDF('yearly')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition-colors font-medium">
                  Yearly Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-3xl font-black text-slate-800">{formatPrice(summary.total_revenue)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending (Processing)</p>
            <p className="text-3xl font-black text-slate-800">{formatPrice(summary.pending_revenue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
            <TrendingDown size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Lost to Returns</p>
            <p className="text-3xl font-black text-slate-800">{formatPrice(summary.lost_revenue)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue Over Time (Last 6 Months)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₱${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => formatPrice(value)}
                />
                <Bar dataKey="Revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue by Payment Method</h2>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatPrice(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">No data available</p>
            )}
            
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent_transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">#{tx.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{tx.user?.first_name} {tx.user?.last_name}</td>
                  <td className="px-6 py-4 font-black text-violet-600">{formatPrice(tx.total_amount)}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-sm font-medium text-slate-600">
                      <CreditCard size={14}/> {tx.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      tx.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}
