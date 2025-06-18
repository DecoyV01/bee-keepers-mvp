# Google Sheets Database Setup Instructions

## Overview
This document provides step-by-step instructions for creating the Google Sheets database for the BEE Keepers MVP system.

## Step 1: Create New Google Sheets Document

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Rename the document to **"BEE Keepers Database"**
4. Save the document (Ctrl+S or Cmd+S)

## Step 2: Create Required Sheets

### 2.1 Rename Default Sheet
1. Right-click on **"Sheet1"** tab at the bottom
2. Select **"Rename"**
3. Change name to **"Hives"**

### 2.2 Add Additional Sheets
1. Click the **"+"** button next to the sheet tabs
2. Create sheets with these exact names:
   - **Inspections**
   - **Metrics** 
   - **Tasks**
   - **Treatments**
   - **Apiaries**

## Step 3: Configure Sheet Headers

### 3.1 Hives Sheet Headers
Copy and paste these headers into row 1 of the **Hives** sheet:

```
ID	Apiary_ID	Name	Type	Install_Date	Status	QR_Code	Notes
```

### 3.2 Inspections Sheet Headers
Copy and paste these headers into row 1 of the **Inspections** sheet:

```
ID	Hive_ID	Inspector	Date	Duration	Queen_Present	Queen_Laying	Brood_Pattern	Honey_Stores	Weather	Notes
```

### 3.3 Metrics Sheet Headers
Copy and paste these headers into row 1 of the **Metrics** sheet:

```
ID	Hive_ID	Date	Time	Temperature	Weight	Humidity	Source	Notes
```

### 3.4 Tasks Sheet Headers
Copy and paste these headers into row 1 of the **Tasks** sheet:

```
ID	Hive_ID	Title	Description	Due_Date	Status	Priority	Created_Date	Completed_Date
```

### 3.5 Treatments Sheet Headers
Copy and paste these headers into row 1 of the **Treatments** sheet:

```
ID	Hive_ID	Treatment_Type	Medicine	Dosage	Date_Applied	Date_Completed	Effectiveness	Notes
```

### 3.6 Apiaries Sheet Headers
Copy and paste these headers into row 1 of the **Apiaries** sheet:

```
ID	Name	Location	GPS_Lat	GPS_Lng	Owner_Email	Created_Date	Notes
```

## Step 4: Format Headers (Optional but Recommended)

1. Select row 1 in each sheet
2. Make text **Bold** (Ctrl+B)
3. Apply background color (light blue or gray)
4. Freeze the header row: **View > Freeze > 1 row**

## Step 5: Configure Sharing Permissions

1. Click the **"Share"** button in the top-right corner
2. Click **"Change to anyone with the link"**
3. Set permission to **"Editor"** (allows read/write access)
4. Click **"Done"**

## Step 6: Copy Spreadsheet URL

1. Copy the URL from your browser address bar
2. Save it in the file `google-sheets-database-url.txt`

The URL should look like:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
```

## Step 7: Add Sample Data (Optional for Testing)

### Sample Apiary Data
```
1	Main Apiary	123 Farm Road, Bee Valley	40.7128	-74.0060	beekeeper@email.com	2024-01-01	Primary beekeeping location
```

### Sample Hive Data
```
1	1	Hive Alpha	Langstroth	2024-03-01	Active	QR001	Strong colony, good production
2	1	Hive Beta	Langstroth	2024-03-15	Active	QR002	New colony, monitoring closely
```

## Verification Checklist

- [ ] Google Sheets document created with name "BEE Keepers Database"
- [ ] All 6 sheets created with exact names (case-sensitive)
- [ ] All headers properly configured in each sheet
- [ ] Sharing permissions set to "Anyone with link can edit"
- [ ] Spreadsheet URL saved in `google-sheets-database-url.txt`
- [ ] Headers formatted (bold, frozen row)
- [ ] Sample data added for testing (optional)

## Notes

- Column names are **case-sensitive** and must match exactly
- The ID column in each sheet will auto-increment via Google Apps Script
- Date columns should be formatted as dates in Google Sheets
- Numeric columns (Temperature, Weight, etc.) should be formatted as numbers
- GPS coordinates should be decimal degrees format

## Next Steps

After completing this setup:
1. Test the sharing permissions by opening the link in an incognito browser
2. Save the spreadsheet URL for Google Apps Script configuration
3. Proceed to Task 2: Develop Google Apps Script REST API
