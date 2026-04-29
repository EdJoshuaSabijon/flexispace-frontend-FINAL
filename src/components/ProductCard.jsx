import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const timeoutRef = useRef(null);
  const cardRef = useRef(null);

  const formatPrice = (price) => {
    return `₱${Number(price).toLocaleString('en-PH')}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
    setIsAdded(true);
    
    // Reset after 2 seconds
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Close mobile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const imageUrl = product.image_path
    ? `http://localhost:8000/storage/${product.image_path}`
    : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';

  const showPreview = isHovered || isMobileOpen;

  return (
    <div 
      ref={cardRef}
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-violet-700 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Hover/Tap Preview Popup */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 transition-all duration-300 z-20
            ${showPreview ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none md:pointer-events-auto'}
          `}
        >
          {/* Preview Content */}
          <div className={`text-center transform transition-all duration-300 ${showPreview ? 'translate-y-0' : 'translate-y-4'}`}>
            {/* Product Image Thumbnail */}
            <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto mb-3 border-2 border-white/20">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Product Name */}
            <h4 className="text-white font-semibold text-sm mb-1 line-clamp-1 px-2">
              {product.name}
            </h4>
            
            {/* Price */}
            <p className="text-violet-300 font-bold text-lg mb-4">
              {formatPrice(product.price)}
            </p>
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdded || product.stock <= 0}
              className={`px-6 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-lg
                ${isAdded 
                  ? 'bg-green-500 text-white cursor-default' 
                  : product.stock > 0
                    ? 'bg-violet-600 hover:bg-violet-700 text-white active:scale-95'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }
              `}
            >
              {isAdded ? (
                <>
                  <Check size={18} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </>
              )}
            </button>
          </div>
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
