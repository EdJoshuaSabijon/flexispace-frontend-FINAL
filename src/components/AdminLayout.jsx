import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, Bell, LogOut, Truck, Smartphone, RefreshCcw, Coins } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/returns', icon: RefreshCcw, label: 'Returns' },
    { path: '/admin/financial', icon: Coins, label: 'Financial' },
    { path: '/admin/logistics', icon: Truck, label: 'Logistics' },
    { path: '/admin/gcash', icon: Smartphone, label: 'GCash Settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-md fixed top-0 left-0 h-full flex flex-col z-10">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <span className="text-purple-700 font-bold text-xl">FlexiSpace</span>
              <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                ${location.pathname === path
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom: Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-56">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-gray-500 text-sm">
            Admin / <span className="text-gray-800 font-medium capitalize">
              {location.pathname.replace('/admin/', '')}
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-purple-700" />
            <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
