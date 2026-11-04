import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  ChefHat, 
  ShieldCheck, 
  Tv, 
  ChevronRight,
  Flame,
  Star,
  BellRing,
  Coffee,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FoodCard from '../components/FoodCard';

export default function LandingPage() {
  const { demoLogin, isAuthenticated, role } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [liveQueue, setLiveQueue] = useState({
    current_serving_token: 'A002',
    estimated_average_wait: 8,
    total_in_queue: 3
  });

  const [featuredItems, setFeaturedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    // Fetch live queue status
    api.get('/queue/live')
      .then(res => setLiveQueue(res.data))
      .catch(() => {});

    // Fetch featured foods
    api.get('/food?category=all')
      .then(res => {
        const featured = res.data.filter(i => i.is_featured === 1).slice(0, 4);
        setFeaturedItems(featured.length > 0 ? featured : res.data.slice(0, 4));
        setLoadingItems(false);
      })
      .catch(() => setLoadingItems(false));
  }, []);

  const handleQuickDemo = async (targetRole) => {
    try {
      await demoLogin(targetRole);
      addToast(`Logged in as ${targetRole.toUpperCase()}`, 'success');
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      addToast('Demo login failed', 'error');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Live Cafeteria Status Strip */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-100/70 border border-orange-200/80 text-orange-950 text-xs font-semibold mb-6 shadow-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Campus Dining Open Today: 08:00 AM – 08:30 PM</span>
            <span className="text-gray-400">•</span>
            <span className="font-bold text-orange-700">Serving Token: {liveQueue.current_serving_token}</span>
            <span className="text-gray-400">•</span>
            <span>Avg Wait: ~{liveQueue.estimated_average_wait} min</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-extrabold tracking-widest uppercase text-orange-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  College Academic Project Demonstration
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.12]">
                  Cafeteria <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700">Pre-Order & Queue</span> Management System
                </h1>
                <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-2xl">
                  Eliminate long canteen lunch queues. Pre-order freshly prepared cafeteria meals, reserve your pickup slot, receive an atomic FIFO queue token, and monitor preparation live on digital counter displays.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/menu"
                  className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center gap-2 transition active:scale-95"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Browse Menu & Pre-Order</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/queue-board"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-sm shadow-sm flex items-center gap-2 transition hover:border-gray-300"
                >
                  <Tv className="w-4 h-4 text-orange-500" />
                  <span>Live Queue TV Display</span>
                </Link>
              </div>

              {/* Quick Academic Demo Badges */}
              <div className="pt-4 border-t border-gray-200/60">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                  ⚡ 1-Click Demo Login for Project Evaluation:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickDemo('student')}
                    className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Users className="w-3.5 h-3.5 text-orange-600" />
                    Student Portal
                  </button>
                  <button
                    onClick={() => handleQuickDemo('staff')}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                    Kitchen Staff (KDS)
                  </button>
                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Admin Command
                  </button>
                </div>
              </div>
            </div>

            {/* Right Interactive Queue Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-6">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-gray-400 ml-2">DIGITAL QUEUE DISPLAY</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>

                {/* Big Token Display */}
                <div className="bg-gradient-to-br from-cream-100 to-cream-200/80 rounded-2xl p-6 text-center border border-amber-200/60 shadow-inner">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-gray-500 block mb-1">
                    NOW SERVING AT COUNTER 1
                  </span>
                  <div className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight my-1">
                    {liveQueue.current_serving_token}
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-full mt-1">
                    Ready for immediate student pickup
                  </p>
                </div>

                {/* Queue Stats Mini Grid */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">In Active Queue</span>
                    <span className="text-xl font-extrabold text-gray-900">{liveQueue.total_in_queue} Orders</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">Est. Waiting Time</span>
                    <span className="text-xl font-extrabold text-orange-600">~{liveQueue.estimated_average_wait} Mins</span>
                  </div>
                </div>

                {/* Tracking Token Quick Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const token = e.target.token.value.trim();
                    if (token) navigate(`/track?token=${token}`);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="token"
                    placeholder="Enter Queue Token (e.g. A003)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition"
                  >
                    Track
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. System Workflow: 4-Step Interactive Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold tracking-widest uppercase text-orange-600">
            System Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900">
            How The Pre-Order & Queue Works
          </h2>
          <p className="text-sm text-gray-500">
            Designed to guarantee FIFO fairness, eliminate physical congestion, and optimize kitchen food preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 font-black text-lg flex items-center justify-center mb-4">
              01
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1.5">Browse & Cart</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Students browse breakfast, lunch, snacks, and drinks with preparation times, nutrition info, and veg/non-veg flags.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-black text-lg flex items-center justify-center mb-4">
              02
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1.5">Pick Pickup Slot</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Schedule your desired pickup time during cafeteria operating hours to avoid rush-hour crowds.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-black text-lg flex items-center justify-center mb-4">
              03
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1.5">Atomic Token ID</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Backend generates an atomic, conflict-free queue token (e.g. A014) ensuring sequential FIFO kitchen priority.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-lg flex items-center justify-center mb-4">
              04
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1.5">Live Alert & Pickup</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Watch real-time updates via Socket.IO. When the kitchen marks your token "Ready for Pickup", grab your meal instantly!
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Meals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-widest uppercase text-orange-600">
              Fresh Daily Offerings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              Popular Cafeteria Specials
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>View Full 17-Item Menu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. Three Dedicated Stakeholder Dashboards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-charcoal-800 to-charcoal-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-extrabold tracking-widest uppercase text-amber-400">
              Role-Based Multi-Portal Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Tailored for Every Stakeholder
            </h2>
            <p className="text-xs text-gray-300">
              One unified database synchronizing students, kitchen cooks, and campus administrators seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Student Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Student Portal</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Browse meal menus, customize orders, schedule pickup slots, view campus wallet balance, and track personal queue tokens with live position indicators.
                </p>
              </div>
              <button
                onClick={() => handleQuickDemo('student')}
                className="mt-6 w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
              >
                Launch Student View →
              </button>
            </div>

            {/* Kitchen Staff Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ChefHat className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Kitchen Display (KDS)</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Fast tactile interface for cooks and counter staff. Advance orders from Confirmed → Preparing → Ready for Pickup, view special cooking notes, and toggle sold-out items.
                </p>
              </div>
              <button
                onClick={() => handleQuickDemo('staff')}
                className="mt-6 w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
              >
                Launch Kitchen KDS →
              </button>
            </div>

            {/* Admin Command Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:bg-white/15 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Admin Command Center</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Real database analytics: revenue trends, popular food items, order volume by hour, food inventory CRUD, price management, and user roles control.
                </p>
              </div>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="mt-6 w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
              >
                Launch Admin Center →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. College Academic Project Technical Specs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream-100 rounded-3xl p-8 border border-amber-200/60">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Concurrency Control</span>
              <h4 className="text-base font-extrabold text-gray-900 mt-1">Atomic Token Generation</h4>
              <p className="text-xs text-gray-600 mt-1">Eliminates duplicate tokens under high simultaneous pre-orders.</p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Queue Algorithm</span>
              <h4 className="text-base font-extrabold text-gray-900 mt-1">FIFO Queue Sequencing</h4>
              <p className="text-xs text-gray-600 mt-1">Strict chronological priority with real-time recalculation on cancel/pickup.</p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Live Synchronization</span>
              <h4 className="text-base font-extrabold text-gray-900 mt-1">Socket.IO WebSockets</h4>
              <p className="text-xs text-gray-600 mt-1">Instant screen updates without manual polling or browser refresh.</p>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Security & Auth</span>
              <h4 className="text-base font-extrabold text-gray-900 mt-1">Role-Based JWT</h4>
              <p className="text-xs text-gray-600 mt-1">Granular protection across Student, Staff, and Administrator endpoints.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
