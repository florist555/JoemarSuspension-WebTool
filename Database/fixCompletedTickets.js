const mongoose = require('mongoose');
const Ticket = require('./Tickets/Ticket');

mongoose.connect('mongodb://localhost:27017/mechanic-shop')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

async function fixCompletedTickets() {
  try {
    // Find all completed tickets without completedDate
    const tickets = await Ticket.find({
      status: 'Completed',
      completedDate: null
    });

    console.log(`Found ${tickets.length} completed tickets without completion date`);

    for (const ticket of tickets) {
      // Use updated date as completed date if available, otherwise current date
      const completedDate = ticket.updatedAt || new Date();
      const actualCost = ticket.actualCost || ticket.estimatedCost || 0;

      await Ticket.findByIdAndUpdate(ticket._id, {
        completedDate,
        actualCost
      });

      console.log(`Fixed ticket ${ticket.ticketId}:`);
      console.log('- Set completedDate:', completedDate);
      console.log('- Set actualCost:', actualCost);
    }

    console.log('\nAll completed tickets have been fixed');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

fixCompletedTickets();