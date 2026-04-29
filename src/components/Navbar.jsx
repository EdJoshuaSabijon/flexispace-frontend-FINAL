import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const logoLink = isAdmin ? '/admin/dashboard' : '/';

  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  useEffect(() => {
    setCartCount(getCartCount());
    const handleStorageChange = () => setCartCount(getCartCount());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to={logoLink} className="flex items-center gap-3">
              <Logo size={25} />
              <span className="text-2xl font-bold text-purple-600">FlexiSpace</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {!isAdmin && (
              <>
                <Link to="/" className="text-gray-700 hover:text-purple-600">Home</Link>
                <Link to="/products" className="text-gray-700 hover:text-purple-600">Products</Link>
                <Link to="/cart" className="relative text-gray-700 hover:text-purple-600">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user ? (
              <>
                {!isAdmin && (
                  <Link to="/dashboard" className="text-gray-700 hover:text-purple-600">
                    <User size={24} />
                  </Link>
                )}
                <NotificationBell />
                <button onClick={logout} className="text-gray-700 hover:text-purple-600">
                  <LogOut size={24} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-purple-600">Login</Link>
                <Link to="/register" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  Register
                </Link>
                <Link
                  to="/admin/login"
                  className="text-xs text-gray-400 hover:text-purple-600 border border-gray-200 hover:border-purple-400 px-3 py-1.5 rounded-full transition"
                >
                  Admin
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            {!isAdmin && (
              <>
                <Link to="/" className="block py-2 text-gray-700">Home</Link>
                <Link to="/products" className="block py-2 text-gray-700">Products</Link>
                <Link to="/cart" className="block py-2 text-gray-700">Cart ({cartCount})</Link>
              </>
            )}
            {user ? (
              <>
                {!isAdmin && <Link to="/dashboard" className="block py-2 text-gray-700">Dashboard</Link>}
                <Link to={isAdmin ? '/admin/dashboard' : '/orders'} className="block py-2 text-gray-700">{isAdmin ? 'Admin Dashboard' : 'Orders'}</Link>
                <button onClick={logout} className="block py-2 text-gray-700 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700">Login</Link>
                <Link to="/register" className="block py-2 text-gray-700">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
