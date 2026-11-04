import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Utensils, 
  ShoppingBag, 
  Clock, 
  Search, 
  LayoutDashboard, 
  ChefHat, 
  ShieldCheck, 
  LogOut, 
  Menu as MenuIcon, 
  X,
  User,
  Tv
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { totalCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
              <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900 group-hover:text-orange-600 transition flex items-center gap-1.5">
                CAMPUS<span className="text-orange-600">DINE</span>
              </span>
              <p className="text-[10px] font-medium text-gray-400 tracking-wider uppercase -mt-0.5 hidden sm:block">
                Pre-Order & Queue System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/') ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/menu') ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Food Menu
            </Link>
            <Link
              to="/queue-board"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                isActive('/queue-board') ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Tv className="w-4 h-4 text-orange-500" />
              Live Queue TV
            </Link>
            <Link
              to="/track"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                isActive('/track') ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              Track Token
            </Link>

            {/* Role-Specific Portal Button */}
            {role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  isActive('/admin') ? 'text-purple-600 bg-purple-50' : 'text-purple-700 bg-purple-50/60 hover:bg-purple-100/70'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            {role === 'staff' && (
              <Link
                to="/staff"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  isActive('/staff') ? 'text-blue-600 bg-blue-50' : 'text-blue-700 bg-blue-50/60 hover:bg-blue-100/70'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                Kitchen KDS
              </Link>
            )}

            {role === 'student' && (
              <Link
                to="/student"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  isActive('/student') ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Link>
            )}
          </div>

          {/* Right Actions: Cart & User */}
          <div className="flex items-center gap-3">
            
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold text-sm flex items-center gap-2 transition active:scale-95"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:relative sm:top-0 sm:right-0 bg-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-subtle">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Auth Buttons / User Avatar */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[130px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-600">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/25 transition active:scale-95"
                >
                  Demo Logins
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          >
            Food Menu
          </Link>
          <Link
            to="/queue-board"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          >
            📺 Live Queue TV Display
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          >
            ⏱️ Track Queue Token
          </Link>

          {role === 'student' && (
            <Link
              to="/student"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-orange-600 bg-orange-50"
            >
              My Student Dashboard
            </Link>
          )}
          {role === 'staff' && (
            <Link
              to="/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50"
            >
              Chef KDS Kitchen Counter
            </Link>
          )}
          {role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-purple-600 bg-purple-50"
            >
              Admin Command Center
            </Link>
          )}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-orange-600 text-white"
              >
                Sign In / Demo Accounts
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
