const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Resolve path to SQLite file within the backend folder
const dbPath = path.resolve(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbPath, err => {
  if (err) console.error('Failed to open SQLite DB:', err);
  else console.log('SQLite DB connected at', dbPath);
});

function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      service TEXT,
      goals TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS pageviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      referrer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

function addContact(contact) {
  const { name, email, phone, service, goals } = contact;
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO contacts (name, email, phone, service, goals) VALUES (?,?,?,?,?)`,
      [name, email, phone, service, goals],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function addSubscriber(email) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO subscribers (email) VALUES (?)`,
      [email],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function addPageview(view) {
  const { page, referrer } = view;
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO pageviews (page, referrer) VALUES (?,?)`,
      [page, referrer],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function getContacts() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM contacts ORDER BY created_at DESC`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getSubscribers() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM subscribers ORDER BY created_at DESC`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  init,
  addContact,
  addSubscriber,
  addPageview,
  getContacts,
  getSubscribers,
};
