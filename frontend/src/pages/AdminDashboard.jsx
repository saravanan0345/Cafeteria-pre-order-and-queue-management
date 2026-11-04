import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Users, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  RotateCw,
  Utensils,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'food', 'orders', 'users'
  const [stats, setStats] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Food Item Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_name: 'Breakfast',
    is_veg: 1,
    prep_time_minutes: 10,
    image_url: '',
    calories: 300,
    is_featured: 0,
    is_special: 0
  });

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      api.get('/stats/overview'),
      api.get('/food'),
      api.get('/orders'),
      api.get('/stats/users')
    ]).then(([statsRes, foodRes, ordersRes, usersRes]) => {
      setStats(statsRes.data);
      setFoodItems(foodRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching admin data:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleOpenAddFood = () => {
    setEditingItem(null);
    setFoodFormData({
      name: '',
      description: '',
      price: '',
      category_name: 'Breakfast',
      is_veg: 1,
      prep_time_minutes: 10,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
      calories: 300,
      is_featured: 0,
      is_special: 0
    });
    setShowFoodModal(true);
  };

  const handleOpenEditFood = (item) => {
    setEditingItem(item);
    setFoodFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category_name: item.category_name,
      is_veg: item.is_veg,
      prep_time_minutes: item.prep_time_minutes,
      image_url: item.image_url,
      calories: item.calories || 300,
      is_featured: item.is_featured || 0,
      is_special: item.is_special || 0
    });
    setShowFoodModal(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/food/${editingItem.id}`, foodFormData);
        addToast(`"${foodFormData.name}" updated successfully`, 'success');
      } else {
        await api.post('/food', foodFormData);
        addToast(`"${foodFormData.name}" added to menu`, 'success');
      }
      setShowFoodModal(false);
      fetchAdminData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save food item', 'error');
    }
  };

  const handleDeleteFood = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/food/${id}`);
      addToast(`"${name}" removed from cafeteria menu`, 'info');
      fetchAdminData();
    } catch (err) {
      addToast('Failed to delete food item', 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.post(`/queue/${orderId}/status`, { status: newStatus });
      addToast(`Order status updated to ${newStatus}`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200/60 gap-4">
        <div>
          <span className="text-xs font-extrabold tracking-widest uppercase text-purple-600 block mb-1">
            Directorate of Campus Dining
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Full system control, real-time database financial metrics, food catalog CRUD, and queue management.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <RotateCw className="w-4 h-4 text-gray-500" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Orders</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{stats.summary.totalOrders}</span>
            <span className="text-[10px] text-emerald-600 font-bold">{stats.summary.todayOrders} today</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Revenue</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">${stats.summary.totalRevenue}</span>
            <span className="text-[10px] text-gray-500 font-medium">${stats.summary.todayRevenue} today</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">In Active Queue</span>
            <span className="text-2xl font-black text-orange-600 mt-1 block">{stats.summary.activeQueue}</span>
            <span className="text-[10px] text-amber-600 font-bold">In prep & waiting</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Ready at Counter</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{stats.summary.readyOrders}</span>
            <span className="text-[10px] text-emerald-600 font-bold">Unclaimed pickup</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Avg Order Value</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">${stats.summary.averageOrderValue}</span>
            <span className="text-[10px] text-gray-400 font-medium">Per checkout</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Registered Users</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">{stats.summary.registeredStudents}</span>
            <span className="text-[10px] text-gray-400 font-medium">+{stats.summary.staffCount} staff</span>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: '📊 System Analytics' },
          { id: 'food', label: '🍔 Food Menu CRUD (' + foodItems.length + ')' },
          { id: 'orders', label: '🧾 All Orders (' + orders.length + ')' },
          { id: 'users', label: '👥 User Accounts (' + users.length + ')' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: System Analytics Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 7-Day Order Activity Trend Bar Chart */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">7-Day Order Volume Trend</h3>
                  <p className="text-xs text-gray-400">Actual daily cafeteria throughput</p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Real Database Data
                </span>
              </div>

              {/* Responsive Bar Visualization */}
              <div className="pt-6 pb-2 flex items-end justify-between gap-3 h-52">
                {stats.dailyTrends?.map((day, idx) => {
                  const maxCount = Math.max(...stats.dailyTrends.map(d => d.ordersCount), 5);
                  const barHeight = Math.max(15, (day.ordersCount / maxCount) * 100);

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[11px] font-extrabold text-gray-900">
                        {day.ordersCount}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-orange-600 to-amber-500 rounded-t-xl transition-all duration-500 shadow-md shadow-orange-500/20"
                        style={{ height: `${barHeight}%` }}
                      />
                      <span className="text-[10px] text-gray-500 font-bold truncate max-w-[45px]">
                        {day.label.split(',')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 5 Popular Dishes */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900 text-base">Top Selling Dishes</h3>
              <div className="space-y-3">
                {stats.popularItems?.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No orders yet.</p>
                ) : (
                  stats.popularItems.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-purple-50 text-purple-700 font-extrabold text-[10px] flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-gray-800 truncate max-w-[150px]">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-gray-900 block">{item.count} sold</span>
                        <span className="text-[10px] text-emerald-600 font-bold">${item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Status Breakdown Pills */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-gray-900 text-base">Order Status Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(stats.statusDistribution || {}).map(([st, cnt]) => (
                <div key={st} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">{st}</span>
                  <span className="text-xl font-black text-gray-900 mt-0.5 block">{cnt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Food Menu CRUD */}
      {activeTab === 'food' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Cafeteria Food Catalog</h3>
              <p className="text-xs text-gray-500">Add, edit prices, descriptions, and manage live menu offerings.</p>
            </div>
            <button
              onClick={handleOpenAddFood}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Dish Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Prep Time</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {foodItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80';
                        }}
                      />
                      <div>
                        <div className="truncate max-w-[200px]">{item.name}</div>
                        <span className="text-[10px] text-gray-400 font-normal">{item.calories} kcal</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-700">{item.category_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        item.is_veg === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.is_veg === 1 ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-gray-900">${Number(item.price).toFixed(2)}</td>
                    <td className="py-3 px-4">{item.prep_time_minutes} min</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.is_available === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_available === 1 ? 'In Stock' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditFood(item)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(item.id, item.name)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: All Orders Management */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Order Records & Queue State</h3>
            <p className="text-xs text-gray-500">View and update statuses across the queue pipeline.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Token / Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Pickup Slot</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      <span className="text-orange-600 font-mono text-sm block">{ord.queue_token}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{ord.order_number}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{ord.customer_name}</div>
                      <span className="text-[10px] text-gray-400">{ord.customer_email}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {ord.items?.map(i => `${i.quantity}x ${i.food_name}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-black text-gray-900">${Number(ord.final_amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-700">{ord.pickup_date} @ {ord.pickup_time}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'Preparing' ? 'bg-amber-100 text-amber-800' :
                        ord.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        ord.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Registered User Directory</h3>
            <p className="text-xs text-gray-500">Student accounts and kitchen staff credentials.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">ID / Emp Number</th>
                  <th className="py-3 px-4 rounded-r-xl">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{u.name}</td>
                    <td className="py-3.5 px-4">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{u.student_id || '--'}</td>
                    <td className="py-3.5 px-4">{u.department || 'Campus Community'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Food Item Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-lg">
                {editingItem ? 'Edit Food Item' : 'Add New Cafeteria Dish'}
              </h3>
              <button
                onClick={() => setShowFoodModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={foodFormData.name}
                  onChange={(e) => setFoodFormData({ ...foodFormData, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Masala Dosa with Sambar"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={foodFormData.price}
                    onChange={(e) => setFoodFormData({ ...foodFormData, price: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="4.50"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={foodFormData.category_name}
                    onChange={(e) => setFoodFormData({ ...foodFormData, category_name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Dietary Type</label>
                  <select
                    value={foodFormData.is_veg}
                    onChange={(e) => setFoodFormData({ ...foodFormData, is_veg: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value={1}>Pure Veg</option>
                    <option value={0}>Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    value={foodFormData.prep_time_minutes}
                    onChange={(e) => setFoodFormData({ ...foodFormData, prep_time_minutes: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Calories</label>
                  <input
                    type="number"
                    value={foodFormData.calories}
                    onChange={(e) => setFoodFormData({ ...foodFormData, calories: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Image URL (Unsplash or direct link)</label>
                <input
                  type="url"
                  value={foodFormData.image_url}
                  onChange={(e) => setFoodFormData({ ...foodFormData, image_url: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={foodFormData.description}
                  onChange={(e) => setFoodFormData({ ...foodFormData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Brief culinary ingredients and description..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-500/20"
                >
                  Save Food Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
