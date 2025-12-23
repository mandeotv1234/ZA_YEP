
/**
 * ZALO YEP 2024 - BACKEND SERVER (Express + MongoDB)
 * 
 * Hướng dẫn chạy:
 * 1. Cài đặt Node.js
 * 2. Chạy lệnh: npm install express mongoose cors dotenv
 * 3. Tạo file .env và thêm: MONGODB_URI=your_mongodb_connection_string
 * 4. Chạy server: node server.js
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zalo_yep_voting';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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

// Helper to get or create the single game instance
async function getGame() {
  let game = await Game.findOne();
  if (!game) {
    game = await Game.create({});
  }
  return game;
}

// Check and update game status based on time
async function checkGameStatus(game) {
  if (game.status === 'VOTING' && game.startTime) {
    const elapsed = Date.now() - game.startTime;
    if (elapsed >= game.durationMs) {
      game.status = 'FINISHED';
      await game.save();
    }
  }
  return game;
}

// --- API Endpoints ---

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
    await game.save();
    
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

    // Check if user already voted
    const existingVote = game.votes.find(v => v.voterDomain === domain);
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    game.votes.push({ voterDomain: domain, mrName, mrsName });
    await game.save();

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

    // Count votes
    const mrCounts = {};
    const mrsCounts = {};

    game.votes.forEach(v => {
      const mr = v.mrName.trim(); // Normalize?
      const mrs = v.mrsName.trim();
      mrCounts[mr] = (mrCounts[mr] || 0) + 1;
      mrsCounts[mrs] = (mrsCounts[mrs] || 0) + 1;
    });

    // Find top winners
    const getTop = (counts) => {
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2) // Top 2
        .map(([name, count]) => ({ name, count }));
    };

    res.json({
      mr: getTop(mrCounts),
      mrs: getTop(mrsCounts)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset game (for testing/admin)
app.post('/api/reset', async (req, res) => {
  try {
    await Game.deleteMany({});
    await Game.create({});
    res.json({ success: true, message: 'Game reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

