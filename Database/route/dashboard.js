const express = require('express');
const router = express.Router();
const Ticket = require('../Tickets/Ticket');
const Inventory = require('../Inv/Inventory');

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      ticketsByStatus,
      todaysActiveTickets,
      thisMonthRevenue,
      lastMonthRevenue,
      lowStockItems,
      inventoryByCategory
    ] = await Promise.all([
      Ticket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Ticket.find({
        status: 'In Progress',
        updatedAt: { $gte: startOfToday, $lte: endOfToday }
      }).populate('assignedMechanic', 'name'),
      Ticket.aggregate([
        {
          $match: {
            status: 'Completed',
            completedDate: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$actualCost' } } }
      ]),
      Ticket.aggregate([
        {
          $match: {
            status: 'Completed',
            completedDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$actualCost' } } }
      ]),
      Inventory.find().then(items => 
        items.filter(item => item.quantity <= item.minStockLevel)
      ),
      Inventory.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: { $multiply: ['$quantity', '$price'] } } } }
      ])
    ]);

    const thisMonth = thisMonthRevenue[0]?.total || 0;
    const lastMonth = lastMonthRevenue[0]?.total || 0;
    const growthPercentage = lastMonth === 0 ? 0 : ((thisMonth - lastMonth) / lastMonth) * 100;

    const statusData = ticketsByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      ticketsByStatus: statusData,
      todaysActiveTickets,
      revenue: {
        thisMonth,
        lastMonth,
        growthPercentage: growthPercentage.toFixed(2)
      },
      lowStockItems,
      inventoryByCategory
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics', error });
  }
});

module.exports = router;