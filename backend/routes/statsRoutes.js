const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

// Admin Overview Analytics
router.get('/overview', requireAuth, requireRole(['admin']), (req, res) => {
  try {
    const orders = db.orders.find();
    const foodItems = db.food_items.find();
    const users = db.users.find();
    const today = new Date().toISOString().split('T')[0];

    const todayOrders = orders.filter(o => o.pickup_date === today || o.created_at.startsWith(today));

    // Status counts
    const statusCounts = {
      Pending: 0,
      Confirmed: 0,
      Preparing: 0,
      'Ready for Pickup': 0,
      Completed: 0,
      Cancelled: 0
    };

    let totalRevenue = 0;
    let todayRevenue = 0;

    for (const ord of orders) {
      if (statusCounts[ord.status] !== undefined) {
        statusCounts[ord.status]++;
      }
      if (ord.status !== 'Cancelled') {
        totalRevenue += ord.final_amount || 0;
      }
    }

    for (const ord of todayOrders) {
      if (ord.status !== 'Cancelled') {
        todayRevenue += ord.final_amount || 0;
      }
    }

    // Popular items calculation
    const itemSalesMap = {};
    for (const ord of orders) {
      if (ord.status === 'Cancelled') continue;
      for (const it of ord.items || []) {
        if (!itemSalesMap[it.food_name]) {
          itemSalesMap[it.food_name] = { name: it.food_name, count: 0, revenue: 0, image_url: it.image_url };
        }
        itemSalesMap[it.food_name].count += it.quantity;
        itemSalesMap[it.food_name].revenue += it.subtotal;
      }
    }

    const popularItems = Object.values(itemSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Category sales distribution
    const categoryMap = {};
    for (const item of foodItems) {
      const cat = item.category_name || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }
    const categoryDistribution = Object.keys(categoryMap).map(cat => ({
      category: cat,
      itemCount: categoryMap[cat]
    }));

    // Daily trends (past 7 days)
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const dayOrders = orders.filter(o => (o.pickup_date === dateStr || o.created_at.startsWith(dateStr)) && o.status !== 'Cancelled');
      const dayRev = dayOrders.reduce((sum, o) => sum + (o.final_amount || 0), 0);

      past7Days.push({
        date: dateStr,
        label: dayLabel,
        ordersCount: dayOrders.length,
        revenue: +dayRev.toFixed(2)
      });
    }

    return res.json({
      summary: {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        activeQueue: statusCounts['Confirmed'] + statusCounts['Preparing'],
        readyOrders: statusCounts['Ready for Pickup'],
        completedOrders: statusCounts['Completed'],
        cancelledOrders: statusCounts['Cancelled'],
        totalRevenue: +totalRevenue.toFixed(2),
        todayRevenue: +todayRevenue.toFixed(2),
        averageOrderValue: orders.length ? +(totalRevenue / orders.length).toFixed(2) : 0,
        registeredStudents: users.filter(u => u.role === 'student').length,
        staffCount: users.filter(u => u.role === 'staff').length
      },
      statusDistribution: statusCounts,
      popularItems,
      categoryDistribution,
      dailyTrends: past7Days
    });
  } catch (err) {
    console.error('Error generating stats overview:', err);
    return res.status(500).json({ message: 'Failed to generate statistics' });
  }
});

// Admin: Manage Users list
router.get('/users', requireAuth, requireRole(['admin']), (req, res) => {
  try {
    const users = db.users.find().map(u => {
      const { password, ...safeData } = u;
      return safeData;
    });
    return res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
