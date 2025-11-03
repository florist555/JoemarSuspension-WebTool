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
    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed', completedDate: new Date() },
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

module.exports = router;