# 🚀 Adding Environment Variables to Vercel

## Required Environment Variables

You need to add these 6 environment variables to your Vercel project:

### 1. Supabase Variables (Already Configured)
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### 2. AWS S3 Variables (MISSING - Causing 500 Error)
```
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
```

---

## Step-by-Step: Add Variables to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to your Vercel project**:
   - Visit: https://vercel.com/
   - Select your project: `aura-and-co`

2. **Navigate to Settings**:
   - Click on "Settings" tab at the top
   - Click "Environment Variables" in the left sidebar

3. **Add each variable** (one at a time):

   **Variable 1:**
   - Name: `SUPABASE_URL`
   - Value: `https://fcrhqoiobfkggehbkukh.supabase.co`
   - Environment: Select all (Production, Preview, Development)
   - Click "Save"

   **Variable 2:**
   - Name: `SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjcmhxb2lvYmZrZ2dlaGJrdWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTE3MTAsImV4cCI6MjA3MTYyNzcxMH0.8kQxN2zVQV_KqZ5s5yPQqgX5N_vN9Z6WjPxGkR3Y8HA`
   - Environment: Select all
   - Click "Save"

   **Variable 3:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjcmhxb2lvYmZrZ2dlaGJrdWtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA1MTcxMCwiZXhwIjoyMDcxNjI3NzEwfQ.3PbXLVGXqSPsDHvQogKZUiK20KLGdM94Kx4kBr0Mum4`
   - Environment: Select all
   - Click "Save"

   **Variable 4:**
   - Name: `AWS_REGION`
   - Value: `us-east-1`
   - Environment: Select all
   - Click "Save"

   **Variable 5:** ⚠️ YOU NEED TO GET THIS FROM AWS
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: `YOUR_AWS_ACCESS_KEY_ID` (get from AWS IAM Console)
   - Environment: Select all
   - Click "Save"

   **Variable 6:** ⚠️ YOU NEED TO GET THIS FROM AWS
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: `YOUR_AWS_SECRET_ACCESS_KEY` (get from AWS IAM Console)
   - Environment: Select all
   - Click "Save"

   **Variable 7:** (Optional - defaults to 'aurascoimages' if not set)
   - Name: `AWS_S3_BUCKET`
   - Value: `aurascoimages`
   - Environment: Select all
   - Click "Save"

4. **Redeploy your application**:
   - Go to "Deployments" tab
   - Click on the three dots (...) next to your latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

---

### Method 2: Via Vercel CLI (Fast!)

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project (run in project directory)
cd /Users/dan/aura-and-co
vercel link

# Add environment variables
vercel env add SUPABASE_URL production
# Paste: https://fcrhqoiobfkggehbkukh.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Paste your key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your key

vercel env add AWS_REGION production
# Type: us-east-1

vercel env add AWS_ACCESS_KEY_ID production
# Paste your AWS access key

vercel env add AWS_SECRET_ACCESS_KEY production
# Paste your AWS secret key

vercel env add AWS_S3_BUCKET production
# Type: aurascoimages

# Repeat for preview and development if needed
# Then redeploy
vercel --prod
```

---

## 🔑 Getting AWS Credentials

**You need to get these from AWS Console:**

1. Go to: https://console.aws.amazon.com/iam/
2. Click "Users" → Select your user (or create one)
3. Click "Security credentials" tab
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Click "Create"
7. **COPY BOTH VALUES** (Secret key shown only once!)
8. Add them to Vercel as shown above

**See `AWS_S3_SETUP.md` for detailed AWS setup instructions.**

---

## ✅ Verification

After adding all variables and redeploying:

1. Go to your Vercel deployment URL
2. Navigate to `/admin.html`
3. Login to admin portal
4. Try to add a product with an image upload
5. Should see "✓ Image Uploaded" instead of 500 error

---

## 🎯 Quick Checklist

- [ ] Added `SUPABASE_URL` to Vercel
- [ ] Added `SUPABASE_ANON_KEY` to Vercel
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Added `AWS_REGION` to Vercel
- [ ] Got AWS Access Key from AWS Console
- [ ] Added `AWS_ACCESS_KEY_ID` to Vercel
- [ ] Got AWS Secret Key from AWS Console
- [ ] Added `AWS_SECRET_ACCESS_KEY` to Vercel
- [ ] Added `AWS_S3_BUCKET` to Vercel (optional)
- [ ] Redeployed the application
- [ ] Tested image upload

---

## 📱 Screenshot Guide

When in Vercel Settings → Environment Variables:

1. You'll see a form with:
   - **Name**: Enter variable name (e.g., `AWS_REGION`)
   - **Value**: Enter/paste the value
   - **Environment**: Check boxes for Production, Preview, Development
   - **Save button**: Click to save

2. Repeat for each variable

3. After all variables are added, you'll see them listed (values are hidden)

---

## 🐛 Troubleshooting

**Error: "AWS credentials not configured"**
- Make sure you added `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Check spelling is exact (case-sensitive)
- Redeploy after adding variables

**Variables not taking effect**
- Always redeploy after adding/changing variables
- Clear browser cache and try again
- Check Vercel deployment logs for errors

**Still getting 500 error**
- Check Vercel Function Logs (Settings → Functions)
- Look for specific error messages
- Verify AWS credentials are valid
- Test credentials with AWS CLI: `aws s3 ls`

---

## 💡 Pro Tips

1. **Use all environments**: Check Production, Preview, and Development for consistent behavior
2. **Keep secrets secure**: Never commit `.env` to git (already in `.gitignore`)
3. **Test in preview**: Deploy to preview branch first to test
4. **Backup credentials**: Save AWS keys securely (password manager)
5. **Rotate regularly**: Change AWS keys periodically for security

---

## Need Help?

- Vercel Docs: https://vercel.com/docs/environment-variables
- AWS IAM Guide: See `AWS_S3_SETUP.md`
- Support: Check Vercel community or AWS forums
