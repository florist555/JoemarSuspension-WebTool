const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
const dashboardRoutes = require('./route/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mechanic-shop';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('DB Connected'))
  .catch((error) => console.error('Error:', error));

const inventoryRoutes = require('./route/inventory');
const authRoutes = require('./route/auth');
const ticketRoutes = require('./route/ticket');
const mechanicRoutes = require('./route/mechanics');

app.use('/api/inventory', inventoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/mechanics', mechanicRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'JoemarSuspension API is running!' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` ${PORT}`);
});
