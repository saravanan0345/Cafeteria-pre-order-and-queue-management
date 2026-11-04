const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.categories.find();
    return res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get all food items with search and filters
router.get('/', (req, res) => {
  try {
    const { category, search, veg_only, available_only } = req.query;
    let items = db.food_items.find();

    if (category && category !== 'all') {
      items = items.filter(it => it.category_name.toLowerCase() === category.toLowerCase());
    }

    if (veg_only === 'true' || veg_only === '1') {
      items = items.filter(it => it.is_veg === 1);
    }

    if (available_only === 'true') {
      items = items.filter(it => it.is_available === 1);
    }

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      items = items.filter(it =>
        it.name.toLowerCase().includes(term) ||
        it.description.toLowerCase().includes(term) ||
        it.category_name.toLowerCase().includes(term)
      );
    }

    return res.json(items);
  } catch (err) {
    console.error('Error fetching food items:', err);
    return res.status(500).json({ message: 'Failed to fetch food items' });
  }
});

// Get single food item
router.get('/:id', (req, res) => {
  try {
    const item = db.food_items.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    return res.json(item);
  } catch (err) {
    console.error('Error fetching food item:', err);
    return res.status(500).json({ message: 'Failed to fetch item' });
  }
});

// Admin: Add new food item
router.post('/', requireAuth, requireRole(['admin']), (req, res) => {
  try {
    const { name, description, price, category_name, is_veg, prep_time_minutes, image_url, calories, is_featured, is_special } = req.body;

    if (!name || !price || !category_name) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    const categories = db.categories.find();
    const matchedCategory = categories.find(c => c.name.toLowerCase() === category_name.toLowerCase());

    const newItem = db.food_items.create({
      name,
      description,
      price: parseFloat(price),
      category_id: matchedCategory ? matchedCategory.id : 1,
      category_name: matchedCategory ? matchedCategory.name : category_name,
      is_veg: is_veg !== undefined ? Number(is_veg) : 1,
      prep_time_minutes: prep_time_minutes ? Number(prep_time_minutes) : 10,
      image_url,
      calories: calories ? Number(calories) : 300,
      is_featured: is_featured ? 1 : 0,
      is_special: is_special ? 1 : 0
    });

    return res.status(201).json({
      message: 'Food item added successfully!',
      item: newItem
    });
  } catch (err) {
    console.error('Error adding food item:', err);
    return res.status(500).json({ message: 'Failed to add food item' });
  }
});

// Admin & Staff: Update food item (staff can toggle availability)
router.put('/:id', requireAuth, requireRole(['admin', 'staff']), (req, res) => {
  try {
    const item = db.food_items.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const updates = {};
    const allowedFields = ['is_available'];
    if (req.user.role === 'admin') {
      allowedFields.push('name', 'description', 'price', 'category_name', 'is_veg', 'prep_time_minutes', 'image_url', 'calories', 'rating', 'is_featured', 'is_special');
    }

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedItem = db.food_items.update(req.params.id, updates);
    return res.json({
      message: 'Food item updated successfully!',
      item: updatedItem
    });
  } catch (err) {
    console.error('Error updating food item:', err);
    return res.status(500).json({ message: 'Failed to update food item' });
  }
});

// Admin: Delete food item
router.delete('/:id', requireAuth, requireRole(['admin']), (req, res) => {
  try {
    const success = db.food_items.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    return res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    console.error('Error deleting food item:', err);
    return res.status(500).json({ message: 'Failed to delete food item' });
  }
});

module.exports = router;
