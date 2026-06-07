# Formspree Setup Guide for Vitality Foundations

## What is Formspree?
Formspree is a **free form backend service**. Instead of building and hosting your own server, Formspree handles form submissions, spam protection, and email delivery for you.

**Best for:** Quick setup, no server maintenance, free tier includes 50 submissions/month.

---

## Step-by-Step Setup

### Step 1: Sign Up
1. Go to **https://formspree.io**
2. Click **"Get Started"** or **"Sign Up"
3. Sign up with your email: **heypunitgautam@gmail.com** (or create account with Google)
4. Verify your email address

### Step 2: Create a New Form
1. In your Formspree dashboard, click **"New Form"**
2. Give it a name: `Vitality Foundations - Contact Form`
3. Click **Create**
4. You'll get a unique form endpoint like:
   ```
   https://formspree.io/f/xrgjwbzy
   ```
   (The `xrgjwbzy` part is your Form ID — it's random and unique)

### Step 3: Update Your Website
1. Open these files in a text editor:
   - `index.html`
   - `contact.html`

2. Find this line in BOTH files:
   ```html
   action="https://formspree.io/f/YOUR_FORMSPREE_FORM_ID"
   ```

3. Replace `YOUR_FORMSPREE_FORM_ID` with your actual Form ID:
   ```html
   action="https://formspree.io/f/xrgjwbzy"
   ```
   (Use YOUR actual ID, not this example!)

4. Save both files.

### Step 4: Test It
1. Open `index.html` in your browser
2. Fill out the contact form
3. Click **"Request Consultation"**
4. You should see a ✅ success toast message
5. Check your email (heypunitgautam@gmail.com) — you should receive the submission!

---

## What Happens When Someone Submits?

1. **User fills form** → clicks submit
2. **Formspree receives** the data (with spam filtering)
3. **You get an email** at heypunitgautam@gmail.com with all the details
4. **User sees** a success message on your website (no page reload)
5. **Formspree dashboard** stores the submission history

---

## Formspree Hidden Fields Explained

These are already added to your forms:

| Field | Purpose |
|-------|---------|
| `_subject` | Custom email subject line |
| `_replyto` | Lets you reply directly to the submitter |
| `_template` | `table` = sends data in a nice table format |
| `_gotcha` | Honeypot field — catches spam bots |

---

## Formspree Free Tier Limits

| Feature | Free Plan |
|---------|-----------|
| Submissions/month | 50 |
| Forms | Unlimited |
| Email notifications | ✅ Yes |
| Spam protection | ✅ Yes |
| Auto-responses | ❌ Paid only |
| File uploads | ❌ Paid only |
| Custom redirect | ✅ Yes (with `_next` field) |

If you need more than 50 submissions/month, upgrade to Gold ($8/month) or keep using the custom backend we built.

---

## Optional: Add a Thank-You Redirect

If you want users to land on a specific page after submitting, add this hidden field:

```html
<input type="hidden" name="_next" value="https://your-domain.com/thanks.html">
```

Create a simple `thanks.html` page:
```html
<!DOCTYPE html>
<html>
<head><title>Thank You | Vitality Foundations</title></head>
<body style="font-family:Arial; text-align:center; padding:100px;">
    <h1>🎉 Thank You!</h1>
    <p>Your submission has been received. We'll contact you within 24 hours.</p>
    <a href="index.html">← Back to Home</a>
</body>
</html>
```

---

## Optional: Enable Auto-Response (Paid)

Formspree's paid plan lets you send automatic replies to users. If you want this for free, use the **custom backend** we built instead — it already has auto-reply built in.

---

## Troubleshooting

### "Form not found" error
- Double-check your Form ID is correct
- Make sure the form is created in your Formspree dashboard
- The form ID is case-sensitive

### Not receiving emails
- Check your spam/junk folder
- Verify your email address in Formspree settings
- Add `noreply@formspree.io` to your contacts

### "Too many requests" error
- Formspree rate-limits submissions (normal for spam protection)
- Wait a few minutes between test submissions

### Form submits but no toast appears
- Open browser console (F12 → Console) and check for JavaScript errors
- Make sure `script.js` is loading correctly

---

## Comparison: Formspree vs Custom Backend

| Feature | Formspree | Custom Backend |
|---------|-----------|----------------|
| Setup time | 5 minutes | 30 minutes |
| Monthly cost | Free (50 subs) | Free (hosting required) |
| Admin dashboard | Basic | Full-featured |
| Auto-reply emails | Paid only | Free |
| Data ownership | Formspree hosts | You own everything |
| Custom branding | Limited | Full control |
| Scalability | Easy | Requires maintenance |

**Recommendation:** Start with Formspree for quick launch. Switch to the custom backend later if you need more control or volume.

---

## Quick Checklist

- [ ] Signed up at formspree.io with heypunitgautam@gmail.com
- [ ] Created a new form
- [ ] Copied the Form ID (the part after `/f/`)
- [ ] Replaced `YOUR_FORMSPREE_FORM_ID` in `index.html`
- [ ] Replaced `YOUR_FORMSPREE_FORM_ID` in `contact.html`
- [ ] Tested the form submission
- [ ] Received the email notification
- [ ] Checked spam folder just in case

---

**Questions?** Formspree docs: https://help.formspree.io
