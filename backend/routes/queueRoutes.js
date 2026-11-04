const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

let ioInstance = null;
function setSocketIO(io) {
  ioInstance = io;
}

// Get live queue state for the public Queue Display Board & Dashboards
router.get('/live', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allOrders = db.orders.find();

    // Filter today's active & recent orders
    const todayOrders = allOrders.filter(o => o.pickup_date === today || o.created_at.startsWith(today));

    const preparing = todayOrders
      .filter(o => o.status === 'Preparing')
      .sort((a, b) => a.queue_sequence - b.queue_sequence);

    const waiting = todayOrders
      .filter(o => o.status === 'Confirmed')
      .sort((a, b) => a.queue_sequence - b.queue_sequence);

    const readyForPickup = todayOrders
      .filter(o => o.status === 'Ready for Pickup')
      .sort((a, b) => new Date(b.ready_at || b.created_at) - new Date(a.ready_at || a.created_at));

    const completedRecent = todayOrders
      .filter(o => o.status === 'Completed')
      .sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at))
      .slice(0, 10);

    // Current serving token
    const currentServingToken = readyForPickup.length > 0
      ? readyForPickup[0].queue_token
      : (preparing.length > 0 ? preparing[0].queue_token : '--');

    // Calculate dynamic average waiting time
    const activeCount = preparing.length + waiting.length;
    const estimatedAverageWait = Math.max(5, activeCount * 4);

    return res.json({
      status: 'success',
      date: today,
      current_serving_token: currentServingToken,
      estimated_average_wait: estimatedAverageWait,
      total_in_queue: activeCount,
      preparing_orders: preparing.map(o => ({
        id: o.id,
        order_number: o.order_number,
        queue_token: o.queue_token,
        customer_name: o.customer_name,
        pickup_time: o.pickup_time,
        items_count: o.items.length,
        items_summary: o.items.map(i => `${i.quantity}x ${i.food_name}`).join(', '),
        estimated_wait_time: o.estimated_wait_time,
        created_at: o.created_at
      })),
      waiting_orders: waiting.map((o, idx) => ({
        id: o.id,
        order_number: o.order_number,
        queue_token: o.queue_token,
        customer_name: o.customer_name,
        pickup_time: o.pickup_time,
        position: idx + 1,
        items_count: o.items.length,
        items_summary: o.items.map(i => `${i.quantity}x ${i.food_name}`).join(', '),
        estimated_wait_time: Math.max(5, (idx + 1) * 4),
        created_at: o.created_at
      })),
      ready_orders: readyForPickup.map(o => ({
        id: o.id,
        order_number: o.order_number,
        queue_token: o.queue_token,
        customer_name: o.customer_name,
        pickup_time: o.pickup_time,
        ready_at: o.ready_at,
        items_summary: o.items.map(i => `${i.quantity}x ${i.food_name}`).join(', ')
      })),
      recent_completed: completedRecent.map(o => ({
        id: o.id,
        order_number: o.order_number,
        queue_token: o.queue_token,
        customer_name: o.customer_name,
        completed_at: o.completed_at
      }))
    });
  } catch (err) {
    console.error('Error fetching live queue:', err);
    return res.status(500).json({ message: 'Failed to fetch queue data' });
  }
});

// Staff / Admin: Update order status along the queue lifecycle
// Confirmed -> Preparing -> Ready for Pickup -> Completed
router.post('/:id/status', requireAuth, requireRole(['staff', 'admin']), (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const order = db.orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updates = { status };
    if (status === 'Ready for Pickup') {
      updates.ready_at = new Date().toISOString();
      updates.estimated_wait_time = 0;
    } else if (status === 'Completed') {
      updates.completed_at = new Date().toISOString();
      updates.estimated_wait_time = 0;
    } else if (status === 'Cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    const updatedOrder = db.orders.update(order.id, updates);

    // Emit real-time WebSocket events
    if (ioInstance) {
      ioInstance.emit('order_status_changed', {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        token: updatedOrder.queue_token,
        status: updatedOrder.status,
        ready_at: updatedOrder.ready_at,
        completed_at: updatedOrder.completed_at,
        shouldChime: status === 'Ready for Pickup' // triggers pleasant audio chime on display board!
      });

      ioInstance.emit('queue_updated', {
        type: 'STATUS_UPDATE',
        token: updatedOrder.queue_token,
        status: updatedOrder.status
      });
    }

    return res.json({
      message: `Order ${updatedOrder.queue_token} status updated to "${status}"`,
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error updating queue status:', err);
    return res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Single token status lookup
router.get('/token/:token', (req, res) => {
  try {
    const token = req.params.token.toUpperCase();
    const order = db.orders.findByToken(token);
    if (!order) {
      return res.status(404).json({ message: `Token ${token} not found` });
    }

    let position = null;
    if (['Confirmed', 'Preparing'].includes(order.status)) {
      const active = db.orders.find()
        .filter(o => ['Confirmed', 'Preparing'].includes(o.status))
        .sort((a, b) => a.queue_sequence - b.queue_sequence);
      const pos = active.findIndex(o => o.id === order.id);
      position = pos !== -1 ? pos + 1 : 1;
    }

    return res.json({
      order_id: order.id,
      order_number: order.order_number,
      queue_token: order.queue_token,
      status: order.status,
      position,
      pickup_time: order.pickup_time,
      estimated_wait_time: order.estimated_wait_time,
      customer_name: order.customer_name,
      items: order.items
    });
  } catch (err) {
    console.error('Error checking token:', err);
    return res.status(500).json({ message: 'Failed to retrieve token details' });
  }
});

module.exports = {
  router,
  setSocketIO
};
