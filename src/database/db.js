const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../tentacle_tenses.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Enable WAL mode for better concurrent performance
db.run('PRAGMA journal_mode=WAL');

// Create all tables
db.serialize(() => {

  // Users table — stores username + hashed PIN
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT    NOT NULL UNIQUE,
      pin_hash   TEXT    NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Words table — the verb database
  db.run(`
    CREATE TABLE IF NOT EXISTS words (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      base_form          TEXT    NOT NULL,
      past_simple        TEXT    NOT NULL,
      past_participle    TEXT    NOT NULL,
      present_participle TEXT    NOT NULL,
      difficulty         INTEGER NOT NULL DEFAULT 1,
      year_group         INTEGER NOT NULL DEFAULT 3
    )
  `);

  // Scores table — tracks session results per user
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id),
      mode         TEXT    NOT NULL CHECK(mode IN ('spelling', 'tenses')),
      difficulty   INTEGER NOT NULL,
      correct      INTEGER NOT NULL DEFAULT 0,
      incorrect    INTEGER NOT NULL DEFAULT 0,
      session_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Answer history — last 10 answers drive adaptive difficulty
  db.run(`
    CREATE TABLE IF NOT EXISTS answer_history (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id),
      word_id     INTEGER NOT NULL REFERENCES words(id),
      mode        TEXT    NOT NULL CHECK(mode IN ('spelling', 'tenses')),
      is_correct  INTEGER NOT NULL CHECK(is_correct IN (0, 1)),
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables ready');
});

module.exports = db;