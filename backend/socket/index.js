const { Server } = require('socket.io');
const config = require('../config');
const { verifyToken } = require('../utils/jwt');
const UserRepository = require('../repositories/user.repository');
const CommunicationRepository = require('../repositories/communication.repository');

const userRepo = new UserRepository();
const presenceRepo = new CommunicationRepository();

/** @type {import('socket.io').Server | null} */
let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrls,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization || '').replace(/^Bearer\s+/i, '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      const user = await userRepo.findPublicById(decoded.id);
      if (!user) return next(new Error('Invalid token'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    socket.join(`user:${user.id}`);
    if (user.role === 'admin') {
      socket.join('admins');
    }

    await presenceRepo.setPresence(user.id, true);
    io.emit('presence:update', {
      userId: user.id,
      isOnline: true,
      lastSeen: new Date().toISOString(),
    });

    socket.on('conversation:join', (conversationId) => {
      if (conversationId) socket.join(`conversation:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
        // Stop typing when leaving a conversation
        socket.to(`conversation:${conversationId}`).emit('typing:stop', {
          conversationId,
          userId: user.id,
        });
      }
    });

    // Live typing — broadcast only within the conversation room (exclude sender)
    socket.on('typing:start', (payload = {}) => {
      const conversationId = payload.conversationId || payload;
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId: user.id,
        userName: user.full_name || (user.role === 'admin' ? 'Admin' : 'User'),
        role: user.role,
      });
    });

    socket.on('typing:stop', (payload = {}) => {
      const conversationId = payload.conversationId || payload;
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: user.id,
        role: user.role,
      });
    });

    // Client can request seen sync when opening a chat (API also emits this)
    socket.on('message_seen', (payload = {}) => {
      const conversationId = payload.conversationId;
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('message_seen', {
        ...payload,
        readerId: user.id,
        readerRole: user.role === 'admin' ? 'admin' : 'user',
      });
    });

    socket.on('disconnect', async () => {
      await presenceRepo.setPresence(user.id, false);
      io.emit('presence:update', {
        userId: user.id,
        isOnline: false,
        lastSeen: new Date().toISOString(),
      });
    });
  });

  // eslint-disable-next-line no-console
  console.log('[Socket.IO] Communication Center ready');
  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
};

const emitToAdmins = (event, payload) => {
  if (!io) return;
  io.to('admins').emit(event, payload);
};

const emitConversationEvent = (event, payload) => {
  if (!io) return;
  const conversationId = payload?.conversationId || payload?.conversation?.id;
  if (conversationId) {
    io.to(`conversation:${conversationId}`).emit(event, payload);
  }
  // Also notify participants who may not have joined the room yet
  if (event !== 'typing:start' && event !== 'typing:stop') {
    io.to('admins').emit(event, payload);
    const userId = payload?.conversation?.user_id;
    if (userId) emitToUser(userId, event, payload);
  }
};

const notifyUserReply = (message) => {
  if (message.sender_id || message.user_id) {
    emitToUser(message.sender_id || message.user_id, 'message:reply', message);
  }
};

const notifyAdminsNewMessage = (message) => {
  emitToAdmins('message:new', message);
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToAdmins,
  emitConversationEvent,
  notifyUserReply,
  notifyAdminsNewMessage,
};
