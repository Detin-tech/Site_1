const Database = require('better-sqlite3');

const db = new Database('data.db');

db.prepare(
  'CREATE TABLE IF NOT EXISTS processed_events (id TEXT PRIMARY KEY)'
).run();

function recordEvent(id) {
  try {
    db.prepare('INSERT INTO processed_events (id) VALUES (?)').run(id);
    return true; // inserted
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      return false; // duplicate
    }
    throw err;
  }
}

module.exports = { recordEvent };
