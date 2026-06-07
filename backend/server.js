require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const { init, addContact, addSubscriber, addPageview, getContacts, getSubscribers } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from the project root (one level up from /backend)
app.use(express.static(path.join(__dirname, '..')));

// Initialize DB
init();

// Email transporter (SendGrid)
const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

// Helper to send email
async function sendNotificationMail(contact) {
  const { name, email, phone, service, goals } = contact;
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: process.env.TO_EMAIL,
    subject: `New Contact from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
           <p><strong>Service:</strong> ${service}</p>
           <p><strong>Goals:</strong> ${goals}</p>`
  };
  await transporter.sendMail(mailOptions);
}

// --- API Routes ---
app.post('/api/contact', async (req, res) => {
  try {
    const contact = req.body;
    await addContact(contact);
    await sendNotificationMail(contact);
    res.json({ success: true, message: 'Contact saved and notification sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    await addSubscriber(email);
    res.json({ success: true, message: 'Subscribed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.post('/api/analytics/pageview', async (req, res) => {
  try {
    await addPageview(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Admin protected routes
function checkAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token && token === process.env.ADMIN_TOKEN) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

app.get('/api/admin/contacts', checkAdmin, async (req, res) => {
  try {
    const contacts = await getContacts();
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/subscribers', checkAdmin, async (req, res) => {
  try {
    const subs = await getSubscribers();
    res.json(subs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
