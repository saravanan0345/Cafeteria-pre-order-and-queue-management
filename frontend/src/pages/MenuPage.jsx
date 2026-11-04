import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Utensils, 
  Coffee, 
  Pizza, 
  Cookie, 
  CupSoda, 
  IceCream, 
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories and foods
    Promise.all([
      api.get('/food/categories'),
      api.get('/food')
    ]).then(([catRes, foodRes]) => {
      setCategories(catRes.data);
      setItems(foodRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching menu data:', err);
      setLoading(false);
    });
  }, []);

  // Category Icon helper
  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'lunch': return <Utensils className="w-4 h-4" />;
      case 'fast-food': return <Pizza className="w-4 h-4" />;
      case 'snacks': return <Cookie className="w-4 h-4" />;
      case 'beverages': return <CupSoda className="w-4 h-4" />;
      case 'desserts': return <IceCream className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  // Filter and sort items
  const filteredItems = items
    .filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (item.category_name.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      // Veg only
      if (vegOnly && item.is_veg !== 1) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesCat = item.category_name?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'prep-asc') return a.prep_time_minutes - b.prep_time_minutes;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      return (b.is_featured || 0) - (a.is_featured || 0);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/60">
        <div>
          <span className="text-xs font-extrabold tracking-widest uppercase text-orange-600 block mb-1">
            Campus Dining Menu
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Explore Cafeteria Meals
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            Freshly prepared daily specials, wholesome lunches, artisan snacks, and barista drinks. Pre-order now to skip the queue!
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, biryani, burger..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-sm ${
              selectedCategory === 'all'
                ? 'bg-orange-600 text-white shadow-orange-500/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>All Categories ({items.length})</span>
          </button>

          {categories.map((cat) => {
            const count = items.filter(i => i.category_name.toLowerCase() === cat.name.toLowerCase()).length;
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-sm ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-orange-500/20'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Right Filter Controls: Veg Toggle & Sort */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-2 shadow-sm ${
              vegOnly
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/30'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${vegOnly ? 'border-emerald-600' : 'border-gray-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${vegOnly ? 'bg-emerald-600' : 'bg-transparent'}`} />
            </div>
            <span>Pure Veg Only</span>
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-8 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm cursor-pointer"
            >
              <option value="featured">Featured / Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="prep-asc">Fastest Prep Time</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-8 bg-gray-100 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No food items matched</h3>
          <p className="text-xs text-gray-500">
            We couldn't find any dishes matching your current search or category filter. Try resetting filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setVegOnly(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-md shadow-orange-500/20 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
