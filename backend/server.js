const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./database');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const { router: orderRoutes, setSocketIO: setOrderSocketIO } = require('./routes/orderRoutes');
const { router: queueRoutes, setSocketIO: setQueueSocketIO } = require('./routes/queueRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Initialize Database & Seed data
initDatabase();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Pass IO instance to routes for real-time broadcasts
setOrderSocketIO(io);
setQueueSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Cafeteria Pre-Order & Queue Management System',
    timestamp: new Date().toISOString()
  });
});

// Real-time Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`[Socket.IO] Client ${socket.id} joined room order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 🍽️  CAFETERIA PRE-ORDER & QUEUE MANAGEMENT SYSTEM `);
  console.log(` 🚀  Backend Server running on http://localhost:${PORT}`);
  console.log(` ⚡  Socket.IO real-time engine ready`);
  console.log(`====================================================`);
});
