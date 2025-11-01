// Database/route/inventory.js
const express = require('express');
const router = express.Router();
const Inventory = require('../Inv/Inventory');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single inventory item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET low stock items (for dashboard)
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const items = await Inventory.find();
    const lowStockItems = items.filter(item => item.quantity <= item.minStockLevel);
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new inventory item
router.post('/', async (req, res) => {
  const item = new Inventory({
    partName: req.body.partName,
    partNumber: req.body.partNumber,
    quantity: req.body.quantity,
    minStockLevel: req.body.minStockLevel,
    price: req.body.price,
    supplier: req.body.supplier,
    category: req.body.category,
    description: req.body.description
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update fields if provided
    if (req.body.partName != null) item.partName = req.body.partName;
    if (req.body.partNumber != null) item.partNumber = req.body.partNumber;
    if (req.body.quantity != null) item.quantity = req.body.quantity;
    if (req.body.minStockLevel != null) item.minStockLevel = req.body.minStockLevel;
    if (req.body.price != null) item.price = req.body.price;
    if (req.body.supplier != null) item.supplier = req.body.supplier;
    if (req.body.category != null) item.category = req.body.category;
    if (req.body.description != null) item.description = req.body.description;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE inventory item
router.delete('/:id', async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;