import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');
  const urlError = searchParams.get('error');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/');
    } else if (result.email_not_verified) {
      navigate('/verify-email', { state: { email: formData.email } });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">Sign in to your account</h2>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {verified === '1' && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4">
            ✅ Email verified successfully! You can now log in.
          </div>
        )}
        {verified === 'already' && (
          <div className="bg-blue-100 text-blue-700 px-4 py-3 rounded-lg mb-4">
            ℹ️ Your email is already verified. You can log in.
          </div>
        )}
        {urlError === 'invalid-link' && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
            ❌ Invalid verification link. Please request a new verification email.
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
          >
            Sign in
          </button>
        </form>
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 hover:text-purple-700">
              Register here
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/admin/login" className="text-sm text-gray-500 hover:text-gray-700">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
