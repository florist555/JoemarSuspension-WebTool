const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  partName: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Engine', 'Brakes', 'Suspension', 'Transmission', 'Ignition', 'Exhaust', 'Cooling', 'Fuel', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true 
});

inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel;
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;