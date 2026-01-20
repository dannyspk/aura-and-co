# 🚨 QUICK FIX: S3 Image Upload 500 Error

## What's Wrong
AWS credentials are missing from your `.env` file.

## Quick Fix (2 minutes)

1. **Get your AWS credentials**:
   - AWS Console → IAM → Users → Security credentials
   - Create access key if you don't have one

2. **Add to `.env` file**:
   ```bash
   AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
   AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
   ```

3. **Restart server**:
   ```bash
   npm start
   ```

4. **Test it**: Go to admin portal → Add product → Upload image

## That's it! ✅

See `AWS_S3_SETUP.md` for detailed setup instructions.
