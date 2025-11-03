const express = require('express');
const router = express.Router();
const Ticket = require('../Tickets/Ticket');
const Inventory = require('../Inv/Inventory');

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const firstDayThisMonth = new Date(currentYear, currentMonth, 1);
    const lastDayThisMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    
    const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const thisMonthRevenue = await Ticket.aggregate([
      {
        $match: {
          status: 'Completed',
          completedDate: {
            $gte: firstDayThisMonth,
            $lte: lastDayThisMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$actualCost' }
        }
      }
    ]);

    const lastMonthRevenue = await Ticket.aggregate([
      {
        $match: {
          status: 'Completed',
          completedDate: {
            $gte: firstDayLastMonth,
            $lte: lastDayLastMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$actualCost' }
        }
      }
    ]);

    const thisMonth = thisMonthRevenue[0]?.total || 0;
    const lastMonth = lastMonthRevenue[0]?.total || 0;
    
    let growthPercentage = 0;
    if (lastMonth > 0) {
      growthPercentage = (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1);
    } else if (thisMonth > 0) {
      growthPercentage = 100;
    }

    const ticketsByStatus = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusObj = {};
    ticketsByStatus.forEach(item => {
      statusObj[item._id] = item.count;
    });

    let inventoryByCategory = [];
    try {
      inventoryByCategory = await Inventory.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);
    } catch (err) {
      console.error('Error aggregating inventory by category:', err);
      inventoryByCategory = [];
    }

    let lowStockItems = [];
    try {
      lowStockItems = await Inventory.find({
        $expr: { $lte: ['$quantity', '$minStockLevel'] }
      }).limit(10);
    } catch (err) {
      console.error('Error finding low stock items:', err);
      lowStockItems = [];
    }

    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const todaysActiveTickets = await Ticket.find({
      status: { $in: ['In Progress', 'Pending'] },
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('assignedMechanic', 'name email')
      .limit(10);

    res.json({
      revenue: {
        thisMonth,
        lastMonth,
        growthPercentage: parseFloat(growthPercentage)
      },
      ticketsByStatus: statusObj,
      inventoryByCategory,
      lowStockItems,
      todaysActiveTickets
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

module.exports = router;