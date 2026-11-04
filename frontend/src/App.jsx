import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import PreOrderCheckoutPage from './pages/PreOrderCheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LiveQueueBoard from './pages/LiveQueueBoard';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const location = useLocation();
  const isQueueBoard = location.pathname === '/queue-board';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-[#1E2022] selection:bg-orange-600 selection:text-white">
      {/* Hide Navbar & Footer on Live Queue TV Board for immersive full-screen display */}
      {!isQueueBoard && <Navbar />}
      <CartDrawer />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/pre-order" element={<PreOrderCheckoutPage />} />
          <Route path="/track" element={<OrderTrackingPage />} />
          <Route path="/queue-board" element={<LiveQueueBoard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

      {!isQueueBoard && <Footer />}
    </div>
  );
}
