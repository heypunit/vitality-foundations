require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const nodemailer = require('nodemailer');
const { initDatabase, statements } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database
initDatabase();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow admin dashboard inline styles
    crossOriginEmbedderPolicy: false
}));

// CORS - allow your frontend domain
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const formLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 form submissions per hour
    message: { success: false, message: 'Too many submissions. Please try again in an hour.' }
});

app.use('/api/', apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify email connection on startup
if (process.env.SMTP_USER) {
    transporter.verify((error, success) => {
        if (error) {
            console.log('⚠️  Email configuration error:', error.message);
            console.log('   Forms will still be saved to database, but emails won\'t be sent.');
        } else {
            console.log('✅ Email server ready');
        }
    });
}

// Helper: Send notification email
async function sendNotificationEmail(data, type = 'contact') {
    if (!process.env.SMTP_USER || !process.env.NOTIFY_EMAIL) return;

    const adminEmail = process.env.NOTIFY_EMAIL;
    const siteName = process.env.SITE_NAME || 'Vitality Foundations';

    let subject, html;

    if (type === 'contact') {
        subject = `🔔 New Contact Form Submission - ${data.name}`;
        html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2C4C3B;">New Contact Form Submission</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone || 'Not provided'}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.service || 'Not selected'}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Goals:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.goals}</td></tr>
                </table>
                <p style="margin-top: 20px; color: #666;">
                    <a href="${process.env.ADMIN_URL || `http://localhost:${PORT}/admin`}" style="background: #2C4C3B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Admin Dashboard</a>
                </p>
            </div>
        `;
    } else if (type === 'booking') {
        subject = `📅 New Consultation Booking - ${data.name}`;
        html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2C4C3B;">New Consultation Booking</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone || 'Not provided'}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Date:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.preferred_date || 'Not specified'}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Preferred Time:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.preferred_time || 'Not specified'}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.service || 'Not selected'}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Message:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.message || 'No message'}</td></tr>
                </table>
            </div>
        `;
    }

    try {
        await transporter.sendMail({
            from: `"${siteName}" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject,
            html
        });
        console.log('📧 Notification email sent');
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
    }
}

// Helper: Send auto-reply to user
async function sendAutoReply(userEmail, userName) {
    if (!process.env.SMTP_USER) return;

    const siteName = process.env.SITE_NAME || 'Vitality Foundations';

    try {
        await transporter.sendMail({
            from: `"${siteName}" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `Thank you for contacting ${siteName}!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1D231F;">
                    <div style="background: #2C4C3B; padding: 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">${siteName}</h1>
                    </div>
                    <div style="padding: 30px; background: #F9F8F4;">
                        <h2 style="color: #2C4C3B;">Hi ${userName},</h2>
                        <p>Thank you for reaching out! We've received your inquiry and will get back to you within <strong>24 hours</strong>.</p>
                        <p>In the meantime, feel free to:</p>
                        <ul style="line-height: 2;">
                            <li>Check out our <a href="${process.env.SITE_URL || '#'}" style="color: #2C4C3B;">services page</a> for more details</li>
                            <li>Follow us on social media for fitness tips</li>
                            <li>WhatsApp us for quick questions</li>
                        </ul>
                        <div style="background: #FFFFFF; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #2C4C3B;">
                            <p style="margin: 0; font-style: italic; color: #5C6660;">"Train Smart. Stay Consistent. Get Results."</p>
                        </div>
                        <p>Best regards,<br><strong>Shashikant</strong><br>Certified Personal Trainer</p>
                    </div>
                    <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
                        <p>© 2026 ${siteName}. All rights reserved.</p>
                    </div>
                </div>
            `
        });
        console.log('📧 Auto-reply sent to', userEmail);
    } catch (error) {
        console.error('❌ Failed to send auto-reply:', error.message);
    }
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: NODE_ENV 
    });
});

// Contact form submission
app.post('/api/contact', formLimiter, (req, res) => {
    try {
        const { name, email, phone, service, goals } = req.body;

        // Validation
        if (!name || !email || !goals) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, and goals are required.' 
            });
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address.' 
            });
        }

        // Save to database
        const result = statements.insertContact.run({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            service: service || null,
            goals: goals.trim()
        });

        // Send notifications (non-blocking)
        sendNotificationEmail({ name, email, phone, service, goals }, 'contact');
        sendAutoReply(email, name);

        res.status(201).json({
            success: true,
            message: 'Thank you! Your inquiry has been received. We will contact you within 24 hours.',
            id: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Please try again later.' 
        });
    }
});

// Newsletter subscription
app.post('/api/subscribe', formLimiter, (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required.' 
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email address.' 
            });
        }

        const result = statements.insertSubscriber.run({
            email: email.trim().toLowerCase(),
            name: name ? name.trim() : null,
            source: 'website'
        });

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to our newsletter!',
            id: result.lastInsertRowid
        });

    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ 
                success: false, 
                message: 'You are already subscribed!' 
            });
        }
        console.error('Subscribe error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Please try again.' 
        });
    }
});

// Consultation booking
app.post('/api/booking', formLimiter, (req, res) => {
    try {
        const { name, email, phone, preferred_date, preferred_time, service, message } = req.body;

        if (!name || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name and email are required.' 
            });
        }

        const result = statements.insertBooking.run({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            preferred_date: preferred_date || null,
            preferred_time: preferred_time || null,
            service: service || null,
            message: message ? message.trim() : null
        });

        sendNotificationEmail({ name, email, phone, preferred_date, preferred_time, service, message }, 'booking');
        sendAutoReply(email, name);

        res.status(201).json({
            success: true,
            message: 'Your consultation request has been received! We will confirm your appointment soon.',
            id: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Please try again later.' 
        });
    }
});

// Log page view (for analytics)
app.post('/api/analytics/pageview', (req, res) => {
    try {
        const { page, referrer } = req.body;
        const userAgent = req.headers['user-agent'];
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        statements.logPageView.run({
            page: page || 'unknown',
            referrer: referrer || null,
            user_agent: userAgent || null,
            ip: ip || null
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }
});

// ==================== ADMIN API (Protected) ====================

// Simple API key authentication middleware
const adminAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.key;
    const validKey = process.env.ADMIN_API_KEY;

    if (!validKey) {
        return res.status(500).json({ 
            success: false, 
            message: 'Admin API key not configured on server.' 
        });
    }

    if (apiKey !== validKey) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized. Invalid API key.' 
        });
    }

    next();
};

// Get all contact submissions
app.get('/api/admin/contacts', adminAuth, (req, res) => {
    try {
        const contacts = statements.getAllContacts.all();
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update contact status
app.patch('/api/admin/contacts/:id', adminAuth, (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        statements.updateContactStatus.run({ id: parseInt(id), status, notes });
        res.json({ success: true, message: 'Contact updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete contact
app.delete('/api/admin/contacts/:id', adminAuth, (req, res) => {
    try {
        const { id } = req.params;
        statements.deleteContact.run({ id: parseInt(id) });
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get dashboard stats
app.get('/api/admin/stats', adminAuth, (req, res) => {
    try {
        const contactStats = statements.getContactStats.get();
        const subscribers = statements.getAllSubscribers.all();
        const bookings = statements.getAllBookings.all();
        const pageViews = statements.getPageViewStats.all();

        res.json({
            success: true,
            data: {
                contacts: contactStats,
                subscribers: {
                    total: subscribers.length,
                    active: subscribers.filter(s => s.is_active).length
                },
                bookings: {
                    total: bookings.length,
                    pending: bookings.filter(b => b.status === 'pending').length
                },
                pageViews
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all bookings
app.get('/api/admin/bookings', adminAuth, (req, res) => {
    try {
        const bookings = statements.getAllBookings.all();
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all subscribers
app.get('/api/admin/subscribers', adminAuth, (req, res) => {
    try {
        const subscribers = statements.getAllSubscribers.all();
        res.json({ success: true, data: subscribers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== ADMIN DASHBOARD ====================

// Serve admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static admin assets
app.use('/admin-assets', express.static(path.join(__dirname, 'admin-assets')));

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`\n🚀 Vitality Foundations Backend Server`);
    console.log(`=====================================`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🔑 API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=====================================\n`);
});

module.exports = app;
