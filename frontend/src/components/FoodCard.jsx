import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Clock, Star, Flame, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodCard({ item }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isAvailable = item.is_available === 1;

  const handleAdd = () => {
    if (!isAvailable) return;
    addToCart(item, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between ${!isAvailable ? 'opacity-65 grayscale-[30%]' : ''}`}>
      
      {/* Top Media Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80';
          }}
        />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
          <div className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${item.is_veg === 1 ? 'border-emerald-600' : 'border-rose-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${item.is_veg === 1 ? 'bg-emerald-600' : 'bg-rose-600'}`} />
          </div>
        </div>

        {/* Badges: Category & Prep Time */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <span className="bg-charcoal-800/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            {item.prep_time_minutes} min
          </span>
          {item.is_special === 1 && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              CHEF SPECIAL
            </span>
          )}
        </div>

        {/* Sold Out Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Calories */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-semibold text-orange-600 uppercase tracking-wider text-[11px]">
              {item.category_name}
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {item.rating || 4.7}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-gray-400">
                <Flame className="w-3 h-3 text-orange-400" />
                {item.calories} kcal
              </span>
            </div>
          </div>

          <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-orange-600 transition line-clamp-1">
            {item.name}
          </h3>

          <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom Price & Add Action */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block -mb-1">Price</span>
            <span className="text-lg font-extrabold text-gray-900">
              ${Number(item.price).toFixed(2)}
            </span>
          </div>

          {isAvailable ? (
            <div className="flex items-center gap-1.5">
              {/* Stepper */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center transition shadow-sm"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs text-gray-800">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center transition shadow-sm"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAdd}
                className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-gray-400 py-1.5">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
