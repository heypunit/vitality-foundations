const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'vitality.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
function initDatabase() {
    // Contact form submissions
    db.exec(`
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            service TEXT,
            goals TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Newsletter subscribers
    db.exec(`
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            name TEXT,
            source TEXT DEFAULT 'website',
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    `);

    // Consultation bookings
    db.exec(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            preferred_date TEXT,
            preferred_time TEXT,
            service TEXT,
            message TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Site analytics (simple page views)
    db.exec(`
        CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            page TEXT NOT NULL,
            referrer TEXT,
            user_agent TEXT,
            ip TEXT,
            viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Database initialized successfully');
    console.log(`📁 Database location: ${DB_PATH}`);
}

// Prepared statements for common operations
const statements = {
    insertContact: db.prepare(`
        INSERT INTO contact_submissions (name, email, phone, service, goals)
        VALUES (@name, @email, @phone, @service, @goals)
    `),
    
    getAllContacts: db.prepare(`
        SELECT * FROM contact_submissions ORDER BY created_at DESC
    `),
    
    getContactById: db.prepare(`
        SELECT * FROM contact_submissions WHERE id = @id
    `),
    
    updateContactStatus: db.prepare(`
        UPDATE contact_submissions 
        SET status = @status, notes = @notes, updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `),
    
    deleteContact: db.prepare(`
        DELETE FROM contact_submissions WHERE id = @id
    `),
    
    getContactStats: db.prepare(`
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
            COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_count,
            COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_count,
            COUNT(CASE WHEN date(created_at) = date('now') THEN 1 END) as today_count
        FROM contact_submissions
    `),
    
    insertSubscriber: db.prepare(`
        INSERT OR IGNORE INTO subscribers (email, name, source)
        VALUES (@email, @name, @source)
    `),
    
    getAllSubscribers: db.prepare(`
        SELECT * FROM subscribers ORDER BY subscribed_at DESC
    `),
    
    insertBooking: db.prepare(`
        INSERT INTO bookings (name, email, phone, preferred_date, preferred_time, service, message)
        VALUES (@name, @email, @phone, @preferred_date, @preferred_time, @service, @message)
    `),
    
    getAllBookings: db.prepare(`
        SELECT * FROM bookings ORDER BY created_at DESC
    `),
    
    logPageView: db.prepare(`
        INSERT INTO page_views (page, referrer, user_agent, ip)
        VALUES (@page, @referrer, @user_agent, @ip)
    `),
    
    getPageViewStats: db.prepare(`
        SELECT page, COUNT(*) as views 
        FROM page_views 
        WHERE viewed_at >= date('now', '-7 days')
        GROUP BY page 
        ORDER BY views DESC
    `)
};

module.exports = {
    db,
    initDatabase,
    statements
};
