import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Minus, Plus, Package, Truck, Shield, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useEffect, useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products`);
      const productData = response.data.find(p => p.id === parseInt(id));
      setProduct(productData);
    } catch (error) {
      console.error('Failed to fetch product');
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image_path: product.image_path,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    navigate('/cart');
  };

  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-PH')}`;
  };

  if (!product) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-violet-200 rounded-full mb-4"></div>
        <div className="text-gray-500">Loading product...</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-violet-600 transition">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <Link to="/products" className="hover:text-violet-600 transition">Products</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-900">{product.category}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side - Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={product.image_path
                ? `http://localhost:8000/storage/${product.image_path}`
                : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-violet-500 transition bg-gray-100"
              >
                <img
                  src={product.image_path
                    ? `http://localhost:8000/storage/${product.image_path}`
                    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80'}
                  alt={`View ${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div>
          {/* Category & Rating */}
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">(128 reviews)</span>
            </div>
          </div>

          {/* Product Name */}
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl font-bold text-violet-600">{formatPrice(product.price)}</span>
            {product.stock > 0 ? (
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                In Stock
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">{product.description}</p>

          {/* Quantity Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-900 mb-3">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                disabled={quantity >= product.stock}
              >
                <Plus size={20} />
              </button>
              <span className="text-sm text-gray-500">{product.stock} available</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-full font-semibold text-lg transition-all duration-200 flex items-center justify-center shadow-lg shadow-violet-600/25 mb-8"
          >
            <ShoppingCart className="mr-3" size={22} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100">
            <div className="text-center">
              <Truck className="mx-auto mb-2 text-violet-600" size={24} />
              <p className="text-xs text-gray-600">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto mb-2 text-violet-600" size={24} />
              <p className="text-xs text-gray-600">1 Year Warranty</p>
            </div>
            <div className="text-center">
              <Package className="mx-auto mb-2 text-violet-600" size={24} />
              <p className="text-xs text-gray-600">Easy Assembly</p>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-3">What's Included</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-violet-600 rounded-full"></span>
                {product.name} unit
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-violet-600 rounded-full"></span>
                Assembly manual & tools
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-violet-600 rounded-full"></span>
                Care instructions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-violet-600 rounded-full"></span>
                1-year warranty card
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
