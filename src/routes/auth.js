const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();

// POST /api/auth/register
// Body: { username: "Inky123", pin: "🐙⭐🌊" }
router.post('/register', async (req, res) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ error: 'Username and PIN are required' });
  }

  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 2–20 characters' });
  }

  if (pin.length < 3 || pin.length > 20) {
    return res.status(400).json({ error: 'PIN must be 3–20 characters' });
  }

  try {
    const pinHash = await bcrypt.hash(pin, 10);

    db.run(
      'INSERT INTO users (username, pin_hash) VALUES (?, ?)',
      [username.trim(), pinHash],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'That username is already taken' });
          }
          return res.status(500).json({ error: 'Could not create account' });
        }

        const token = jwt.sign(
          { userId: this.lastID, username: username.trim() },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
          message: 'Account created!',
          token,
          user: { id: this.lastID, username: username.trim() }
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
// Body: { username: "Inky123", pin: "🐙⭐🌊" }
router.post('/login', (req, res) => {
  const { username, pin } = req.body;

  if (!username || !pin) {
    return res.status(400).json({ error: 'Username and PIN are required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username.trim()],
    async (err, user) => {
      if (err) return res.status(500).json({ error: 'Server error' });

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or PIN' });
      }

      const match = await bcrypt.compare(pin, user.pin_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid username or PIN' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Logged in!',
        token,
        user: { id: user.id, username: user.username }
      });
    }
  );
});

module.exports = router;