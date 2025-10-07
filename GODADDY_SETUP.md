# 🌐 GoDaddy Domain Setup Guide for stress.tw

## 📋 Quick Overview

Your domain: **stress.tw**  
Target: Deploy to Vercel and connect your GoDaddy domain

---

## 🚀 Step-by-Step Setup

### Part 1: Deploy to Vercel (15 minutes)

#### Option A: Deploy via GitHub (Recommended)

**Step 1: Push to GitHub**
```bash
cd /Users/apple/Desktop/Project/smallWins/StressResolve

# Initialize Git if not already done
git init
git add .
git commit -m "feat: English version with stress.tw domain"

# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/stress-tw.git
git branch -M main
git push -u origin main
```

**Step 2: Connect to Vercel**
1. Go to https://vercel.com/signup
2. Sign up/Login with GitHub account
3. Click **"Add New" → "Project"**
4. Select your `stress-tw` repository
5. Configure:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: *(leave empty)*
   - Output Directory: `./`
6. Click **"Deploy"**
7. Wait 1-2 minutes for deployment

You'll get a URL like: `https://stress-tw.vercel.app`

---

### Part 2: Configure GoDaddy DNS (10 minutes)

#### Step 1: Login to GoDaddy

1. Go to https://www.godaddy.com/
2. Login with your account
3. Click **"My Products"**
4. Find **stress.tw** and click **"DNS"** button

#### Step 2: Add DNS Records

You'll see a DNS management page. Follow these steps:

**Method A: Using Vercel's Recommended DNS (Easier)**

1. In Vercel project settings, go to **Domains** tab
2. Click **"Add Domain"**
3. Enter: `stress.tw`
4. Vercel will show you DNS records to add

Copy these records to GoDaddy:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 600 |
| CNAME | www | `cname.vercel-dns.com` | 600 |

**Step-by-step in GoDaddy:**

1. **For the root domain (stress.tw):**
   - Click **"Add"** button
   - Type: Select **"A"**
   - Name: Enter **"@"**
   - Value: Enter **"76.76.21.21"**
   - TTL: Select **"600 seconds"** (or "1 Hour")
   - Click **"Save"**

2. **For www subdomain (www.stress.tw):**
   - Click **"Add"** button again
   - Type: Select **"CNAME"**
   - Name: Enter **"www"**
   - Value: Enter **"cname.vercel-dns.com"**
   - TTL: Select **"600 seconds"**
   - Click **"Save"**

#### Step 3: Remove Conflicting Records (Important!)

GoDaddy might have default records that conflict. Look for:
- Any existing **A** records with Name **"@"**
- Any existing **CNAME** records with Name **"www"**

Delete these old records:
1. Find the record
2. Click the **pencil icon** or **trash icon**
3. Click **"Delete"** or **"Remove"**

#### Step 4: Verify in Vercel

1. Back to Vercel **Domains** tab
2. Wait 5-30 minutes for DNS propagation
3. Once verified, you'll see ✅ next to your domain
4. Vercel will automatically provision SSL certificate

---

### Part 3: Advanced Configuration (Optional)

#### Redirect www to non-www (or vice versa)

In Vercel project settings:
1. Go to **Domains** tab
2. Add both `stress.tw` and `www.stress.tw`
3. Click **"Edit"** on `www.stress.tw`
4. Select **"Redirect to stress.tw"**
5. Save

Now `www.stress.tw` automatically redirects to `stress.tw`

---

## 🔍 Troubleshooting

### Issue 1: Domain not resolving after 30 minutes

**Check DNS propagation:**
```bash
# On Mac/Linux terminal
dig stress.tw
dig www.stress.tw

# Should show:
# stress.tw → 76.76.21.21
# www.stress.tw → cname.vercel-dns.com
```

Or use online tool: https://dnschecker.org/
- Enter: `stress.tw`
- Check if DNS has propagated globally

**Solution:**
- Clear browser cache
- Try incognito/private mode
- Wait up to 48 hours (usually 1-6 hours)

---

### Issue 2: SSL Certificate Error

**Symptoms:** "Your connection is not private" warning

**Solution:**
- Wait 10-20 minutes after DNS is verified
- Vercel automatically provisions SSL via Let's Encrypt
- If stuck, go to Vercel **Domains** → click **"Refresh"**

---

### Issue 3: 404 Error on stress.tw

**Possible causes:**
1. Deployment failed - check Vercel **Deployments** tab
2. Wrong root directory - should be `./`
3. DNS not pointing correctly

**Solution:**
1. Check Vercel deployment status (should be green)
2. Visit your Vercel URL first: `https://stress-tw.vercel.app`
3. If that works, it's a DNS issue - wait longer

---

### Issue 4: GoDaddy shows "Domain is locked"

**Solution:**
1. In GoDaddy, go to **Domain Settings**
2. Find **"Domain Lock"** or **"Transfer Lock"**
3. Toggle it to **"Off"** (unlock)
4. Wait 5 minutes
5. Try adding DNS records again

---

## ✅ Verification Checklist

After setup, verify these:

- [ ] `https://stress.tw` loads successfully
- [ ] `https://www.stress.tw` redirects to `stress.tw` (or works)
- [ ] SSL certificate shows 🔒 (secure connection)
- [ ] No browser warnings
- [ ] Mobile responsive works
- [ ] All features work (balls, explosion, sound)

---

## 📊 DNS Record Reference

For your reference, here's what your final DNS should look like:

```
Type    Name    Value                   TTL     Purpose
------------------------------------------------------------
A       @       76.76.21.21             600     Main domain
CNAME   www     cname.vercel-dns.com    600     WWW subdomain
TXT     @       vercel-verify-xxx       600     Domain verification (auto-added)
```

---

## 🎯 Alternative: Using Vercel DNS (Advanced)

For maximum control and speed, you can transfer DNS management to Vercel:

### Step 1: Get Vercel Nameservers
1. In Vercel project → **Domains**
2. Click **"Transfer Domain"** or **"Use Vercel DNS"**
3. You'll get nameservers like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

### Step 2: Update GoDaddy Nameservers
1. In GoDaddy → **Domain Settings**
2. Find **"Nameservers"** section
3. Click **"Change"**
4. Select **"Custom"**
5. Enter Vercel's nameservers
6. Save

**Note:** This gives Vercel full DNS control. Only do this if you understand the implications.

---

## 🔐 Security Best Practices

After setup is complete:

1. **Enable Domain Lock** (in GoDaddy)
   - Prevents unauthorized transfers

2. **Enable 2FA** (Two-Factor Authentication)
   - Both GoDaddy and Vercel accounts

3. **Enable Privacy Protection** (in GoDaddy)
   - Hides your personal information from WHOIS

4. **Set up monitoring:**
   - Use Vercel's **Analytics** (free)
   - Set up Google Search Console (for SEO)

---

## 📞 Need Help?

### Vercel Support
- Documentation: https://vercel.com/docs/custom-domains
- Discord: https://vercel.com/discord
- Support: support@vercel.com

### GoDaddy Support
- Help Center: https://www.godaddy.com/help
- Phone: Available in your account dashboard
- Chat: Available 24/7

---

## 🎉 What's Next?

Once your domain is live:

1. ✅ Submit to Google Search Console
   - https://search.google.com/search-console

2. ✅ Set up Google Analytics
   - Uncomment GA code in `index.html`
   - Get tracking ID from https://analytics.google.com

3. ✅ Test SEO
   - Use https://pagespeed.web.dev/
   - Target: 90+ on all metrics

4. ✅ Share on social media
   - Your domain is now live and professional!

---

## 📝 Quick Command Reference

```bash
# Check if DNS is working
ping stress.tw

# Check DNS records
nslookup stress.tw

# More detailed DNS check
dig stress.tw ANY

# Test HTTPS
curl -I https://stress.tw

# Force browser to reload (Mac)
Cmd + Shift + R

# Force browser to reload (Windows)
Ctrl + Shift + R
```

---

## 💡 Pro Tips

1. **Bookmark your Vercel dashboard**
   - Quick access to deployments and logs

2. **Set up deployment notifications**
   - Vercel can notify you on Slack/Discord

3. **Use Vercel CLI for quick deploys**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

4. **Monitor uptime**
   - Use https://uptimerobot.com/ (free)
   - Get alerts if site goes down

5. **Taiwan-specific considerations**
   - Your `.tw` domain targets Taiwanese audience
   - Consider adding Traditional Chinese version later
   - Submit to Yahoo Taiwan (popular in TW)

---

## 🌏 Taiwan Domain Special Notes

### About .tw domains

- **.tw** is Taiwan's country code top-level domain (ccTLD)
- Managed by TWNIC (Taiwan Network Information Center)
- Great for targeting Taiwanese market
- Recognized and trusted in Asia-Pacific region

### SEO Advantages for Taiwan

1. **Geographic Targeting**
   - Google automatically associates .tw with Taiwan
   - Better rankings for Taiwan-based searches

2. **Local Trust**
   - Taiwan users trust .tw domains more
   - Professional appearance

3. **Marketing Strategy**
   - Brand name "stress.tw" is catchy and memorable
   - Short, easy to type
   - Domain hack: "stress" + ".tw" (Taiwan)

---

**Setup Complete! Your site will be live at https://stress.tw within 24 hours (usually much faster).** 🚀

**Last Updated:** October 6, 2025  
**Domain:** stress.tw  
**Platform:** Vercel + GoDaddy


