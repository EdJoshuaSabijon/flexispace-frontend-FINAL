import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-PH')}`;
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image Container - 60% of card height */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={product.image_path
            ? `http://localhost:8000/storage/${product.image_path}`
            : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-violet-700 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Hover Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product);
            }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-full font-medium flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </Link>

      {/* Content - 40% of card height */}
      <div className="p-4">
        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < 4.5 ? "fill-amber-400 text-amber-400" : "text-gray-300"}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.5)</span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-violet-600 transition-colors">
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-violet-700">
            {formatPrice(product.price)}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}
