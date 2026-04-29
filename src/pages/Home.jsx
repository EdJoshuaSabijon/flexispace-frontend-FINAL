import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

const heroImages = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&h=1080&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&h=1080&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1920&h=1080&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&h=1080&fit=crop&q=80',
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products');
      setFeaturedProducts(response.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image_path: product.image_path,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Background slideshow */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">

        {/* Background Image Slideshow */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImages[currentImage]}
            alt="Interior background"
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          {/* Purple overlay - lighter to show background images */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-slate-900/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full py-20">

          {/* LEFT SIDE - Text Content */}
          <div className="text-white z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
              ✨ Premium Modular Furniture
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Craft Your Perfect<br/>
              <span className="text-purple-400">Living Space</span>
            </h1>
            <p className="text-gray-300 text-xl mb-8 leading-relaxed">
              Discover handpicked modular furniture that transforms any room into a masterpiece.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/products" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold transition flex items-center gap-2 text-lg">
                Shop Now →
              </Link>
              <Link to="/products" className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-full font-semibold transition text-lg">
                View Collections
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 mt-12">
              <div>
                <p className="text-4xl font-bold text-white">500+</p>
                <p className="text-gray-400 text-sm">Products</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">10k+</p>
                <p className="text-gray-400 text-sm">Happy Customers</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">4.9★</p>
                <p className="text-gray-400 text-sm">Average Rating</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Empty for clean background view */}
          <div className="hidden lg:block" />
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImage ? 'bg-white w-6' : 'bg-white/40 w-2'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Category Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/products?category=Dining" className="group relative h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80"
              alt="Dining Furniture"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/50 to-orange-700/60 group-hover:from-amber-600/40 group-hover:to-orange-700/50 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold text-white mb-1">Dining</h3>
              <p className="text-white/80 text-sm">Elegant tables & chairs</p>
            </div>
          </Link>
          <Link to="/products?category=Living" className="group relative h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
              alt="Living Room Furniture"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/50 to-purple-700/60 group-hover:from-violet-600/40 group-hover:to-purple-700/50 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold text-white mb-1">Living Room</h3>
              <p className="text-white/80 text-sm">Sofas, ottomans & more</p>
            </div>
          </Link>
          <Link to="/products?category=Office" className="group relative h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80"
              alt="Office Furniture"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/50 to-teal-700/60 group-hover:from-emerald-600/40 group-hover:to-teal-700/50 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-end p-6">
              <h3 className="text-2xl font-bold text-white mb-1">Office</h3>
              <p className="text-white/80 text-sm">Desks & workspace solutions</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Featured Products</h2>
            <p className="text-gray-600 text-lg">Handpicked selections for your modern lifestyle</p>
          </div>
          <Link
            to="/products"
            className="mt-4 md:mt-0 inline-flex items-center text-violet-600 hover:text-violet-700 font-semibold"
          >
            View All Products <ArrowRight className="ml-2" size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* Why FlexiSpace Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-violet-100 text-violet-700 px-4 py-1 rounded-full text-sm font-medium mb-4">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The FlexiSpace Difference</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">We believe quality furniture should be accessible, flexible, and built to last</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-violet-50 to-white p-8 rounded-2xl border border-violet-100">
              <div className="w-14 h-14 bg-violet-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-violet-600/25">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Free Shipping</h3>
              <p className="text-gray-600">Complimentary delivery on all orders. We handle the heavy lifting so you can focus on styling your space.</p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-white p-8 rounded-2xl border border-violet-100">
              <div className="w-14 h-14 bg-violet-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-violet-600/25">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Premium Quality</h3>
              <p className="text-gray-600">Every piece is crafted with premium materials and rigorous quality standards for lasting durability.</p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-white p-8 rounded-2xl border border-violet-100">
              <div className="w-14 h-14 bg-violet-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-violet-600/25">
                <RotateCcw className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Easy Returns</h3>
              <p className="text-gray-600">Not satisfied? Return within 30 days for a full refund. No questions asked, hassle-free process.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Get Exclusive Offers</h2>
          <p className="text-violet-100 mb-8 max-w-xl mx-auto">Subscribe to our newsletter and be the first to know about new arrivals and special promotions.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full border-0 focus:ring-2 focus:ring-white/50 text-gray-900"
            />
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-violet-400">FlexiSpace</h3>
              <p className="text-gray-400">Transforming spaces with premium modular furniture solutions for modern living.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
                <li><Link to="/products?category=Dining" className="hover:text-white transition">Dining</Link></li>
                <li><Link to="/products?category=Living" className="hover:text-white transition">Living Room</Link></li>
                <li><Link to="/products?category=Office" className="hover:text-white transition">Office</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white transition">My Account</Link></li>
                <li><Link to="/orders" className="hover:text-white transition">Order History</Link></li>
                <li><span className="hover:text-white transition cursor-pointer">Shipping Info</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Returns</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@flexispace.com</li>
                <li>+63 (2) 8123-4567</li>
                <li>Metro Manila, Philippines</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 FlexiSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
