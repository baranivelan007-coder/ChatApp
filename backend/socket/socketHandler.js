const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

// Maps MongoDB _id (string) -> socket.id, so we know where to deliver messages
const onlineUsers = new Map();

function initSocket(io) {
  // Authenticate every socket connection using the same JWT as REST routes
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user; // attach full user doc to this socket
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, { isOnline: true });
    socket.broadcast.emit('userOnline', { userId });

    // --- Send message ---
    socket.on('sendMessage', async ({ receiverId, text }) => {
      try {
        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          text,
        });

        const payload = {
          _id: message._id,
          sender: userId,
          receiver: receiverId,
          text: message.text,
          createdAt: message.createdAt,
        };

        // Send to receiver if they're online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', payload);
        }

        // Echo back to sender (so their own UI updates, e.g. across multiple tabs)
        socket.emit('messageSent', payload);
      } catch (err) {
        socket.emit('errorMessage', { message: 'Failed to send message' });
      }
    });

    // --- Typing indicators ---
    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { userId });
      }
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { userId });
      }
    });

    // --- Disconnect ---
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      socket.broadcast.emit('userOffline', { userId, lastSeen: new Date() });
    });
  });
}

module.exports = initSocket;
