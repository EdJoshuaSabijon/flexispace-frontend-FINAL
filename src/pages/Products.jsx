import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('Featured');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      const uniqueCategories = [...new Set(response.data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange === 'Under ₱25,000') matchesPrice = product.price < 25000;
    else if (priceRange === '₱25,000 - ₱50,000') matchesPrice = product.price >= 25000 && product.price <= 50000;
    else if (priceRange === '₱50,000 - ₱100,000') matchesPrice = product.price > 50000 && product.price <= 100000;
    else if (priceRange === 'Over ₱100,000') matchesPrice = product.price > 100000;
    
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Newest First') return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <nav className="text-sm text-gray-500 mb-2">
          <span className="hover:text-violet-600 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Products</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">All Products</h1>
        <p className="text-gray-600 mt-2">Discover our collection of premium modular furniture</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for furniture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal size={18} className="text-violet-600" />
              <h3 className="font-semibold text-slate-900">Filters</h3>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!selectedCategory}
                    onChange={() => setSelectedCategory('')}
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-gray-600 group-hover:text-violet-600 transition">All Categories</span>
                </label>
                {categories.map(category => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-gray-600 group-hover:text-violet-600 transition">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Price Range</h4>
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Any Price</option>
                <option value="Under ₱25,000">Under ₱25,000</option>
                <option value="₱25,000 - ₱50,000">₱25,000 - ₱50,000</option>
                <option value="₱50,000 - ₱100,000">₱50,000 - ₱100,000</option>
                <option value="Over ₱100,000">Over ₱100,000</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-3">Sort By</h4>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Newest First">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-slate-900">{filteredProducts.length}</span> products
            </p>
          </div>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
