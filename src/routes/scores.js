const express = require('express');
const db = require('../database/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/scores/answer
router.post('/answer', requireAuth, (req, res) => {
  const { wordId, mode, isCorrect } = req.body;
  const userId = req.userId;

  if (!wordId || !mode || isCorrect === undefined) {
    return res.status(400).json({ error: 'wordId, mode, and isCorrect are required' });
  }

  const correct = isCorrect ? 1 : 0;

  db.run(
    'INSERT INTO answer_history (user_id, word_id, mode, is_correct) VALUES (?, ?, ?, ?)',
    [userId, wordId, mode, correct],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not save answer' });

      db.all(
        `SELECT is_correct FROM answer_history
         WHERE user_id = ? AND mode = ?
         ORDER BY answered_at DESC
         LIMIT 10`,
        [userId, mode],
        (err, rows) => {
          if (err) return res.status(500).json({ error: 'Could not compute difficulty' });

          const total = rows.length;
          const correctCount = rows.filter(r => r.is_correct === 1).length;
          const accuracy = total > 0 ? correctCount / total : 0.5;

          let recommendation = 'maintain';
          if (total >= 5) {
            if (accuracy > 0.9) recommendation = 'increase';
            if (accuracy < 0.4) recommendation = 'decrease';
          }

          res.json({ saved: true, accuracy: Math.round(accuracy * 100), totalAnswered: total, recommendation });
        }
      );
    }
  );
});

// POST /api/scores/session
router.post('/session', requireAuth, (req, res) => {
  const { mode, difficulty, correct, incorrect } = req.body;
  const userId = req.userId;

  if (!mode || difficulty === undefined || correct === undefined || incorrect === undefined) {
    return res.status(400).json({ error: 'mode, difficulty, correct, and incorrect are required' });
  }

  db.run(
    'INSERT INTO scores (user_id, mode, difficulty, correct, incorrect) VALUES (?, ?, ?, ?, ?)',
    [userId, mode, difficulty, correct, incorrect],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not save session' });
      res.status(201).json({ saved: true, sessionId: this.lastID });
    }
  );
});

// GET /api/scores/history
router.get('/history', requireAuth, (req, res) => {
  const userId = req.userId;
  db.all(
    `SELECT id, mode, difficulty, correct, incorrect, session_date
     FROM scores WHERE user_id = ?
     ORDER BY session_date DESC LIMIT 20`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not load history' });
      res.json({ sessions: rows });
    }
  );
});

// GET /api/scores/stats
router.get('/stats', requireAuth, (req, res) => {
  const userId = req.userId;
  db.get(
    `SELECT COUNT(*) as totalSessions, SUM(correct) as totalCorrect,
     SUM(incorrect) as totalIncorrect,
     ROUND(CAST(SUM(correct) AS FLOAT) / NULLIF(SUM(correct) + SUM(incorrect), 0) * 100, 1) as overallAccuracy
     FROM scores WHERE user_id = ?`,
    [userId],
    (err, stats) => {
      if (err) return res.status(500).json({ error: 'Could not load stats' });
      res.json({ stats });
    }
  );
});

// GET /api/scores/leaderboard
router.get('/leaderboard', requireAuth, (req, res) => {
  db.all(
    `SELECT u.username, MAX(s.correct) as topScore, s.mode, s.difficulty
     FROM scores s
     JOIN users u ON u.id = s.user_id
     GROUP BY s.user_id, s.mode
     ORDER BY topScore DESC
     LIMIT 10`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Could not load leaderboard' });
      res.json({ leaderboard: rows });
    }
  );
});

module.exports = router;