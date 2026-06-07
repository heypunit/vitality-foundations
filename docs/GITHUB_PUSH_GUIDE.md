# Push Vitality Foundations to GitHub — Step by Step

Git is already installed on your system (`git version 2.54.0`). Follow these steps to push your code to GitHub.

---

## Step 1: Create a GitHub Account (If You Don't Have One)

1. Go to **https://github.com**
2. Click **"Sign up"**
3. Enter your email, create a password, choose a username
4. Verify your email (check inbox for GitHub confirmation)
5. Complete the setup wizard

> **Your GitHub username** is important — you'll need it in Step 4. Example: `punitgautam`

---

## Step 2: Create a New Repository on GitHub

1. Log in to GitHub
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name:** `vitality-foundations`
   - **Description:** `Personal training website for Vitality Foundations`
   - **Visibility:** `Public` (or Private — both are free)
   - **☐** Initialize with README (UNCHECK this — we already have one)
   - **☐** Add .gitignore (leave unchecked)
   - **☐** Choose a license (leave unchecked)
4. Click **"Create repository"**

You'll see a page with instructions. Copy the URL shown — it looks like:
```
https://github.com/YOUR_USERNAME/vitality-foundations.git
```

---

## Step 3: Configure Git (One-Time Setup)

Open **Git Bash** (or any terminal) and run these commands with YOUR info:

```bash
git config --global user.name "Your Name"
git config --global user.email "heypunitgautam@gmail.com"
```

Example:
```bash
git config --global user.name "Punit Gautam"
git config --global user.email "heypunitgautam@gmail.com"
```

---

## Step 4: Push Your Code

Open **Git Bash** and run these commands ONE BY ONE:

### 4.1 — Go to your project folder
```bash
cd "C:\Users\punit\Documents\kimi\workspace\vitality-foundations"
```

### 4.2 — Initialize Git
```bash
git init
```

You should see: `Initialized empty Git repository in ...`

### 4.3 — Add all files
```bash
git add .
```

### 4.4 — Commit your files
```bash
git commit -m "Initial commit - Vitality Foundations website"
```

You'll see a list of files being committed.

### 4.5 — Connect to GitHub
Replace `YOUR_USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/vitality-foundations.git
```

Example:
```bash
git remote add origin https://github.com/punitgautam/vitality-foundations.git
```

### 4.6 — Push to GitHub
```bash
git branch -M main
git push -u origin main
```

---

## Step 5: Enter Your GitHub Credentials

When you run `git push`, GitHub will ask for your credentials.

### Option A: HTTPS (Easiest for beginners)

You'll be prompted for:
- **Username:** Your GitHub username
- **Password:** NOT your GitHub password — use a **Personal Access Token**

**To create a Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Classic"**
3. Give it a name: `Vitality Foundations Deploy`
4. Check these scopes:
   - ☑ `repo` (full control of private repositories)
5. Click **"Generate token"**
6. **COPY the token immediately** (you can't see it again!)
7. Paste it as your password when Git asks

### Option B: GitHub CLI (Modern way)

```bash
gh auth login
```
Follow the prompts to authenticate.

---

## Step 6: Verify It Worked

1. Go to `https://github.com/YOUR_USERNAME/vitality-foundations`
2. You should see all your files listed:
   - `index.html`
   - `about.html`
   - `services.html`
   - `contact.html`
   - `style.css`
   - `script.js`
   - `images/`
   - `backend/`
   - `docs/`
   - `README.md`
   - `render.yaml`

**🎉 Your code is now on GitHub!**

---

## Common Errors & Fixes

### "fatal: not a git repository"
You forgot to run `git init`. Go back to Step 4.2.

### "fatal: Authentication failed"
- Make sure you're using a **Personal Access Token**, not your GitHub password
- Tokens expire — generate a new one if needed

### "fatal: remote origin already exists"
Run this first, then retry Step 4.5:
```bash
git remote remove origin
```

### "failed to push some refs"
Your repo might have a README from GitHub. Force push:
```bash
git push -u origin main --force
```

### "Could not resolve host: github.com"
Check your internet connection. Try again.

---

## Next Step: Deploy to Render

Now that your code is on GitHub, follow the Render deployment guide:

📖 `docs/RENDER_DEPLOY.md`

Or the quick version:
1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Static Site"**
4. Select your `vitality-foundations` repo
5. Click **"Create Static Site"**
6. Done! 🚀

---

## Quick Reference: All Commands in Order

```bash
cd "C:\Users\punit\Documents\kimi\workspace\vitality-foundations"
git init
git add .
git commit -m "Initial commit - Vitality Foundations website"
git remote add origin https://github.com/YOUR_USERNAME/vitality-foundations.git
git branch -M main
git push -u origin main
```

---

## Updating Your Site Later

Whenever you make changes and want to redeploy:

```bash
cd "C:\Users\punit\Documents\kimi\workspace\vitality-foundations"
git add .
git commit -m "Describe your changes here"
git push origin main
```

Render will automatically redeploy when you push! 🔄

---

**Need help?** Take a screenshot of any error message and share it.
