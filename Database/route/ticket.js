const express = require('express');
const router = express.Router();
const Ticket = require('../Tickets/Ticket');

router.post('/', async (req, res) => {
  try {
    let ticketId;
    let count = await Ticket.countDocuments();
    let attempts = 0;
    
    while (attempts < 100) {
      ticketId = `TCK-${(count + 1).toString().padStart(3, '0')}`;
      const exists = await Ticket.findOne({ ticketId });
      if (!exists) break;
      count++;
      attempts++;
    }

    let ticketNumber = ticketId;

    const cleanedBody = { ...req.body };
    
    if (cleanedBody.assignedMechanic === "" || cleanedBody.assignedMechanic === null) {
      delete cleanedBody.assignedMechanic;
    }
    if (cleanedBody.createdBy === "" || cleanedBody.createdBy === null) {
      delete cleanedBody.createdBy;
    }

    const ticket = new Ticket({
      ...cleanedBody,
      ticketId,
      ticketNumber,
    });

    const savedTicket = await ticket.save();
    const populatedTicket = await Ticket.findById(savedTicket._id).populate('assignedMechanic', 'name email IDnum');
    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Error creating ticket', error });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (search) filter.ticketId = { $regex: search, $options: 'i' };

    const tickets = await Ticket.find(filter)
      .populate('assignedMechanic', 'name email IDnum')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets', error });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const cleanedBody = { ...req.body };
    
    if (cleanedBody.assignedMechanic === "" || cleanedBody.assignedMechanic === null) {
      delete cleanedBody.assignedMechanic;
    }

    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      cleanedBody,
      { new: true }
    ).populate('assignedMechanic', 'name email IDnum');

    if (!updated) return res.status(404).json({ message: 'Ticket not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Error updating ticket', error });
  }
});

router.patch('/:id/mark-done', async (req, res) => {
  try {
    const { actualCost } = req.body;
    
    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Completed', 
        completedDate: new Date(),
        actualCost: actualCost || 0
      },
      { new: true }
    ).populate('assignedMechanic', 'name email IDnum');

    if (!updated) return res.status(404).json({ message: 'Ticket not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error marking done:', error);
    res.status(500).json({ message: 'Error marking done', error });
  }
});

router.patch('/:id/reopen', async (req, res) => {
  try {
    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'Open', completedDate: null },
      { new: true }
    ).populate('assignedMechanic', 'name email IDnum');

    if (!updated) return res.status(404).json({ message: 'Ticket not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error reopening ticket:', error);
    res.status(500).json({ message: 'Error reopening ticket', error });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted successfully', ticket: deleted });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Error deleting ticket', error });
  }
});

router.get('/export/csv', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('assignedMechanic', 'name email')
      .sort({ createdAt: -1 });

    const csvRows = [];
    csvRows.push([
      'Ticket ID',
      'Customer Name',
      'Contact',
      'Vehicle',
      'Issue',
      'Status',
      'Priority',
      'Assigned Mechanic',
      'Estimated Cost',
      'Actual Cost',
      'Created Date',
      'Completed Date'
    ].join(','));

    tickets.forEach(ticket => {
      const vehicle = `${ticket.vehicleInfo?.year || ''} ${ticket.vehicleInfo?.make || ''} ${ticket.vehicleInfo?.model || ''}`.trim();
      const mechanic = ticket.assignedMechanic ? ticket.assignedMechanic.name : 'Unassigned';
      const completedDate = ticket.completedDate ? new Date(ticket.completedDate).toLocaleDateString() : 'N/A';
      
      csvRows.push([
        ticket.ticketId,
        `"${ticket.customerName}"`,
        ticket.customerContact,
        `"${vehicle}"`,
        `"${ticket.issueDescription.replace(/"/g, '""')}"`,
        ticket.status,
        ticket.priority,
        mechanic,
        ticket.estimatedCost,
        ticket.actualCost,
        new Date(ticket.createdAt).toLocaleDateString(),
        completedDate
      ].join(','));
    });

    const csv = csvRows.join('\n');
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="tickets_export.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting tickets:', error);
    res.status(500).json({ message: 'Error exporting tickets', error });
  }
});

module.exports = router;