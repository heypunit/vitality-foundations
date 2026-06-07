# Vitality Foundations — Backend Setup Guide

This is the complete backend API for the **Vitality Foundations** personal training website. It handles contact form submissions, stores leads in a SQLite database, sends email notifications, and provides a protected admin dashboard.

---

## 📁 What's Included

| File | Purpose |
|------|---------|
| `server.js` | Main Express server with all API routes |
| `database.js` | SQLite database setup and prepared statements |
| `setup-db.js` | Standalone database initialization script |
| `admin.html` | Built-in admin dashboard (no build step needed) |
| `.env.example` | Environment variables template |
| `package.json` | Node.js dependencies and scripts |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js 18+** — [Download here](https://nodejs.org/)
- A code editor (VS Code recommended)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Server
PORT=3000
NODE_ENV=development

# Your website info
SITE_NAME=Vitality Foundations
SITE_URL=http://localhost:5500

# CORS — add your frontend URLs
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500

# Admin security — generate a strong key at https://randomkeygen.com/
ADMIN_API_KEY=vf_admin_2024_your_random_key_here

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
NOTIFY_EMAIL=your-email@gmail.com
```

> **Gmail App Password:** Go to [Google App Passwords](https://myaccount.google.com/apppasswords), generate one for "Mail", and use that instead of your regular password.

### Step 3: Initialize Database

```bash
npm run setup
```

### Step 4: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`.

### Step 5: Test Everything

1. **Health Check:** Open `http://localhost:3000/api/health`
2. **Admin Dashboard:** Open `http://localhost:3000/admin`
3. **Submit a test contact form** from your frontend

---

## 🔌 API Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/contact` | Submit contact form |
| `POST` | `/api/subscribe` | Newsletter subscription |
| `POST` | `/api/booking` | Consultation booking |
| `POST` | `/api/analytics/pageview` | Log page view |

### Admin Endpoints (API Key Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET` | `/api/admin/contacts` | All contact submissions |
| `PATCH` | `/api/admin/contacts/:id` | Update contact status |
| `DELETE` | `/api/admin/contacts/:id` | Delete contact |
| `GET` | `/api/admin/bookings` | All bookings |
| `GET` | `/api/admin/subscribers` | All subscribers |

**Admin Authentication:** Pass your `ADMIN_API_KEY` as either:
- Header: `X-API-Key: your-key`
- Query parameter: `?key=your-key`

---

## 📊 Admin Dashboard

Visit `http://localhost:3000/admin` and enter your `ADMIN_API_KEY` to access:

- **Overview:** Stats cards + recent contacts
- **Contacts:** Full contact list with status management
- **Bookings:** Consultation requests
- **Subscribers:** Newsletter signups
- **Analytics:** Page view statistics

---

## 📧 Email Configuration Options

### Option A: Gmail (Free, easiest for testing)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### Option B: SendGrid (Production recommended)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Option C: Other Providers
| Provider | Host | Port |
|----------|------|------|
| Mailgun | smtp.mailgun.org | 587 |
| AWS SES | email-smtp.your-region.amazonaws.com | 587 |
| Outlook | smtp-mail.outlook.com | 587 |

---

## 🌐 Deployment

### Free Option 1: Render (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → "New Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Add all variables from `.env`
5. Click "Create Web Service"
6. Copy the deployed URL (e.g., `https://vitality-api.onrender.com`)
7. Update `script.js` in your frontend:
   ```javascript
   const API_BASE = 'https://vitality-api.onrender.com';
   ```

### Free Option 2: Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → "New Project"
3. Deploy from GitHub repo
4. Add environment variables in Railway dashboard
5. Get your public URL and update frontend

### Free Option 3: Vercel (Serverless)

For Vercel, create a `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

> **Note:** SQLite is ephemeral on serverless platforms. For production serverless, consider migrating to PostgreSQL (free on Supabase or Neon).

---

## 🔗 Connecting Frontend to Backend

After deploying your backend, update the frontend `script.js`:

```javascript
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://your-deployed-backend-url.com';
```

Also update `ALLOWED_ORIGINS` in your backend `.env` to include your live frontend domain:
```env
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

---

## 🗄️ Database Schema

The SQLite database (`data/vitality.db`) contains these tables:

### `contact_submissions`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Client name |
| email | TEXT | Client email |
| phone | TEXT | Phone number |
| service | TEXT | Service interest |
| goals | TEXT | Goals/description |
| status | TEXT | new/contacted/converted/closed |
| notes | TEXT | Internal notes |
| created_at | DATETIME | Submission time |

### `subscribers`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| email | TEXT | Subscriber email (unique) |
| name | TEXT | Subscriber name |
| source | TEXT | Where they subscribed |
| is_active | INTEGER | 1 = active, 0 = unsubscribed |

### `bookings`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| name | TEXT | Client name |
| email | TEXT | Client email |
| preferred_date | TEXT | Preferred consultation date |
| preferred_time | TEXT | Preferred time |
| service | TEXT | Service type |
| status | TEXT | pending/confirmed/cancelled |

### `page_views`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| page | TEXT | Page path |
| referrer | TEXT | Referring URL |
| ip | TEXT | Visitor IP (hashed in production) |
| viewed_at | DATETIME | View timestamp |

---

## 🛡️ Security Features

- **Helmet.js** — Security headers
- **Rate Limiting** — 100 API requests / 15 min per IP
- **Form Rate Limiting** — 5 submissions / hour per IP
- **CORS** — Only allowed origins can access API
- **API Key Auth** — Admin endpoints protected
- **Input Validation** — Email format checking, required fields
- **SQL Injection Protection** — Parameterized queries via better-sqlite3

---

## 🐛 Troubleshooting

### "Cannot connect to server" error in frontend
- Make sure backend is running: `npm start`
- Check `API_BASE` in `script.js` matches your backend URL
- Verify CORS origins include your frontend URL

### Emails not sending
- Check SMTP credentials in `.env`
- For Gmail: Use App Password, not regular password
- Check server logs for specific error messages
- Forms still save to database even if email fails

### "Invalid API key" on admin dashboard
- Make sure `ADMIN_API_KEY` is set in `.env`
- Restart server after changing `.env`
- Check for extra spaces in the key

### Database locked error
- better-sqlite3 uses WAL mode which prevents most locking issues
- If it happens, stop the server and delete `data/vitality.db-shm` and `data/vitality.db-wal`

---

## 📦 Project Structure

```
workspace/
├── index.html          # Homepage
├── about.html          # Philosophy page
├── services.html       # Services page
├── contact.html        # Contact page
├── style.css           # Stylesheet
├── script.js           # Frontend JavaScript
├── hero-bg.png         # Hero background
└── backend/
    ├── server.js       # Express server
    ├── database.js     # SQLite database
    ├── admin.html      # Admin dashboard
    ├── setup-db.js     # DB init script
    ├── .env.example    # Env template
    └── package.json    # Dependencies
```

---

## 📝 Next Steps After Setup

1. ✅ Replace `YOUR_PHONE_NUMBER_HERE` in all HTML files with your real WhatsApp number
2. ✅ Update email addresses in contact.html
3. ✅ Add your actual trainer photo (replace placeholder)
4. ✅ Deploy backend to Render/Railway
5. ✅ Update `API_BASE` in `script.js` with deployed URL
6. ✅ Add your live domain to `ALLOWED_ORIGINS` in backend `.env`
7. ✅ Test contact form submission end-to-end
8. ✅ Access admin dashboard and verify data appears
9. ✅ Set up custom domain (optional)
10. ✅ Add Google Analytics or similar (optional)

---

## 💬 Support

If you run into issues:
1. Check the server logs — they show detailed error messages
2. Verify your `.env` file is correctly filled out
3. Make sure Node.js version is 18+
4. Check that port 3000 isn't already in use

---

**Built for Vitality Foundations** | © 2026
