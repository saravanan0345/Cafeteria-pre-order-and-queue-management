import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  ShoppingBag, 
  Clock, 
  CreditCard, 
  Wallet, 
  ArrowRight, 
  RotateCw, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders/my-orders')
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching student orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const activeOrders = orders.filter((o) => ['Confirmed', 'Preparing', 'Ready for Pickup'].includes(o.status));
  const pastOrders = orders.filter((o) => ['Completed', 'Cancelled'].includes(o.status));

  const handleReorder = (order) => {
    for (const it of order.items || []) {
      addToCart({
        id: it.food_id,
        name: it.food_name,
        price: it.price,
        image_url: it.image_url
      }, it.quantity);
    }
    addToast('Items added to your cart for quick re-order!', 'success');
    navigate('/pre-order');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Top Greeting & Campus Wallet Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Welcome Section */}
        <div className="lg:col-span-8 bg-gradient-to-br from-cream-100 to-cream-200/90 rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-extrabold uppercase tracking-wider inline-block">
              Student Dining Account
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, {user?.name || 'Alex Johnson'}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
              Student ID: <span className="font-bold text-gray-800">{user?.student_id || 'CS-2024-089'}</span> • Department: <span className="font-bold text-gray-800">{user?.department || 'Computer Science'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/menu"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order Today's Lunch</span>
            </Link>
            <Link
              to="/queue-board"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-200 transition"
            >
              <span>View Live Queue TV</span>
            </Link>
          </div>
        </div>

        {/* Campus Dining Wallet */}
        <div className="lg:col-span-4 bg-gradient-to-br from-charcoal-800 to-charcoal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Campus Meal Card</span>
              <Wallet className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-3xl sm:text-4xl font-black text-white block">
              $42.50
            </span>
            <p className="text-[11px] text-gray-400">
              Active student dining balance for pre-orders & counter checkout.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Auto-Reload Active
            </span>
            <button
              onClick={() => addToast('Campus Card topped up by $20.00!', 'success')}
              className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition"
            >
              + Add $20
            </button>
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Active Pre-Orders ({activeOrders.length})
            </h2>
            <p className="text-xs text-gray-500">Live queue status and pickup tokens</p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 text-gray-500 hover:text-orange-600 transition"
            title="Refresh Orders"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">No active orders right now</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You haven't scheduled any cafeteria pre-orders for today. Browse the menu to place an order!
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 shadow-sm"
            >
              Browse Food Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 block">
                        Queue Token
                      </span>
                      <span className="text-3xl font-black text-gray-900 font-mono">
                        {ord.queue_token}
                      </span>
                      <p className="text-[11px] text-gray-400">Order #{ord.order_number}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ord.status === 'Ready for Pickup'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : ord.status === 'Preparing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="py-3 space-y-1.5">
                    {ord.items?.map((it) => (
                      <div key={it.id || it.food_name} className="flex justify-between text-xs text-gray-700">
                        <span>{it.quantity}× {it.food_name}</span>
                        <span className="font-bold">${Number(it.subtotal || it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Pickup Slot</span>
                    <span className="font-bold text-gray-800">{ord.pickup_date} @ {ord.pickup_time}</span>
                  </div>

                  <Link
                    to={`/track?token=${ord.queue_token}`}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                  >
                    <span>Track Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Order History Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Order History
          </h2>
          <p className="text-xs text-gray-500">Past completed and cancelled pre-orders</p>
        </div>

        {pastOrders.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No past orders on record.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Order / Token</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Dishes</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pastOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>{ord.order_number}</div>
                      <span className="text-orange-600 font-mono text-[11px]">Token: {ord.queue_token}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{ord.pickup_date}</div>
                      <span className="text-gray-400 text-[10px]">{ord.pickup_time}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {ord.items?.map(i => `${i.quantity}x ${i.food_name}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-gray-900">
                      ${Number(ord.final_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleReorder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-700 font-bold text-[11px] transition"
                      >
                        Re-Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
