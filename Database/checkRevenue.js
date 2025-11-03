const mongoose = require('mongoose');
const Ticket = require('./Tickets/Ticket');

mongoose.connect('mongodb://localhost:27017/mechanic-shop')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

async function checkRevenue() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log('\nChecking completed tickets for current month:');
    console.log('Date range:', startOfMonth.toISOString(), 'to', endOfMonth.toISOString());

    const completedTickets = await Ticket.find({
      status: 'Completed',
      completedDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    console.log('\nCompleted tickets found:', completedTickets.length);
    
    if (completedTickets.length > 0) {
      completedTickets.forEach(ticket => {
        console.log('\nTicket details:');
        console.log('- Ticket ID:', ticket.ticketId);
        console.log('- Status:', ticket.status);
        console.log('- Completed Date:', ticket.completedDate);
        console.log('- Actual Cost:', ticket.actualCost);
        console.log('- Estimated Cost:', ticket.estimatedCost);
      });

      const totalRevenue = completedTickets.reduce((sum, ticket) => sum + (ticket.actualCost || 0), 0);
      console.log('\nTotal Revenue:', totalRevenue);
    } else {
      console.log('No completed tickets found in this period');
    }

    // Also show any completed tickets without completedDate (possible issue)
    const invalidTickets = await Ticket.find({
      status: 'Completed',
      completedDate: null
    });

    if (invalidTickets.length > 0) {
      console.log('\nWARNING: Found completed tickets without completedDate:');
      invalidTickets.forEach(ticket => {
        console.log('- Ticket ID:', ticket.ticketId, 'Cost:', ticket.actualCost);
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkRevenue();