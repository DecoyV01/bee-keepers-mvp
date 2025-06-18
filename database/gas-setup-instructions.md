# Google Apps Script Database Creation Instructions

## Quick Setup - Automated Database Creation

Instead of manually creating the Google Sheets database, you can use this Google Apps Script to automatically create the entire structure!

## Step-by-Step Instructions

### Step 1: Open Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Click **"New project"**
3. You'll see a file called `Code.gs` with some default code

### Step 2: Replace the Default Code
1. Select all the default code in `Code.gs` (Ctrl+A or Cmd+A)
2. Delete it
3. Copy the entire contents of `create-database-script.gs` (from this folder)
4. Paste it into the `Code.gs` file

### Step 3: Save the Project
1. Click **"Save"** (Ctrl+S or Cmd+S)
2. Name your project: **"BEE Keepers Database Creator"**
3. Click **"Save"**

### Step 4: Run the Script
1. In the function dropdown (top toolbar), select **"createBeeKeepersDatabase"**
2. Click the **"Run"** button (▶️)
3. **First time only**: You'll need to authorize the script
   - Click **"Review permissions"**
   - Choose your Google account
   - Click **"Advanced"** if you see a warning
   - Click **"Go to BEE Keepers Database Creator (unsafe)"**
   - Click **"Allow"**

### Step 5: Get Your Database URL
1. After the script runs, click **"View"** > **"Logs"** 
2. Look for the line that says **"Access your database at:"**
3. Copy that URL - this is your Google Sheets database!

## What the Script Creates

### ✅ Complete Database Structure
- **6 Sheets**: Apiaries, Hives, Inspections, Metrics, Tasks, Treatments
- **54 Total Columns** with exact headers as specified
- **Professional Formatting**: Bold headers, frozen rows, borders
- **Data Validation**: Dropdown menus for status fields, hive types, etc.

### ✅ Sample Data Included
- 1 sample apiary
- 3 sample hives
- 1 sample inspection
- 2 sample metrics
- 1 sample task
- 1 sample treatment

### ✅ Ready for API Integration
- Proper sharing permissions (anyone with link can edit)
- Consistent column naming for Google Apps Script API
- Data validation rules applied

## Verification Steps

After running the script:

1. **Check the Logs**: Look for "✅ BEE Keepers Database created successfully!"
2. **Open Your Database**: Click on the URL provided in the logs
3. **Verify Sheets**: Confirm all 6 sheets exist with proper headers
4. **Test Data Entry**: Try adding a new row to any sheet
5. **Check Dropdowns**: Test the dropdown menus in Status columns

## Troubleshooting

### If You Get Permission Errors:
- Make sure you're signed into Google with the correct account
- Grant all requested permissions to the script
- Try running the script again after authorization

### If the Script Fails:
- Check the execution logs for error messages
- Try running `testDatabaseStructure()` first to verify the configuration
- Make sure you have space in your Google Drive

### If Sharing Doesn't Work:
- The script will try to set sharing permissions automatically
- If it can't, manually set sharing: Share > Change to anyone with link > Editor

## Next Steps

Once your database is created:

1. **Save the URL**: Copy the spreadsheet URL for Task 2 (Google Apps Script API)
2. **Test the Structure**: Add some of your own beekeeping data
3. **Verify Access**: Open the link in an incognito browser to test sharing
4. **Ready for API**: Proceed to Task 2 - Google Apps Script REST API development

## Benefits of This Approach

- ⚡ **Fast**: Creates entire database in ~30 seconds
- 🎯 **Accurate**: Exact column headers and formatting
- 📊 **Complete**: Includes data validation and sample data
- 🔒 **Configured**: Sharing permissions and formatting applied
- ✅ **Tested**: Immediate verification with sample data

Your Google Sheets database will be production-ready immediately after running this script!
