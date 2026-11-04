import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Clock, 
  Sparkles, 
  ChefHat, 
  BellRing, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';
import { useToast } from '../context/ToastContext';

export default function LiveQueueBoard() {
  const [queueData, setQueueData] = useState({
    current_serving_token: '--',
    estimated_average_wait: 10,
    total_in_queue: 0,
    preparing_orders: [],
    waiting_orders: [],
    ready_orders: [],
    recent_completed: []
  });

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCalledToken, setLastCalledToken] = useState(null);
  const { playChime } = useToast();

  const fetchLiveQueue = () => {
    api.get('/queue/live')
      .then((res) => {
        setQueueData(res.data);
      })
      .catch((err) => {
        console.error('Error fetching live queue:', err);
      });
  };

  useEffect(() => {
    fetchLiveQueue();

    // Clock ticker every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Fallback polling every 8 seconds in case socket drops
    const pollInterval = setInterval(fetchLiveQueue, 8000);

    // Socket.io real-time listeners
    const handleQueueUpdate = () => {
      fetchLiveQueue();
    };

    const handleStatusChanged = (data) => {
      fetchLiveQueue();
      if (data.status === 'Ready for Pickup') {
        setLastCalledToken(data.token);
        if (soundEnabled) {
          playChime();
        }
      }
    };

    socket.on('queue_updated', handleQueueUpdate);
    socket.on('order_status_changed', handleStatusChanged);
    socket.on('order_placed', handleQueueUpdate);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
      socket.off('queue_updated', handleQueueUpdate);
      socket.off('order_status_changed', handleStatusChanged);
      socket.off('order_placed', handleQueueUpdate);
    };
  }, [soundEnabled, playChime]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
        
        {/* Left Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white">
                CAMPUS<span className="text-orange-500">DINE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Display
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Central Complex Dining Hall • Public Order Queue Monitor
            </p>
          </div>
        </div>

        {/* Right Stats & Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xl font-black text-white tracking-wider font-mono">
              {currentTime}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              Avg Wait: ~{queueData.estimated_average_wait} mins
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playChime();
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                soundEnabled
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
              title="Toggle Audio Chime"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
            </button>

            <button
              onClick={fetchLiveQueue}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition"
              title="Toggle Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 flex-1">
        
        {/* Left Column (7 cols): NOW SERVING / READY FOR PICKUP */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl font-black text-emerald-400 tracking-wide uppercase">
                Now Serving / Ready for Pickup
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-400">
              Counter 1 & 2
            </span>
          </div>

          <div className="flex-1 bg-gradient-to-br from-emerald-950/40 to-gray-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl overflow-y-auto space-y-4">
            {queueData.ready_orders?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">All orders collected!</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  New ready tokens will chime and appear here as soon as kitchen chefs complete preparation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {queueData.ready_orders.map((ord, idx) => {
                  const isHighlight = ord.queue_token === lastCalledToken || idx === 0;

                  return (
                    <div
                      key={ord.id}
                      className={`p-6 rounded-2xl border transition duration-300 relative overflow-hidden ${
                        isHighlight
                          ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-300 text-white shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-400/40 animate-pulse-subtle'
                          : 'bg-emerald-900/40 border-emerald-600/40 text-emerald-100 hover:bg-emerald-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-extrabold tracking-widest uppercase opacity-80">
                          COUNTER #{idx % 2 === 0 ? '1' : '2'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-black/25 text-xs font-extrabold">
                          PICKUP NOW
                        </span>
                      </div>

                      <div className="text-5xl font-black tracking-tight my-1">
                        {ord.queue_token}
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/20 text-xs flex items-center justify-between">
                        <span className="font-bold truncate max-w-[150px]">
                          {ord.customer_name}
                        </span>
                        <span className="opacity-80 text-[11px]">
                          Slot: {ord.pickup_time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): PREPARING & WAITING IN QUEUE */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* NOW PREPARING */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">
                  Now Preparing in Kitchen
                </h3>
              </div>
              <span className="text-xs font-bold text-gray-400">
                {queueData.preparing_orders?.length} in prep
              </span>
            </div>

            <div className="bg-gray-800/80 rounded-2xl border border-gray-700/80 p-4 space-y-2.5 max-h-56 overflow-y-auto">
              {queueData.preparing_orders?.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  No orders currently on the stove.
                </p>
              ) : (
                queueData.preparing_orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-amber-300 font-mono">
                        {ord.queue_token}
                      </span>
                      <div>
                        <span className="font-bold text-white block truncate max-w-[160px]">
                          {ord.customer_name}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate block max-w-[180px]">
                          {ord.items_summary}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 px-2 py-1 rounded-lg shrink-0">
                      ~{ord.estimated_wait_time} min
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* WAITING IN QUEUE */}
          <div className="flex-1 space-y-3 flex flex-col">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <h3 className="text-base font-black text-gray-300 uppercase tracking-wide">
                  Waiting in Queue (FIFO)
                </h3>
              </div>
              <span className="text-xs font-bold text-orange-400">
                {queueData.waiting_orders?.length} upcoming
              </span>
            </div>

            <div className="flex-1 bg-gray-800/80 rounded-2xl border border-gray-700/80 p-4 overflow-y-auto space-y-2 max-h-60">
              {queueData.waiting_orders?.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  Queue is clear. Walk-in or pre-order to get token!
                </p>
              ) : (
                queueData.waiting_orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-300 font-bold text-[10px] flex items-center justify-center">
                        #{ord.position}
                      </span>
                      <span className="font-extrabold text-white font-mono text-sm">
                        {ord.queue_token}
                      </span>
                      <span className="text-gray-400 truncate max-w-[140px]">
                        {ord.customer_name}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      Slot: {ord.pickup_time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Announcement Ticker */}
      <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold text-[10px] uppercase">
            Notice
          </span>
          <span>
            Please present your digital token receipt on your mobile at Counter 1 or 2 upon pickup.
          </span>
        </div>
        <div className="text-[11px] text-gray-500">
          Total Orders Completed Today: {queueData.recent_completed?.length || 4}
        </div>
      </div>

    </div>
  );
}
