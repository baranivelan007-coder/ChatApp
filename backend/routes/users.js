const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/find/:uniqueId', authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.uniqueId.toUpperCase();

    if (targetId === req.user.uniqueId) {
      return res.status(400).json({ message: "That's your own ID" });
    }

    const user = await User.findOne({ uniqueId: targetId }).select(
      'name uniqueId isOnline lastSeen'
    );
    if (!user) return res.status(404).json({ message: 'No user found with that ID' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    }).sort({ createdAt: -1 });

    const contactIds = new Set();
    messages.forEach((m) => {
      const otherId = m.sender.toString() === myId.toString() ? m.receiver : m.sender;
      contactIds.add(otherId.toString());
    });

    const contacts = await User.find({ _id: { $in: [...contactIds] } }).select(
      'name uniqueId isOnline lastSeen'
    );

    res.json({ contacts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
