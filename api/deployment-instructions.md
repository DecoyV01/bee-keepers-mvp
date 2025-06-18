# Google Apps Script API Deployment Guide

## Quick Setup Instructions

Follow these steps to deploy the BEE Keepers REST API using Google Apps Script.

## Step 1: Open Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **"New project"**
3. You'll see a file called `Code.gs` with default code

## Step 2: Replace Default Code

1. Select all the default code in `Code.gs` (Ctrl+A or Cmd+A)
2. Delete the default code
3. Copy the entire contents of `setup.gs` from this folder
4. Paste it into the `Code.gs` file

## Step 3: Configure Your Spreadsheet ID

**IMPORTANT**: Update the spreadsheet ID in the code.

1. Find this line in the code:
```javascript
const SPREADSHEET_ID = '1iu6QIdHCeSeYTkWgmt8gmHWbxQ89qtSmoSub46B934w';
```

2. Replace it with your actual Google Sheets ID from Task 1:
```javascript
const SPREADSHEET_ID = 'YOUR_ACTUAL_SPREADSHEET_ID';
```

**How to find your Spreadsheet ID:**
- It's the long string in your Google Sheets URL
- Format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
- Use the ID from your Task 1 database creation

## Step 4: Save the Project

1. Click **"Save"** (Ctrl+S or Cmd+S)
2. Name your project: **"BEE Keepers API"**
3. Click **"Save"**

## Step 5: Test the API (Optional but Recommended)

1. In the function dropdown, select **"testAPI"**
2. Click the **"Run"** button (▶️)
3. Check the logs: **View** > **"Logs"**
4. Look for "🎉 All API tests passed successfully!"

## Step 6: Deploy as Web App

### 6.1 Start Deployment
1. Click **"Deploy"** > **"New deployment"**
2. Click the **"Type"** gear icon
3. Select **"Web app"**

### 6.2 Configure Deployment
- **Description**: "BEE Keepers REST API v1.0"
- **Execute as**: **"Me (your-email@gmail.com)"**
- **Who has access**: **"Anyone"**

### 6.3 Authorize and Deploy
1. Click **"Deploy"**
2. **First time only**: You'll need to authorize the script
   - Click **"Authorize access"**
   - Choose your Google account
   - Click **"Advanced"** if you see a warning
   - Click **"Go to BEE Keepers API (unsafe)"**
   - Click **"Allow"**
3. After authorization, click **"Deploy"** again

### 6.4 Copy Your API URL
1. After successful deployment, you'll see a **Web app URL**
2. **COPY THIS URL** - you'll need it for the frontend
3. The URL looks like:
```
https://script.google.com/macros/s/AKfycbx.../exec
```

## Step 7: Test Your Deployed API

### Quick Browser Test
Open this URL in your browser (replace with your actual URL):
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=health
```

You should see a JSON response like:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "spreadsheetId": "your-spreadsheet-id",
    "availableSheets": ["Apiaries", "Hives", "Inspections", "Metrics", "Tasks", "Treatments"]
  }
}
```

### Test with Sample Data
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=get&sheet=Hives
```

## Step 8: Update Frontend Configuration

Save your API URL for Task 3 (Frontend Development). You'll need to update the frontend code with:

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

## Verification Checklist

- [ ] Google Apps Script project created
- [ ] Code copied from `setup.gs` 
- [ ] Spreadsheet ID updated in the code
- [ ] Project saved with name "BEE Keepers API"
- [ ] `testAPI()` function runs successfully
- [ ] Web app deployed with "Anyone" access
- [ ] Deployment URL copied and saved
- [ ] Health check endpoint returns success
- [ ] Sample data endpoints work

## Troubleshooting

### Common Issues

#### "Script not found" Error
- Check that deployment is set to "Anyone" access
- Verify the URL is complete and correct
- Try redeploying the web app

#### "Sheet not found" Error
- Verify the SPREADSHEET_ID is correct
- Make sure your Google Sheets database has the required sheets
- Check that sheets are named exactly: "Apiaries", "Hives", "Inspections", "Metrics", "Tasks", "Treatments"

#### Permission Errors
- Ensure you've authorized the script with all required permissions
- Check that the Google Sheets sharing is set to "Anyone with link can edit"
- Verify you're signed in with the correct Google account

#### Test Function Fails
- Check the execution logs for specific errors
- Verify your Google Sheets database exists and has sample data
- Make sure the spreadsheet ID is correctly set

### Debugging Tips

1. **Check Execution Logs**:
   - Go to **"View"** > **"Logs"** after running functions
   - Look for error messages and stack traces

2. **Test Individual Functions**:
   - Run `testAPI()` to verify all functionality
   - Run `handleHealthCheck()` to check database connection

3. **Verify Spreadsheet Access**:
   - Open your Google Sheets directly
   - Ensure all required sheets exist
   - Check that you have edit permissions

## API Endpoints Overview

Once deployed, your API will provide these endpoints:

### GET Endpoints
- `?action=health` - API health check
- `?action=get&sheet=SheetName` - Get all records
- `?action=search&sheet=SheetName&field=value` - Search records
- `?action=count&sheet=SheetName` - Count records

### POST Endpoints (JSON body)
- `{"action":"add","sheet":"SheetName","record":{...}}` - Add record
- `{"action":"update","sheet":"SheetName","id":1,"record":{...}}` - Update record
- `{"action":"delete","sheet":"SheetName","id":1}` - Delete record
- `{"action":"bulk_add","sheet":"SheetName","records":[...]}` - Bulk add

## Security Notes

- This MVP deployment allows public access (suitable for testing)
- For production use, implement proper authentication
- Google Apps Script automatically uses HTTPS
- All requests are logged in Google Apps Script console

## Next Steps

After successful deployment:

1. **Save the API URL** for frontend integration
2. **Test all endpoints** using the provided examples
3. **Proceed to Task 3**: Frontend development
4. **Consider security**: Plan authentication for production use

Your BEE Keepers REST API is now ready for frontend integration! 🚀
