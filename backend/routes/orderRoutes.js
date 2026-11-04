const express = require('express');
const router = express.Router();
const { db, generateAtomicQueueToken } = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

// Create a helper to emit socket events
let ioInstance = null;
function setSocketIO(io) {
  ioInstance = io;
}

// Calculate estimated queue wait time for a new order
function calculateEstimatedWaitTime(items) {
  // Count active preparing/confirmed orders
  const activeOrders = db.orders.find().filter(o => ['Confirmed', 'Preparing'].includes(o.status));
  const queueLength = activeOrders.length;

  // Max prep time of the items in this order
  let maxItemPrep = 8;
  for (const item of items) {
    const food = db.food_items.findById(item.food_id);
    if (food && food.prep_time_minutes > maxItemPrep) {
      maxItemPrep = food.prep_time_minutes;
    }
  }

  // Base estimate: queue load (approx 3 mins per waiting batch) + preparation time
  const waitMinutes = Math.max(5, (queueLength * 3) + maxItemPrep);
  return waitMinutes;
}

// Student: Place Pre-Order
router.post('/', requireAuth, (req, res) => {
  try {
    const { items, pickup_date, pickup_time, payment_method, special_instructions } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty. Please add items to order.' });
    }

    if (!pickup_date || !pickup_time) {
      return res.status(400).json({ message: 'Please select a valid pickup date and time.' });
    }

    // Verify cafeteria operating hours (08:00 AM to 08:30 PM)
    // Basic format check
    if (!pickup_time.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
      return res.status(400).json({ message: 'Pickup time must be a valid time (e.g., 12:30 PM).' });
    }

    // Verify all items are currently available and calculate subtotal
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const food = db.food_items.findById(item.food_id);
      if (!food) {
        return res.status(400).json({ message: `Item ID ${item.food_id} not found.` });
      }
      if (food.is_available === 0) {
        return res.status(400).json({ message: `"${food.name}" is currently sold out. Please remove it from cart.` });
      }

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const subtotal = +(food.price * qty).toFixed(2);
      calculatedTotal += subtotal;

      validatedItems.push({
        food_id: food.id,
        food_name: food.name,
        price: food.price,
        quantity: qty,
        subtotal,
        image_url: food.image_url
      });
    }

    const taxAmount = +(calculatedTotal * 0.05).toFixed(2); // 5% campus dining charge
    const finalAmount = +(calculatedTotal + taxAmount).toFixed(2);

    // Atomic Queue Token Generation
    const today = new Date().toISOString().split('T')[0];
    const { token, sequence } = generateAtomicQueueToken(today);

    // Unique Order Number: ORD-YYYYMMDD-SEQ
    const orderNumber = `ORD-${today.replace(/-/g, '')}-${String(sequence).padStart(3, '0')}`;
    const waitTime = calculateEstimatedWaitTime(validatedItems);

    const order = db.orders.create({
      order_number: orderNumber,
      user_id: req.user.id,
      customer_name: req.user.name,
      customer_email: req.user.email,
      customer_phone: req.user.phone || '',
      pickup_date,
      pickup_time,
      total_amount: calculatedTotal,
      tax_amount: taxAmount,
      final_amount: finalAmount,
      status: 'Confirmed',
      payment_method: payment_method || 'Campus Card / Wallet',
      payment_status: 'Paid',
      special_instructions: special_instructions || '',
      queue_token: token,
      queue_sequence: sequence,
      estimated_wait_time: waitTime,
      items: validatedItems
    });

    // Real-time broadcast
    if (ioInstance) {
      ioInstance.emit('order_placed', { order });
      ioInstance.emit('queue_updated', {
        type: 'NEW_ORDER',
        orderNumber: order.order_number,
        token: order.queue_token
      });
    }

    return res.status(201).json({
      message: 'Order placed successfully! Your queue token has been assigned.',
      order
    });
  } catch (err) {
    console.error('Order placement error:', err);
    return res.status(500).json({ message: 'Failed to place order. Please try again.' });
  }
});

// Get user orders (Order History)
router.get('/my-orders', requireAuth, (req, res) => {
  try {
    const orders = db.orders.find({ user_id: req.user.id });
    return res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    return res.status(500).json({ message: 'Failed to fetch your orders' });
  }
});

// Admin/Staff: Get all orders with optional status and search filter
router.get('/', requireAuth, requireRole(['admin', 'staff']), (req, res) => {
  try {
    const { status, search, date } = req.query;
    let orders = db.orders.find();

    if (status && status !== 'all') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    if (date) {
      orders = orders.filter(o => o.pickup_date === date);
    }

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      orders = orders.filter(o =>
        o.order_number.toLowerCase().includes(term) ||
        o.queue_token.toLowerCase().includes(term) ||
        o.customer_name.toLowerCase().includes(term) ||
        o.customer_email.toLowerCase().includes(term)
      );
    }

    return res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get single order by ID, order number, or token
router.get('/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    let order = null;

    if (!isNaN(identifier)) {
      order = db.orders.findById(identifier);
    }

    if (!order) {
      order = db.orders.findByNumber(identifier);
    }

    if (!order) {
      order = db.orders.findByToken(identifier);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Calculate queue position if order is active
    let queuePosition = null;
    if (['Confirmed', 'Preparing'].includes(order.status)) {
      const allActive = db.orders.find()
        .filter(o => ['Confirmed', 'Preparing'].includes(o.status))
        .sort((a, b) => a.queue_sequence - b.queue_sequence);
      
      const pos = allActive.findIndex(o => o.id === order.id);
      queuePosition = pos !== -1 ? pos + 1 : 1;
    }

    return res.json({
      ...order,
      queue_position: queuePosition
    });
  } catch (err) {
    console.error('Error fetching single order:', err);
    return res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

// Cancel Order
router.post('/:id/cancel', requireAuth, (req, res) => {
  try {
    const order = db.orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization check: only order owner or admin/staff can cancel
    if (order.user_id !== req.user.id && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not authorized to cancel this order.' });
    }

    if (['Ready for Pickup', 'Completed', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel an order that is already ${order.status.toLowerCase()}.`
      });
    }

    const { reason = 'Cancelled by user' } = req.body;
    const updated = db.orders.update(order.id, {
      status: 'Cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason
    });

    if (ioInstance) {
      ioInstance.emit('order_cancelled', { orderId: order.id, token: order.queue_token });
      ioInstance.emit('queue_updated', { type: 'ORDER_CANCELLED', token: order.queue_token });
    }

    return res.json({
      message: 'Order cancelled successfully.',
      order: updated
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    return res.status(500).json({ message: 'Failed to cancel order' });
  }
});

module.exports = {
  router,
  setSocketIO
};
