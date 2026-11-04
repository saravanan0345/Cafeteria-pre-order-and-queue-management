import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  RotateCw, 
  BellRing, 
  ShoppingBag, 
  Flame, 
  ToggleLeft, 
  ToggleRight, 
  AlertCircle,
  Filter
} from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';
import { useToast } from '../context/ToastContext';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('active'); // active, Confirmed, Preparing, Ready for Pickup, Completed
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const fetchStaffData = () => {
    setLoading(true);
    Promise.all([
      api.get('/orders'),
      api.get('/food')
    ]).then(([orderRes, foodRes]) => {
      setOrders(orderRes.data);
      setFoodItems(foodRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching staff data:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStaffData();

    // Socket.io real-time listener for incoming orders
    const handleNewOrder = () => {
      addToast('🔔 New pre-order received in kitchen queue!', 'info');
      fetchStaffData();
    };

    const handleQueueUpdate = () => {
      fetchStaffData();
    };

    socket.on('order_placed', handleNewOrder);
    socket.on('queue_updated', handleQueueUpdate);

    return () => {
      socket.off('order_placed', handleNewOrder);
      socket.off('queue_updated', handleQueueUpdate);
    };
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.post(`/queue/${orderId}/status`, { status: newStatus });
      addToast(`Order status updated to "${newStatus}"`, 'success');
      fetchStaffData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAvailability = async (item) => {
    const nextAvailability = item.is_available === 1 ? 0 : 1;
    try {
      await api.put(`/food/${item.id}`, { is_available: nextAvailability });
      setFoodItems(prev => prev.map(f => f.id === item.id ? { ...f, is_available: nextAvailability } : f));
      addToast(`"${item.name}" marked as ${nextAvailability === 1 ? 'Available' : 'Sold Out'}`, 'info');
    } catch (err) {
      addToast('Failed to update availability', 'error');
    }
  };

  // Filter orders
  const displayedOrders = orders.filter((o) => {
    if (statusFilter === 'active') {
      return ['Confirmed', 'Preparing', 'Ready for Pickup'].includes(o.status);
    }
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200/60 gap-4">
        <div>
          <span className="text-xs font-extrabold tracking-widest uppercase text-blue-600 block mb-1">
            Kitchen Display System (KDS) & Counter
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Cafeteria Staff Operations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time kitchen order sequencing, status dispatch, and menu stock availability controls.
          </p>
        </div>

        <button
          onClick={fetchStaffData}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <RotateCw className="w-4 h-4 text-gray-500" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'active', label: 'Active Kitchen Queue', count: orders.filter(o => ['Confirmed', 'Preparing', 'Ready for Pickup'].includes(o.status)).length },
          { id: 'Confirmed', label: 'Waiting (Confirmed)', count: orders.filter(o => o.status === 'Confirmed').length },
          { id: 'Preparing', label: 'Cooking Now', count: orders.filter(o => o.status === 'Preparing').length },
          { id: 'Ready for Pickup', label: 'Ready at Counter', count: orders.filter(o => o.status === 'Ready for Pickup').length },
          { id: 'Completed', label: 'Completed Today', count: orders.filter(o => o.status === 'Completed').length },
          { id: 'all', label: 'All Orders', count: orders.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              statusFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 font-medium text-sm animate-pulse">
          Loading incoming orders...
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">No orders in this category</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            All orders for the selected status have been cleared or have not arrived yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedOrders.map((ord) => {
            const isConfirmed = ord.status === 'Confirmed';
            const isPreparing = ord.status === 'Preparing';
            const isReady = ord.status === 'Ready for Pickup';
            const isCompleted = ord.status === 'Completed';

            return (
              <div
                key={ord.id}
                className={`bg-white rounded-3xl border shadow-md hover:shadow-xl transition flex flex-col justify-between overflow-hidden ${
                  isReady
                    ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                    : isPreparing
                    ? 'border-amber-300'
                    : 'border-gray-200'
                }`}
              >
                {/* Header */}
                <div className={`p-5 flex items-start justify-between ${
                  isReady
                    ? 'bg-emerald-50/70'
                    : isPreparing
                    ? 'bg-amber-50/70'
                    : 'bg-gray-50/80'
                }`}>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block">
                      QUEUE TOKEN
                    </span>
                    <span className="text-3xl font-black text-gray-900 font-mono tracking-tight">
                      {ord.queue_token}
                    </span>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      {ord.customer_name}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      isReady
                        ? 'bg-emerald-600 text-white'
                        : isPreparing
                        ? 'bg-amber-500 text-white'
                        : isCompleted
                        ? 'bg-blue-600 text-white'
                        : 'bg-orange-600 text-white'
                    }`}>
                      {ord.status}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 block mt-1.5">
                      Slot: {ord.pickup_time}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="space-y-2">
                    {ord.items?.map((it) => (
                      <div key={it.id || it.food_name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 font-black text-[11px] flex items-center justify-center shrink-0">
                            {it.quantity}×
                          </span>
                          <span className="font-bold text-gray-900">
                            {it.food_name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special Notes */}
                  {ord.special_instructions && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <span className="font-extrabold">Chef Note: </span>
                      {ord.special_instructions}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  {isConfirmed && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Preparing')}
                      disabled={updatingId === ord.id}
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>🍳 Start Preparing</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Ready for Pickup')}
                      disabled={updatingId === ord.id}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      <BellRing className="w-4 h-4 animate-bounce" />
                      <span>🔔 Mark Ready for Pickup</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Completed')}
                      disabled={updatingId === ord.id}
                      className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ Complete Pickup</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="text-center text-xs font-bold text-gray-400 py-1">
                      Order Fulfilled & Handed Over
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Menu Item Quick Availability Stock Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Menu Item Availability Toggle
          </h2>
          <p className="text-xs text-gray-500">
            Click to mark items as sold out or back in stock in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {foodItems.map((item) => {
            const isAvail = item.is_available === 1;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-gray-100 bg-cream-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-gray-900 block truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {item.category_name} • ${Number(item.price).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition shrink-0 ${
                    isAvail
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  {isAvail ? 'In Stock' : 'Sold Out'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
