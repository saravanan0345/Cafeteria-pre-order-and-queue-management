import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  ShoppingBag, 
  AlertCircle, 
  MapPin, 
  RotateCcw,
  BellRing,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenQuery = searchParams.get('token') || '';
  const [searchInput, setSearchInput] = useState(tokenQuery);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrder = (tokenToFetch) => {
    if (!tokenToFetch.trim()) return;
    setLoading(true);
    setError('');

    api.get(`/orders/${tokenToFetch.trim()}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching order:', err);
        setError(`No order found for "${tokenToFetch}". Please check your token or order number.`);
        setOrder(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (tokenQuery) {
      setSearchInput(tokenQuery);
      fetchOrder(tokenQuery);
    }
  }, [tokenQuery]);

  // Real-time socket updates: if this order's status changes in kitchen, refresh immediately!
  useEffect(() => {
    const handleStatusChanged = (data) => {
      if (order && (order.id === data.orderId || order.queue_token === data.token)) {
        if (data.status === 'Ready for Pickup') {
          addToast(`🔔 Token ${data.token} is now READY FOR PICKUP!`, 'ready', 8000);
        }
        fetchOrder(order.queue_token);
      }
    };

    const handleQueueUpdate = () => {
      if (order) {
        fetchOrder(order.queue_token);
      }
    };

    socket.on('order_status_changed', handleStatusChanged);
    socket.on('queue_updated', handleQueueUpdate);

    return () => {
      socket.off('order_status_changed', handleStatusChanged);
      socket.off('queue_updated', handleQueueUpdate);
    };
  }, [order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ token: searchInput.trim().toUpperCase() });
      fetchOrder(searchInput.trim().toUpperCase());
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.post(`/orders/${order.id}/cancel`, { reason: 'Cancelled by student from tracking screen' });
      addToast('Order cancelled successfully', 'info');
      fetchOrder(order.queue_token);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  // Status index for progress timeline
  const statusSteps = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Completed'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header & Token Search Input */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-extrabold tracking-widest uppercase text-orange-600 block mb-1">
            Real-Time Order Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Track Queue Token & Pickup Status
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Enter your 4-character queue token (e.g. <span className="font-bold text-gray-800">A002</span>, <span className="font-bold text-gray-800">A003</span>) or full Order ID to check live kitchen progress.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="e.g. A002, A003, ORD-20261104-001"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-cream-50/50 border border-gray-200 text-sm font-bold tracking-wider text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition active:scale-95"
          >
            Track Order
          </button>
        </form>
      </div>

      {loading && (
        <div className="p-12 text-center text-gray-400 animate-pulse font-medium text-sm">
          Fetching live token and queue position...
        </div>
      )}

      {error && !loading && (
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {order && !loading && (
        <div className="space-y-6">
          
          {/* Main Token Banner Card */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition ${
            order.status === 'Ready for Pickup'
              ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 text-white border-emerald-500 ring-4 ring-emerald-400/40'
              : order.status === 'Preparing'
              ? 'bg-gradient-to-br from-amber-900 to-amber-950 text-white border-amber-500'
              : isCancelled
              ? 'bg-gradient-to-br from-gray-900 to-gray-950 text-white border-red-500'
              : 'bg-white text-gray-900 border-gray-100'
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className={`text-[11px] font-extrabold tracking-widest uppercase block ${
                  order.status === 'Ready for Pickup' ? 'text-emerald-300' : 'text-orange-500'
                }`}>
                  QUEUE TOKEN
                </span>
                <div className="text-5xl sm:text-6xl font-black tracking-tight my-1">
                  {order.queue_token}
                </div>
                <p className="text-xs text-gray-400">
                  Order #{order.order_number} • Customer: {order.customer_name}
                </p>
              </div>

              {/* Status Badge */}
              <div className="sm:text-right">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md ${
                  order.status === 'Ready for Pickup'
                    ? 'bg-emerald-500 text-white animate-bounce'
                    : order.status === 'Preparing'
                    ? 'bg-amber-500 text-white'
                    : order.status === 'Completed'
                    ? 'bg-blue-600 text-white'
                    : isCancelled
                    ? 'bg-red-600 text-white'
                    : 'bg-orange-600 text-white'
                }`}>
                  {order.status === 'Ready for Pickup' && <BellRing className="w-4 h-4" />}
                  {order.status}
                </span>

                {order.status === 'Ready for Pickup' ? (
                  <p className="text-xs font-bold text-emerald-300 mt-2">
                    👉 Collect at Pickup Counter #1 Now!
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">
                    Estimated Pickup: <span className="font-bold text-white">{order.pickup_time}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Live Queue Position & Wait Time (if not completed/cancelled) */}
            {!['Completed', 'Cancelled'].includes(order.status) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-gray-300 block">Queue Position</span>
                  <span className="text-lg font-black text-white">
                    {order.queue_position ? `#${order.queue_position} in line` : 'Preparing next'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-gray-300 block">Est. Remaining Time</span>
                  <span className="text-lg font-black text-amber-300">
                    {order.status === 'Ready for Pickup' ? '0 min (Ready)' : `~${order.estimated_wait_time || 8} mins`}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-gray-300 block">Counter Station</span>
                  <span className="text-lg font-black text-white">Station #1 & #2</span>
                </div>
              </div>
            )}
          </div>

          {/* Visual Order Progress Stepper */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-gray-900 text-base">
              Preparation Timeline
            </h3>

            {isCancelled ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
                This order was cancelled. Cancellation reason: {order.cancellation_reason || 'N/A'}.
              </div>
            ) : (
              <div className="relative">
                {/* Horizontal Progress Bar */}
                <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-gray-100 -z-0">
                  <div
                    className="h-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                  {statusSteps.map((step, idx) => {
                    const isDone = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div
                        key={step}
                        className={`p-4 rounded-2xl border transition flex sm:flex-col items-center sm:text-center gap-3 ${
                          isCurrent
                            ? 'bg-orange-50 border-orange-500 shadow-sm'
                            : isDone
                            ? 'bg-white border-emerald-300'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-orange-600 text-white ring-4 ring-orange-200'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-gray-900 block">{step}</span>
                          <span className="text-[10px] text-gray-500">
                            {idx === 0 && 'Order accepted'}
                            {idx === 1 && 'Cooking in kitchen'}
                            {idx === 2 && 'At pickup counter'}
                            {idx === 3 && 'Collected'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Ordered Food Items & Summary */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-900 text-base">Ordered Dishes</h3>
            <div className="divide-y divide-gray-100">
              {order.items?.map((it) => (
                <div key={it.id || it.food_name} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 font-extrabold flex items-center justify-center">
                      {it.quantity}×
                    </span>
                    <span className="font-bold text-gray-900">{it.food_name}</span>
                  </div>
                  <span className="font-extrabold text-gray-900">
                    ${Number(it.subtotal || it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-500">Total Paid ({order.payment_method})</span>
              <span className="font-extrabold text-gray-900 text-base">${Number(order.final_amount).toFixed(2)}</span>
            </div>

            {order.special_instructions && (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs">
                <span className="font-bold">Special Notes: </span>
                {order.special_instructions}
              </div>
            )}
          </div>

          {/* Cancel Order Action if permitted */}
          {['Confirmed', 'Pending'].includes(order.status) && (
            <div className="flex justify-end">
              <button
                onClick={handleCancelOrder}
                className="px-5 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition"
              >
                Cancel This Pre-Order
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
