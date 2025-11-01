const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/mechanic-shop')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'mechanic'],
    default: 'mechanic'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('^^!*J@', 10);
    
    const admin = new User({
      email: 'qt78admin.joemar@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin account created!');
    process.exit(0);
  } catch (error) {
    console.error('Error', error);
    process.exit(1);
  }
}

createAdmin();