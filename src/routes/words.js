const express = require('express');
const db = require('../database/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /api/words?difficulty=1&limit=10
// Returns a batch of words for a game session
router.get('/', requireAuth, (req, res) => {
  const difficulty = parseInt(req.query.difficulty) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);

  if (![1, 2, 3].includes(difficulty)) {
    return res.status(400).json({ error: 'difficulty must be 1, 2, or 3' });
  }

  db.all(
    `SELECT id, base_form, past_simple, past_participle, present_participle, difficulty, year_group
     FROM words
     WHERE difficulty = ?
     ORDER BY RANDOM()
     LIMIT ?`,
    [difficulty, limit],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not load words' });
      res.json({ words: rows });
    }
  );
});

// GET /api/words/all — returns all words (for teacher review)
router.get('/all', requireAuth, (req, res) => {
  db.all('SELECT * FROM words ORDER BY difficulty, year_group', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Could not load words' });
    res.json({ words: rows });
  });
});

module.exports = router;