const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  customerContact: {
    type: String,
    required: true
  },
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    plateNumber: String
  },
  issueDescription: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Pending', 'In Progress', 'Completed', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  assignedMechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);