const express = require('express');
const router = express.Router();
const Mechanic = require('../Mechanics/Mechanic'); // adjust path if needed

router.get('/', async (req, res) => {
  try {
    const mechanics = await Mechanic.find({ status: 'active' }).select('name IDnum email phone');
    res.json(mechanics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching mechanics', error });
  }
});

module.exports = router;
