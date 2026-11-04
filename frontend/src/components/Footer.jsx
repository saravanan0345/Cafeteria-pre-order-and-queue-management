import React from 'react';
import { Utensils, Heart, Shield, Clock, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-charcoal-800 text-gray-300 pt-16 pb-12 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          
          {/* Col 1: System Branding */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                CAMPUS<span className="text-orange-500">DINE</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              A modern, intelligent full-stack cafeteria pre-ordering and FIFO queue management solution. Built to eliminate long canteen waiting lines, optimize kitchen prep times, and deliver an exceptional dining experience.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-orange-400 border border-gray-700">
                React 18 + Vite
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-amber-400 border border-gray-700">
                Node & Express
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-emerald-400 border border-gray-700">
                Real-Time Socket.IO
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-blue-400 border border-gray-700">
                Atomic FIFO Queue
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/menu" className="hover:text-orange-400 transition">
                  Browse Food Menu
                </Link>
              </li>
              <li>
                <Link to="/queue-board" className="hover:text-orange-400 transition">
                  Live Queue TV Display
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-orange-400 transition">
                  Track Order & Token
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange-400 transition">
                  Role Demo Logins
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Location */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Cafeteria Schedule
            </h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-200 block">Mon - Fri Operating Hours</span>
                  <span>08:00 AM – 08:30 PM (Continuous)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-200 block">Campus Location</span>
                  <span>Student Dining Hub, Central Complex, Ground Floor</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>
            © {new Date().getFullYear()} Cafeteria Pre-Order & Queue Management System. College Academic Project Demonstration.
          </p>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Designed for College Project Demo</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
