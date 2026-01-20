# AWS S3 Setup Guide for Image Uploads

## Problem
You're seeing a 500 error when trying to upload images because AWS S3 credentials are not configured.

## Solution

### Step 1: Get AWS Credentials

1. **Log in to AWS Console**: https://console.aws.amazon.com/
2. **Go to IAM (Identity and Access Management)**
3. **Create a new user** (or use existing):
   - Click "Users" → "Add users"
   - Username: `aura-co-s3-uploader` (or any name)
   - Access type: Select "Programmatic access"
   - Click "Next: Permissions"

4. **Attach S3 permissions**:
   - Click "Attach existing policies directly"
   - Search for and select: `AmazonS3FullAccess`
   - Or create a custom policy (more secure - see below)
   - Click "Next" → "Create user"

5. **Save credentials**:
   - Copy the **Access Key ID**
   - Copy the **Secret Access Key** (shown only once!)

### Step 2: Configure Your S3 Bucket

1. **Go to S3**: https://s3.console.aws.amazon.com/
2. **Select your bucket**: `aurascoimages` (or create it)
3. **Configure bucket permissions**:

   Click on your bucket → Permissions → Bucket Policy

   Add this policy (replace `aurascoimages` with your bucket name):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::aurascoimages/*"
       }
     ]
   }
   ```

4. **Configure CORS** (if not already done):

   Click Permissions → CORS configuration

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

5. **Unblock public access** (for product images):
   - Permissions → Block public access
   - Edit → Uncheck "Block all public access"
   - Save changes

### Step 3: Add Credentials to .env

Open your `.env` file and add:

```bash
# AWS S3 Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key_id_here"
AWS_SECRET_ACCESS_KEY="your_secret_access_key_here"
AWS_S3_BUCKET="aurascoimages"
```

Replace:
- `your_access_key_id_here` with your Access Key ID from Step 1
- `your_secret_access_key_here` with your Secret Access Key from Step 1
- `us-east-1` with your bucket's region if different
- `aurascoimages` with your bucket name if different

### Step 4: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then restart it
npm start
```

### Step 5: Deploy to Vercel (if using Vercel)

Add environment variables in Vercel:

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
4. Redeploy your application

## Verification

Test the upload:
1. Go to Admin Portal
2. Try to add/edit a product
3. Upload an image from your device
4. You should see "✓ Image Uploaded" message
5. The image URL should be something like:
   `https://aurascoimages.s3.us-east-1.amazonaws.com/products/xxxx-xxxx-xxxx.jpg`

## Troubleshooting

### Error: "Access Denied"
- Check that your IAM user has S3 permissions
- Verify bucket name is correct
- Ensure bucket policy allows uploads

### Error: "Credentials not configured"
- Check `.env` file has all required variables
- Restart your server after adding credentials
- For Vercel: ensure environment variables are added in dashboard

### Error: "Bucket not found"
- Verify bucket name matches in `.env`
- Check AWS region is correct
- Ensure bucket exists in your AWS account

### Images Upload but Don't Display
- Check bucket policy allows public read access
- Verify CORS configuration
- Check image URL format in browser

## Custom IAM Policy (More Secure)

Instead of `AmazonS3FullAccess`, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::aurascoimages/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::aurascoimages"
    }
  ]
}
```

This limits access to only your specific bucket.

## Cost Optimization

- S3 is pay-as-you-go (very cheap for small sites)
- First 5GB of storage is free tier
- First 20,000 GET requests free per month
- Set lifecycle policies to delete old unused images
- Consider CloudFront CDN for high traffic sites

## Need Help?

1. Check AWS CloudWatch logs for detailed error messages
2. Check your server console for upload errors
3. Verify all environment variables are set correctly
4. Test AWS credentials using AWS CLI: `aws s3 ls s3://aurascoimages`
