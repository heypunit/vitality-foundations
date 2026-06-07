# Deploy Vitality Foundations on Render (Free)

Render offers **free hosting** for both static sites and full-stack apps. This guide covers both options.

---

## Option A: Static Site Only (Easiest — 5 Minutes)

Use this if you're using **Formspree** for forms. Your HTML/CSS/JS files are served directly.

### Step 1: Push to GitHub

1. Go to [github.com](https://github.com) and create a new repository
2. Name it: `vitality-foundations`
3. Make it **Public** (free) or **Private** (also free now)
4. Don't initialize with README (we already have one)

### Step 2: Upload Your Files

Open Git Bash in your project folder:

```bash
cd "C:\Users\punit\Documents\kimi\workspace\vitality-foundations"

git init
git add .
git commit -m "Initial commit - Vitality Foundations website"

git remote add origin https://github.com/YOUR_USERNAME/vitality-foundations.git
git branch -M main
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with **GitHub** (fastest) or email
3. Authorize Render to access your GitHub repos

### Step 4: Deploy Static Site

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your `vitality-foundations` GitHub repository
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `vitality-foundations` |
   | **Branch** | `main` |
   | **Root Directory** | *(leave empty — repo root)* |
   | **Build Command** | *(leave empty)* |
   | **Publish Directory** | *(leave empty)* |
4. Click **"Create Static Site"**

Render will deploy in ~1 minute. You'll get a URL like:
```
https://vitality-foundations.onrender.com
```

### Step 5: Update Formspree (If Using)

If your form uses Formspree, add your Render domain to Formspree's allowed origins:

1. Go to [formspree.io](https://formspree.io) → your form → **Settings**
2. Under **"Allowed Origins"**, add:
   ```
   https://vitality-foundations.onrender.com
   ```
3. Save

---

## Option B: Full Stack (Frontend + Backend)

Use this if you want the **custom backend** with admin dashboard, database, and email notifications.

### Step 1: Prepare Your Repo

Make sure your repo has this structure at the root:

```
vitality-foundations/
├── index.html
├── about.html
├── services.html
├── contact.html
├── style.css
├── script.js
├── images/
│   └── hero-bg.png
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── admin.html
│   ├── package.json
│   ├── .env.example
│   └── setup-db.js
└── README.md
```

### Step 2: Create `render.yaml` (Blueprint)

Create this file in your repo root for one-click deployment:

```yaml
# render.yaml — Render Blueprint for Vitality Foundations
services:
  - type: web
    name: vitality-foundations-api
    runtime: node
    plan: free
    region: oregon
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: SITE_NAME
        value: Vitality Foundations
      - key: SITE_URL
        value: https://vitality-foundations.onrender.com
      - key: ALLOWED_ORIGINS
        value: https://vitality-foundations.onrender.com,https://vitality-foundations-api.onrender.com
      - key: ADMIN_API_KEY
        generateValue: true
      - key: SMTP_HOST
        value: smtp.gmail.com
      - key: SMTP_PORT
        value: 587
      - key: SMTP_USER
        sync: false
      - key: SMTP_PASS
        sync: false
      - key: NOTIFY_EMAIL
        sync: false
```

> **Note:** `sync: false` means you'll manually enter these in the Render dashboard after deployment (for security).

### Step 3: Push to GitHub

```bash
cd "C:\Users\punit\Documents\kimi\workspace\vitality-foundations"

git add .
git commit -m "Add render.yaml for deployment"
git push origin main
```

### Step 4: Deploy on Render

1. Go to [render.com](https://render.com) → **"Blueprints"** → **"New Blueprint Instance"**
2. Connect your GitHub repo
3. Render will read `render.yaml` and create your service automatically
4. Or manually: **"New +"** → **"Web Service"** → select your repo

### Step 5: Configure Environment Variables

After deployment, go to your service → **"Environment"** tab and add:

| Key | Value | Example |
|-----|-------|---------|
| `SMTP_USER` | Your Gmail address | `heypunitgautam@gmail.com` |
| `SMTP_PASS` | Gmail App Password | `abcd efgh ijkl mnop` |
| `NOTIFY_EMAIL` | Where to receive notifications | `heypunitgautam@gmail.com` |
| `ADMIN_API_KEY` | Random string for dashboard | `vf_admin_2024_xyz123` |

> **Gmail App Password:** Generate at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### Step 6: Update Frontend API URL

In `script.js`, change:

```javascript
const API_BASE = 'https://vitality-foundations-api.onrender.com';
```

(Use your actual Render service URL)

Push the change:
```bash
git add script.js
git commit -m "Update API base URL for production"
git push origin main
```

Render will auto-redeploy.

---

## Option C: Static Site + Separate Backend (Recommended)

Best of both worlds — fast static site + powerful backend.

### Deploy Frontend (Static Site)

Same as **Option A** above. Your HTML/CSS/JS files on Render Static.

### Deploy Backend (Web Service)

1. **"New +"** → **"Web Service"**
2. Select same repo
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `vitality-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Plan** | `Free` |
4. Add environment variables (see Step 5 above)
5. Copy the backend URL (e.g., `https://vitality-api.onrender.com`)

### Connect Them

Update `script.js`:
```javascript
const API_BASE = 'https://vitality-api.onrender.com';
```

Also add the static site URL to backend `ALLOWED_ORIGINS`:
```
https://vitality-foundations.onrender.com
```

---

## Custom Domain (Optional)

1. Buy a domain (Namecheap, GoDaddy, Google Domains)
2. In Render dashboard → your service → **"Settings"** → **"Custom Domains"**
3. Add your domain (e.g., `vitalityfoundations.com`)
4. Render gives you DNS records to add at your domain registrar
5. Wait ~24 hours for DNS propagation

---

## Troubleshooting

### "Build failed" error
- Check that `package.json` exists in `backend/` folder
- Verify `npm install` works locally first

### "Cannot connect to backend" in frontend
- Check CORS: `ALLOWED_ORIGINS` must include your frontend URL
- Verify `API_BASE` in `script.js` matches your backend URL
- Check browser console (F12) for exact error

### Emails not sending
- Verify `SMTP_USER` and `SMTP_PASS` are correct
- For Gmail: must use App Password, not regular password
- Check Render logs for email errors

### Admin dashboard not loading
- Make sure you're using the correct `ADMIN_API_KEY`
- Check that `admin.html` is in the `backend/` folder
- Verify the backend URL + `/admin` works

### Site loads but forms don't work
- If using Formspree: check that `YOUR_FORMSPREE_FORM_ID` is replaced
- If using backend: check that `API_BASE` points to live backend
- Open browser console (F12) and check for errors

---

## Free Tier Limits on Render

| Feature | Free Plan |
|---------|-----------|
| Static sites | Unlimited, always free |
| Web services | 1 free instance (sleeps after 15 min idle) |
| Bandwidth | 100 GB/month |
| Build minutes | 500/month |
| Custom domains | ✅ Yes |
| SSL/HTTPS | ✅ Auto-generated |

> **Note:** Free web services "sleep" after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up. Upgrade to paid ($7/month) for always-on.

---

## Quick Commands Reference

```bash
# Navigate to project
cd "C:\Users\punit\Documents\kimi\workspace\vitality-foundations"

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/vitality-foundations.git
git branch -M main
git push -u origin main

# Update and redeploy
git add .
git commit -m "Update for deployment"
git push origin main
# Render auto-deploys on every push!
```

---

## Next Steps After Deployment

1. ✅ Test the live site: open your Render URL in browser
2. ✅ Submit a test contact form
3. ✅ Check your email for the notification
4. ✅ Access admin dashboard (if using backend): `your-backend-url/admin`
5. ✅ Share your live website link!
6. ⬜ Add Google Analytics (optional)
7. ⬜ Set up custom domain (optional)
8. ⬜ Submit site to Google Search Console for SEO

---

**Your site will be live at:** `https://vitality-foundations.onrender.com` 🚀
