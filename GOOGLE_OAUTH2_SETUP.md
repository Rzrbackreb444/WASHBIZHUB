# Google Indexing API - OAuth2 Setup Guide

## Overview
The Google Indexing API requires OAuth2 service account authentication (not API keys). Follow these steps to enable instant Google indexing for your site.

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"** 
3. Name it: `washbizhub-indexing` (or any name you prefer)
4. Click **Create**

---

## Step 2: Enable Indexing API

1. In the Cloud Console, click **APIs & Services** → **Library**
2. Search for: **"Web Search Indexing API"**
3. Click the result, then click **Enable**

---

## Step 3: Create Service Account

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **Create Service Account**
3. Enter details:
   - **Name**: `indexing-service-account`
   - **Description**: "Service account for Google Indexing API"
4. Click **Create and Continue**
5. Skip the optional role assignment steps (click **Done**)

---

## Step 4: Generate JSON Key

1. Click on the newly created service account email
2. Go to the **KEYS** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON** format
5. Click **Create**

A JSON file will automatically download. **Keep this secure!**

Example JSON structure:
```json
{
  "type": "service_account",
  "project_id": "washbizhub-indexing",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "indexing-service-account@washbizhub-indexing.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

---

## Step 5: Add Service Account to Google Search Console

The service account needs **Owner** permission:

1. **Copy the `client_email`** from your JSON file
   - Example: `indexing-service-account@washbizhub-indexing.iam.gserviceaccount.com`

2. Go to [Google Search Console](https://search.google.com/search-console/)

3. Select your property: **washbizhub.com**

4. Click **Settings** (gear icon) → **Users and permissions**

5. Click **Add user**

6. Paste the service account email

7. Select **Owner** permission level (required for Indexing API)

8. Click **Add**

---

## Step 6: Configure Replit Secret

1. In your Replit project, open the **Secrets** tab (lock icon in sidebar)

2. Create a new secret:
   - **Key**: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value**: Paste the **entire contents** of your downloaded JSON file

3. Save the secret

---

## Step 7: Test the Integration

Run the indexing script:

```bash
npx tsx scripts/index-all-urls.ts
```

You should see:
```
✅ Successfully submitted to Google: https://washbizhub.com/
✅ Successfully submitted to Google: https://washbizhub.com/affiliate-blogs
...
```

---

## Using the Indexing System

### Bulk Submit All Pages
```bash
npx tsx scripts/index-all-urls.ts
```

### Via Admin API (requires admin login)
```bash
curl -X POST https://your-domain.com/api/admin/index-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Programmatically
```typescript
import { submitToGoogle } from './server/auto-indexing';

const result = await submitToGoogle('https://washbizhub.com/new-page');
console.log(result.success); // true
```

---

## Important Notes

- **Rate Limit**: 200 URLs per day per service account
- **Supported Content**: All page types (JobPosting, BroadcastEvent get priority)
- **Indexing Time**: Usually within 24 hours
- **Token Lifespan**: Access tokens expire after 1 hour (automatically refreshed)

---

## Troubleshooting

### Error: 403 Forbidden
**Cause**: Service account doesn't have Owner permission  
**Fix**: Go to Search Console → Settings → Add service account as Owner

### Error: 401 Unauthorized  
**Cause**: Invalid credentials or missing JSON  
**Fix**: Verify `GOOGLE_SERVICE_ACCOUNT_JSON` secret contains valid JSON

### Error: 404 Not Found
**Cause**: Indexing API not enabled  
**Fix**: Go to Cloud Console → APIs & Services → Enable "Web Search Indexing API"

### Error: Quota exceeded
**Cause**: Exceeded 200 URLs/day limit  
**Fix**: Create additional service accounts in separate Google Cloud projects

---

## Security Best Practices

✅ **DO**:
- Store JSON credentials in Replit Secrets (encrypted)
- Use environment variables only
- Rotate service account keys periodically
- Monitor API usage in Cloud Console

❌ **DON'T**:
- Commit JSON files to Git repositories
- Share service account credentials
- Use personal Google accounts for service accounts
- Hardcode credentials in source code

---

## Additional Resources

- [Google Indexing API Documentation](https://developers.google.com/search/apis/indexing-api/v3/quickstart)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Search Console Help](https://support.google.com/webmasters)

---

## Next Steps

Once configured, your indexing system will:
1. ✅ Submit new pages to Google instantly
2. ✅ Notify Google of content updates
3. ✅ Request re-indexing for modified pages
4. ✅ Track indexing status and errors

**Happy indexing!** 🚀
