# BEE Keepers API Documentation

## Overview

The BEE Keepers REST API provides complete CRUD operations for managing beekeeping data through Google Sheets. The API is built using Google Apps Script and deployed as a web application.

## Base URL

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Replace `YOUR_DEPLOYMENT_ID` with your actual Google Apps Script deployment ID.

## Authentication

No authentication required for this MVP. The API uses Google Sheets sharing permissions for access control.

## Request/Response Format

### Request Headers
```
Content-Type: application/json
```

### Response Format
All responses follow this structure:

#### Success Response
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "timestamp": "2024-06-18T10:30:00.000Z",
    "count": 5,
    "executionTime": 45
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": 400,
    "timestamp": "2024-06-18T10:30:00.000Z"
  }
}
```

## Database Sheets

The API provides access to 6 database sheets:

1. **Apiaries** - Beekeeping locations
2. **Hives** - Individual hives within apiaries
3. **Inspections** - Hive inspection records
4. **Metrics** - Temperature, weight, humidity data
5. **Tasks** - Task management and reminders
6. **Treatments** - Treatment applications and tracking

## API Endpoints

### Health Check

**GET** `/?action=health`

Check API status and available sheets.

#### Response
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-06-18T10:30:00.000Z",
    "spreadsheetId": "1iu6QIdHCeSeYTkWgmt8gmHWbxQ89qtSmoSub46B934w",
    "availableSheets": ["Apiaries", "Hives", "Inspections", "Metrics", "Tasks", "Treatments"],
    "validSheets": ["Apiaries", "Hives", "Inspections", "Metrics", "Tasks", "Treatments"]
  }
}
```

### Get Data

**GET** `/?action=get&sheet={sheetName}`

Retrieve all records from a specific sheet.

#### Parameters
- `sheet` (required): Sheet name (Apiaries, Hives, Inspections, Metrics, Tasks, Treatments)
- `limit` (optional): Maximum number of records to return
- `offset` (optional): Number of records to skip (for pagination)

#### Example
```
GET /?action=get&sheet=Hives&limit=10&offset=0
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "Apiary_ID": 1,
      "Name": "Hive Alpha",
      "Type": "Langstroth",
      "Install_Date": "2024-03-01",
      "Status": "Active",
      "QR_Code": "QR001",
      "Notes": "Strong colony"
    }
  ],
  "meta": {
    "count": 1,
    "offset": 0,
    "limit": 10
  }
}
```

### Search Data

**GET** `/?action=search&sheet={sheetName}&{field}={value}`

Search and filter records in a sheet.

#### Parameters
- `sheet` (required): Sheet name
- Any field name as parameter to filter by that field

#### Example
```
GET /?action=search&sheet=Hives&Status=Active&Type=Langstroth
```

#### Response
Same format as Get Data, but filtered results.

### Count Records

**GET** `/?action=count&sheet={sheetName}`

Get the total number of records in a sheet.

#### Response
```json
{
  "success": true,
  "data": {
    "count": 25
  }
}
```

### Add Record

**POST** `/`

Add a new record to a sheet.

#### Request Body
```json
{
  "action": "add",
  "sheet": "Hives",
  "record": {
    "Apiary_ID": 1,
    "Name": "New Hive",
    "Type": "Langstroth",
    "Status": "Active",
    "Notes": "Recently installed"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 4,
    "message": "Record added successfully",
    "record": {...}
  }
}
```

### Update Record

**POST** `/`

Update an existing record.

#### Request Body
```json
{
  "action": "update",
  "sheet": "Hives",
  "id": 1,
  "record": {
    "Status": "Inactive",
    "Notes": "Moved to storage"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Record updated successfully",
    "record": {...}
  }
}
```

### Delete Record

**POST** `/`

Delete a record by ID.

#### Request Body
```json
{
  "action": "delete",
  "sheet": "Hives",
  "id": 1
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Record deleted successfully"
  }
}
```

### Bulk Add

**POST** `/`

Add multiple records at once.

#### Request Body
```json
{
  "action": "bulk_add",
  "sheet": "Metrics",
  "records": [
    {
      "Hive_ID": 1,
      "Date": "2024-06-18",
      "Temperature": 95.5,
      "Weight": 87.3,
      "Source": "Manual"
    },
    {
      "Hive_ID": 2,
      "Date": "2024-06-18",
      "Temperature": 94.8,
      "Weight": 52.1,
      "Source": "Manual"
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "ids": [15, 16],
    "count": 2,
    "message": "Records added successfully"
  }
}
```

## Sheet-Specific Data Structures

### Apiaries
```json
{
  "ID": 1,
  "Name": "Main Apiary",
  "Location": "123 Farm Road, City, State",
  "GPS_Lat": 40.7128,
  "GPS_Lng": -74.0060,
  "Owner_Email": "beekeeper@email.com",
  "Created_Date": "2024-01-01",
  "Notes": "Primary location"
}
```

### Hives
```json
{
  "ID": 1,
  "Apiary_ID": 1,
  "Name": "Hive Alpha",
  "Type": "Langstroth",
  "Install_Date": "2024-03-01",
  "Status": "Active",
  "QR_Code": "QR001",
  "Notes": "Strong colony"
}
```

### Inspections
```json
{
  "ID": 1,
  "Hive_ID": 1,
  "Inspector": "John Beekeeper",
  "Date": "2024-06-15",
  "Duration": 45,
  "Queen_Present": "Yes",
  "Queen_Laying": "Yes",
  "Brood_Pattern": 5,
  "Honey_Stores": 4,
  "Weather": "Sunny",
  "Notes": "Colony looking strong"
}
```

### Metrics
```json
{
  "ID": 1,
  "Hive_ID": 1,
  "Date": "2024-06-15",
  "Time": "14:30",
  "Temperature": 95.5,
  "Weight": 87.3,
  "Humidity": 65,
  "Source": "Manual",
  "Notes": "Good readings"
}
```

### Tasks
```json
{
  "ID": 1,
  "Hive_ID": 1,
  "Title": "Varroa Treatment",
  "Description": "Apply mite treatment",
  "Due_Date": "2024-06-20",
  "Status": "Pending",
  "Priority": "High",
  "Created_Date": "2024-06-15",
  "Completed_Date": ""
}
```

### Treatments
```json
{
  "ID": 1,
  "Hive_ID": 1,
  "Treatment_Type": "Varroa Mites",
  "Medicine": "Apiguard",
  "Dosage": "50g",
  "Date_Applied": "2024-05-01",
  "Date_Completed": "2024-05-15",
  "Effectiveness": 4,
  "Notes": "Effective treatment"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters or missing required fields |
| 404 | Not Found - Record or sheet not found |
| 500 | Internal Server Error - Server-side error occurred |

## Rate Limits

Google Apps Script has the following limits:
- 6 minutes maximum execution time per request
- 100 MB maximum response size
- Daily quotas based on your Google account type

## Testing the API

### Using curl

```bash
# Health check
curl "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=health"

# Get hives
curl "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=get&sheet=Hives"

# Add a hive
curl -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "sheet": "Hives",
    "record": {
      "Apiary_ID": 1,
      "Name": "Test Hive",
      "Type": "Langstroth",
      "Status": "Active"
    }
  }'
```

### Using JavaScript

```javascript
// GET request
const response = await fetch(`${API_URL}?action=get&sheet=Hives`);
const data = await response.json();

// POST request
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'add',
    sheet: 'Hives',
    record: {
      Apiary_ID: 1,
      Name: 'New Hive',
      Type: 'Langstroth',
      Status: 'Active'
    }
  })
});
const result = await response.json();
```

## CORS Support

The API includes proper CORS headers for web browser access:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`

## Deployment Instructions

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Replace `Code.gs` with the content from `setup.gs`
4. Update `SPREADSHEET_ID` with your Google Sheets ID
5. Deploy as web app:
   - Click **"Deploy"** > **"New deployment"**
   - Type: **"Web app"**
   - Execute as: **"Me"**
   - Who has access: **"Anyone"**
   - Click **"Deploy"**
6. Copy the web app URL for frontend configuration

## Security Considerations

- The API is publicly accessible - suitable for MVP testing
- For production, implement proper authentication
- Consider rate limiting for high-traffic scenarios
- Validate all input data on the frontend
- Use HTTPS only (Google Apps Script enforces this)

## Support

For issues or questions about the API:
1. Check the execution logs in Google Apps Script
2. Test individual functions using the built-in `testAPI()` function
3. Verify Google Sheets permissions and structure
4. Ensure the deployment has proper access settings
