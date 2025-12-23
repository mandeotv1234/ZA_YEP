
/**
 * ZALO YEP 2024 - BACKEND SERVER (Express + Socket.io + MongoDB)
 * 
 * Nâng cấp với WebSocket để xử lý real-time communication
 * Giảm tải API polling, tối ưu hóa hiệu năng
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

// CORS for Express
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Socket.io Configuration
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zalo_yep_voting';
let mongoConnected = false;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    mongoConnected = true;
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Using in-memory storage instead');
    mongoConnected = false;
  });

// Schema
const GameSchema = new mongoose.Schema({
  status: { type: String, enum: ['IDLE', 'VOTING', 'FINISHED'], default: 'IDLE' },
  startTime: { type: Number, default: null },
  durationMs: { type: Number, default: 300000 }, // 5 minutes
  votes: [{
    voterDomain: String,
    mrName: String,
    mrsName: String,
    timestamp: { type: Number, default: Date.now }
  }]
});

const Game = mongoose.model('Game', GameSchema);

// In-memory fallback for when MongoDB is not available
let gameStore = {
  status: 'IDLE',
  startTime: null,
  durationMs: 300000,
  votes: []
};

// Helper to get or create the single game instance
async function getGame() {
  if (!mongoConnected) {
    return gameStore;
  }
  
  try {
    let game = await Game.findOne();
    if (!game) {
      game = await Game.create({});
    }
    return game;
  } catch (error) {
    console.log('MongoDB query failed, using in-memory store');
    return gameStore;
  }
}

// Check and update game status based on time
async function checkGameStatus(game) {
  if (game.status === 'VOTING' && game.startTime) {
    const elapsed = Date.now() - game.startTime;
    if (elapsed >= game.durationMs) {
      game.status = 'FINISHED';
      if (mongoConnected && game.save) {
        await game.save();
      }
    }
  }
  return game;
}

// Save game to database or in-memory store
async function saveGame(game) {
  if (mongoConnected && game.save) {
    try {
      await game.save();
    } catch (error) {
      console.log('Failed to save to MongoDB, using in-memory');
      Object.assign(gameStore, game);
    }
  } else {
    Object.assign(gameStore, game);
  }
}

// Broadcast game state to all connected clients
async function broadcastGameState() {
  let game = await getGame();
  game = await checkGameStatus(game);
  
  const state = {
    status: game.status,
    startTime: game.startTime,
    durationMs: game.durationMs,
    serverTime: Date.now(),
    voteCount: game.votes.length
  };
  
  io.emit('gameStateChanged', state);
}

// --- REST API Endpoints (for backward compatibility) ---

// Get current game state
app.get('/api/game-state', async (req, res) => {
  try {
    let game = await getGame();
    game = await checkGameStatus(game);
    
    const { domain } = req.query;
    const hasVoted = game.votes.some(v => v.voterDomain === domain);
    
    res.json({
      status: game.status,
      startTime: game.startTime,
      durationMs: game.durationMs,
      serverTime: Date.now(),
      hasVoted: !!domain && hasVoted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the game (only if IDLE)
app.post('/api/start', async (req, res) => {
  try {
    let game = await getGame();
    if (game.status !== 'IDLE') {
      return res.status(400).json({ message: 'Game already started or finished' });
    }
    
    game.status = 'VOTING';
    game.startTime = Date.now();
    await saveGame(game);
    
    await broadcastGameState();
    res.json({ success: true, startTime: game.startTime });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a vote
app.post('/api/vote', async (req, res) => {
  try {
    const { domain, mrName, mrsName } = req.body;
    if (!domain || !mrName || !mrsName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let game = await getGame();
    game = await checkGameStatus(game);

    if (game.status !== 'VOTING') {
      return res.status(400).json({ message: 'Voting is not active' });
    }

    const existingVote = game.votes.find(v => v.voterDomain === domain);
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    game.votes.push({ voterDomain: domain, mrName, mrsName });
    await saveGame(game);

    await broadcastGameState();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get results (only if FINISHED)
app.get('/api/results', async (req, res) => {
  try {
    let game = await getGame();
    game = await checkGameStatus(game);

    if (game.status !== 'FINISHED') {
      return res.status(403).json({ message: 'Results not available yet' });
    }

    const mrCounts = {};
    const mrsCounts = {};

    game.votes.forEach(v => {
      const mr = v.mrName.trim();
      const mrs = v.mrsName.trim();
      mrCounts[mr] = (mrCounts[mr] || 0) + 1;
      mrsCounts[mrs] = (mrsCounts[mrs] || 0) + 1;
    });

    const getTop = (counts) => {
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name, count]) => ({ name, count }));
    };

    res.json({
      mr: getTop(mrCounts),
      mrs: getTop(mrsCounts),
      totalVotes: game.votes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset game (for testing/admin)
app.post('/api/reset', async (req, res) => {
  try {
    if (mongoConnected) {
      await Game.deleteMany({});
      await Game.create({});
    }
    gameStore = {
      status: 'IDLE',
      startTime: null,
      durationMs: 300000,
      votes: []
    };
    await broadcastGameState();
    res.json({ success: true, message: 'Game reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Socket.io Events ---

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Gửi game state hiện tại ngay khi kết nối
  getGame().then(async (game) => {
    game = await checkGameStatus(game);
    socket.emit('gameStateChanged', {
      status: game.status,
      startTime: game.startTime,
      durationMs: game.durationMs,
      serverTime: Date.now(),
      voteCount: game.votes.length
    });
  });

  // User login event
  socket.on('userLogin', async (data) => {
    const { domain } = data;
    socket.join(`user-${domain}`);
    
    let game = await getGame();
    game = await checkGameStatus(game);
    
    socket.emit('userLoginSuccess', {
      domain,
      hasVoted: game.votes.some(v => v.voterDomain === domain),
      gameState: {
        status: game.status,
        startTime: game.startTime,
        durationMs: game.durationMs,
        serverTime: Date.now()
      }
    });
  });

  // Admin connected
  socket.on('adminConnected', async () => {
    socket.join('admin-room');
    
    let game = await getGame();
    game = await checkGameStatus(game);
    
    socket.emit('adminGameState', {
      status: game.status,
      startTime: game.startTime,
      durationMs: game.durationMs,
      serverTime: Date.now(),
      votes: game.votes,
      voteCount: game.votes.length
    });
  });

  // Start game event
  socket.on('startGame', async () => {
    try {
      let game = await getGame();
      if (game.status !== 'IDLE') {
        socket.emit('error', { message: 'Game already started or finished' });
        return;
      }
      
      game.status = 'VOTING';
      game.startTime = Date.now();
      await saveGame(game);
      
      await broadcastGameState();
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Submit vote event
  socket.on('submitVote', async (data) => {
    try {
      const { domain, mrName, mrsName } = data;
      
      if (!domain || !mrName || !mrsName) {
        socket.emit('voteError', { message: 'Missing required fields' });
        return;
      }

      let game = await getGame();
      game = await checkGameStatus(game);

      if (game.status !== 'VOTING') {
        socket.emit('voteError', { message: 'Voting is not active' });
        return;
      }

      const existingVote = game.votes.find(v => v.voterDomain === domain);
      if (existingVote) {
        socket.emit('voteError', { message: 'You have already voted' });
        return;
      }

      game.votes.push({ voterDomain: domain, mrName, mrsName, timestamp: Date.now() });
      await saveGame(game);

      socket.emit('voteSuccess', { message: 'Vote submitted' });
      socket.to(`user-${domain}`).emit('voteConfirmed');
      
      // Broadcast updated game state
      await broadcastGameState();
    } catch (error) {
      socket.emit('voteError', { message: error.message });
    }
  });

  // Reset game event
  socket.on('resetGame', async () => {
    try {
      if (mongoConnected) {
        await Game.deleteMany({});
        await Game.create({});
      }
      gameStore = {
        status: 'IDLE',
        startTime: null,
        durationMs: 300000,
        votes: []
      };
      
      io.emit('gameReset');
      await broadcastGameState();
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Get results event
  socket.on('getResults', async () => {
    try {
      let game = await getGame();
      game = await checkGameStatus(game);

      if (game.status !== 'FINISHED') {
        socket.emit('resultsError', { message: 'Results not available yet' });
        return;
      }

      const mrCounts = {};
      const mrsCounts = {};

      game.votes.forEach(v => {
        const mr = v.mrName.trim();
        const mrs = v.mrsName.trim();
        mrCounts[mr] = (mrCounts[mr] || 0) + 1;
        mrsCounts[mrs] = (mrsCounts[mrs] || 0) + 1;
      });

      const getTop = (counts) => {
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([name, count]) => ({ name, count }));
      };

      socket.emit('resultsReady', {
        mr: getTop(mrCounts),
        mrs: getTop(mrsCounts),
        totalVotes: game.votes.length
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Server timer check - cập nhật game state mỗi 1 giây
setInterval(async () => {
  let game = await getGame();
  const previousStatus = game.status;
  game = await checkGameStatus(game);
  
  // Nếu trạng thái thay đổi, broadcast
  if (previousStatus !== game.status) {
    await broadcastGameState();
  }
}, 1000);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket enabled with Socket.io`);
});

