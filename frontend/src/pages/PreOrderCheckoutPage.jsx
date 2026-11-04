import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Wallet, 
  ShoppingBag, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function PreOrderCheckoutPage() {
  const { cart, subtotal, taxAmount, finalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Date selection (defaults to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(todayStr);

  // Available Time Slots during Cafeteria Operating Hours
  const timeSlots = [
    { time: '08:30 AM', traffic: 'Quiet', period: 'Breakfast' },
    { time: '09:00 AM', traffic: 'Moderate', period: 'Breakfast' },
    { time: '09:30 AM', traffic: 'Busy', period: 'Breakfast' },
    { time: '11:30 AM', traffic: 'Moderate', period: 'Lunch' },
    { time: '12:00 PM', traffic: 'Busy Peak', period: 'Lunch' },
    { time: '12:30 PM', traffic: 'Busy Peak', period: 'Lunch' },
    { time: '01:00 PM', traffic: 'Busy', period: 'Lunch' },
    { time: '01:30 PM', traffic: 'Moderate', period: 'Lunch' },
    { time: '03:30 PM', traffic: 'Quiet', period: 'Snacks' },
    { time: '04:00 PM', traffic: 'Moderate', period: 'Snacks' },
    { time: '05:30 PM', traffic: 'Moderate', period: 'Dinner' },
    { time: '06:30 PM', traffic: 'Busy', period: 'Dinner' },
    { time: '07:30 PM', traffic: 'Quiet', period: 'Dinner' }
  ];

  const [selectedTime, setSelectedTime] = useState('12:30 PM');
  const [paymentMethod, setPaymentMethod] = useState('Campus Card / Wallet');
  const [specialNotes, setSpecialNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500">
          You don't have any meals selected for pre-order. Please browse the cafeteria menu and add your favorite dishes first!
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 shadow-md shadow-orange-500/20 transition"
        >
          <span>Explore Food Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      setErrorMessage('Please sign in or use a 1-click demo account before placing a pre-order.');
      return;
    }

    if (!pickupDate || !selectedTime) {
      setErrorMessage('Please select both a valid pickup date and available time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        items: cart.map(item => ({
          food_id: item.food_id,
          quantity: item.quantity
        })),
        pickup_date: pickupDate,
        pickup_time: selectedTime,
        payment_method: paymentMethod,
        special_instructions: specialNotes
      };

      const res = await api.post('/orders', orderPayload);
      const createdOrder = res.data.order;

      // Confetti celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      addToast(`Order Confirmed! Your Queue Token is ${createdOrder.queue_token}`, 'ready', 6000);
      clearCart();
      
      // Navigate to order tracking page
      navigate(`/track?token=${createdOrder.queue_token}`);
    } catch (err) {
      console.error('Order placement error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit pre-order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <div className="mb-8 space-y-1">
        <span className="text-xs font-extrabold tracking-widest uppercase text-orange-600">
          Step 2 of 2
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Pre-Order Slot & Checkout
        </h1>
        <p className="text-sm text-gray-500">
          Select your cafeteria pickup window. A sequential FIFO queue token will be generated on confirmation.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
          {!isAuthenticated && (
            <Link to="/login" className="font-bold underline ml-auto text-xs">
              Go to Login →
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Schedule & Payment Options */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Pickup Date Picker */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span>1. Choose Pickup Date</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPickupDate(todayStr)}
                className={`p-3.5 rounded-2xl text-xs font-bold border transition text-center ${
                  pickupDate === todayStr
                    ? 'bg-orange-50 border-orange-500 text-orange-800 ring-2 ring-orange-500/20'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="block text-[10px] uppercase text-gray-400">Earliest</span>
                Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
              </button>

              <button
                type="button"
                onClick={() => {
                  const tmrw = new Date();
                  tmrw.setDate(tmrw.getDate() + 1);
                  setPickupDate(tmrw.toISOString().split('T')[0]);
                }}
                className={`p-3.5 rounded-2xl text-xs font-bold border transition text-center ${
                  pickupDate !== todayStr
                    ? 'bg-orange-50 border-orange-500 text-orange-800 ring-2 ring-orange-500/20'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="block text-[10px] uppercase text-gray-400">Advance Slot</span>
                Tomorrow
              </button>
            </div>
          </div>

          {/* Pickup Time Slot Grid */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>2. Select Estimated Pickup Window</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Operating: 8 AM - 8 PM</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isBusy = slot.traffic.includes('Busy');

                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => setSelectedTime(slot.time)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400'
                        : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-extrabold text-xs">{slot.time}</span>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className={isSelected ? 'text-orange-200' : 'text-gray-400'}>
                        {slot.period}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : isBusy ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {slot.traffic}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span>3. Payment Option</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Campus Card / Wallet', label: 'Campus Dining Card', icon: Wallet, note: 'Balance: $42.50' },
                { id: 'UPI / Online', label: 'Online / UPI QR', icon: CreditCard, note: 'Instant' },
                { id: 'Pay at Counter', label: 'Pay at Counter', icon: ShoppingBag, note: 'Cash or Card' }
              ].map((m) => {
                const isSel = paymentMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSel
                        ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${isSel ? 'text-orange-600' : 'text-gray-400'}`} />
                      {isSel && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div className="mt-2">
                      <span className="font-bold text-xs block">{m.label}</span>
                      <span className="text-[10px] text-gray-500">{m.note}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Chef Instructions */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <label className="text-gray-900 font-bold text-sm block">
              Special Kitchen Instructions / Allergies (Optional)
            </label>
            <textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Extra spicy, no onions, gluten sensitivity, sauce on the side..."
              rows={2}
              className="w-full p-3.5 rounded-2xl bg-cream-50/50 border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-xl space-y-6 sticky top-24">
            
            <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-base">Order Review</h3>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                {cart.length} unique items
              </span>
            </div>

            {/* Item list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.food_id} className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {item.quantity}×
                    </span>
                    <span className="font-medium text-gray-800 truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Dining Fee (5%)</span>
                <span className="font-semibold text-gray-900">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Final Total</span>
                <span className="text-orange-600">${finalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Pre-Order Details Callout */}
            <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 text-[11px] text-orange-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-orange-900">
                <Info className="w-3.5 h-3.5" />
                <span>Pickup Window Reserved:</span>
              </div>
              <p>
                {pickupDate === todayStr ? 'Today' : pickupDate} at <span className="font-extrabold">{selectedTime}</span>
              </p>
            </div>

            {/* Place Pre-Order CTA Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition active:scale-95"
            >
              {submitting ? (
                <span>Generating Atomic Token...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm Pre-Order & Get Token</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-gray-400">
              🔒 Guaranteed FIFO queue sequence. Orders can be cancelled prior to food preparation.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
