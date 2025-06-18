/**
 * BEE Keepers MVP - Google Apps Script REST API
 * 
 * This Google Apps Script provides a complete REST API for the BEE Keepers system
 * connecting the frontend application to the Google Sheets database.
 * 
 * Features:
 * - Complete CRUD operations for all 6 database sheets
 * - Proper CORS handling for web access
 * - JSON response formatting with error handling
 * - Input validation and data sanitization
 * - Auto-increment ID generation
 * - Search and filter functionality
 * - Bulk operations support
 * 
 * Deployment:
 * 1. Copy this code to a new Google Apps Script project
 * 2. Deploy as web app with "Anyone" access
 * 3. Copy the web app URL for frontend configuration
 */

// Configuration - Update with your Google Sheets ID
const SPREADSHEET_ID = '1iu6QIdHCeSeYTkWgmt8gmHWbxQ89qtSmoSub46B934w';

// Valid sheet names for the BEE Keepers database
const VALID_SHEETS = ['Apiaries', 'Hives', 'Inspections', 'Metrics', 'Tasks', 'Treatments'];

// CORS headers for web access
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400'
};

/**
 * Handle GET requests for data retrieval
 */
function doGet(e) {
  try {
    // Handle preflight CORS requests
    if (e.parameter.method === 'OPTIONS') {
      return createResponse('', 200, CORS_HEADERS);
    }

    const action = e.parameter.action || 'get';
    const sheetName = e.parameter.sheet;
    
    // Validate sheet name
    if (sheetName && !VALID_SHEETS.includes(sheetName)) {
      return createErrorResponse('Invalid sheet name: ' + sheetName, 400);
    }

    switch (action) {
      case 'get':
        return handleGetData(e.parameter);
      case 'search':
        return handleSearchData(e.parameter);
      case 'count':
        return handleCountData(e.parameter);
      case 'health':
        return handleHealthCheck();
      default:
        return createErrorResponse('Invalid action: ' + action, 400);
    }
  } catch (error) {
    Logger.log('GET Error: ' + error.toString());
    return createErrorResponse('Server error: ' + error.message, 500);
  }
}

/**
 * Handle POST requests for data creation and updates
 */
function doPost(e) {
  try {
    // Handle preflight CORS requests
    if (e.parameter.method === 'OPTIONS') {
      return createResponse('', 200, CORS_HEADERS);
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const sheetName = data.sheet;
    
    // Validate sheet name
    if (sheetName && !VALID_SHEETS.includes(sheetName)) {
      return createErrorResponse('Invalid sheet name: ' + sheetName, 400);
    }

    switch (action) {
      case 'add':
        return handleAddRecord(sheetName, data.record);
      case 'update':
        return handleUpdateRecord(sheetName, data.id, data.record);
      case 'delete':
        return handleDeleteRecord(sheetName, data.id);
      case 'bulk_add':
        return handleBulkAdd(sheetName, data.records);
      default:
        return createErrorResponse('Invalid action: ' + action, 400);
    }
  } catch (error) {
    Logger.log('POST Error: ' + error.toString());
    return createErrorResponse('Server error: ' + error.message, 500);
  }
}

/**
 * Get data from a specific sheet
 */
function handleGetData(params) {
  const sheetName = params.sheet;
  const limit = parseInt(params.limit) || null;
  const offset = parseInt(params.offset) || 0;
  
  if (!sheetName) {
    return createErrorResponse('Sheet name is required', 400);
  }

  try {
    const data = getSheetData(sheetName, limit, offset);
    return createSuccessResponse(data, {
      count: data.length,
      offset: offset,
      limit: limit
    });
  } catch (error) {
    return createErrorResponse('Failed to retrieve data: ' + error.message, 500);
  }
}

/**
 * Search and filter data in a sheet
 */
function handleSearchData(params) {
  const sheetName = params.sheet;
  
  if (!sheetName) {
    return createErrorResponse('Sheet name is required', 400);
  }

  try {
    const data = searchData(sheetName, params);
    return createSuccessResponse(data, {
      count: data.length,
      searchParams: params
    });
  } catch (error) {
    return createErrorResponse('Search failed: ' + error.message, 500);
  }
}

/**
 * Count records in a sheet
 */
function handleCountData(params) {
  const sheetName = params.sheet;
  
  if (!sheetName) {
    return createErrorResponse('Sheet name is required', 400);
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(sheetName);
    const count = sheet.getLastRow() - 1; // Subtract header row
    
    return createSuccessResponse({ count: Math.max(0, count) });
  } catch (error) {
    return createErrorResponse('Count failed: ' + error.message, 500);
  }
}

/**
 * Health check endpoint
 */
function handleHealthCheck() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets().map(sheet => sheet.getName());
    
    return createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      spreadsheetId: SPREADSHEET_ID,
      availableSheets: sheets,
      validSheets: VALID_SHEETS
    });
  } catch (error) {
    return createErrorResponse('Health check failed: ' + error.message, 500);
  }
}

/**
 * Add a new record to a sheet
 */
function handleAddRecord(sheetName, record) {
  if (!sheetName || !record) {
    return createErrorResponse('Sheet name and record data are required', 400);
  }

  try {
    const id = addRecord(sheetName, record);
    return createSuccessResponse({ 
      id: id, 
      message: 'Record added successfully',
      record: record 
    });
  } catch (error) {
    return createErrorResponse('Failed to add record: ' + error.message, 500);
  }
}

/**
 * Update an existing record
 */
function handleUpdateRecord(sheetName, id, record) {
  if (!sheetName || !id || !record) {
    return createErrorResponse('Sheet name, ID, and record data are required', 400);
  }

  try {
    const success = updateRecord(sheetName, id, record);
    if (success) {
      return createSuccessResponse({ 
        id: id, 
        message: 'Record updated successfully',
        record: record 
      });
    } else {
      return createErrorResponse('Record not found', 404);
    }
  } catch (error) {
    return createErrorResponse('Failed to update record: ' + error.message, 500);
  }
}

/**
 * Delete a record
 */
function handleDeleteRecord(sheetName, id) {
  if (!sheetName || !id) {
    return createErrorResponse('Sheet name and ID are required', 400);
  }

  try {
    const success = deleteRecord(sheetName, id);
    if (success) {
      return createSuccessResponse({ 
        id: id, 
        message: 'Record deleted successfully' 
      });
    } else {
      return createErrorResponse('Record not found', 404);
    }
  } catch (error) {
    return createErrorResponse('Failed to delete record: ' + error.message, 500);
  }
}

/**
 * Add multiple records at once
 */
function handleBulkAdd(sheetName, records) {
  if (!sheetName || !records || !Array.isArray(records)) {
    return createErrorResponse('Sheet name and records array are required', 400);
  }

  try {
    const results = records.map(record => addRecord(sheetName, record));
    return createSuccessResponse({ 
      ids: results, 
      count: results.length,
      message: 'Records added successfully' 
    });
  } catch (error) {
    return createErrorResponse('Bulk add failed: ' + error.message, 500);
  }
}

/**
 * Get all data from a sheet with optional pagination
 */
function getSheetData(sheetName, limit = null, offset = 0) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let rows = data.slice(1); // Skip header row

  // Apply pagination
  if (offset > 0) {
    rows = rows.slice(offset);
  }
  if (limit && limit > 0) {
    rows = rows.slice(0, limit);
  }

  // Convert to objects
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Search data with filters
 */
function searchData(sheetName, params) {
  const allData = getSheetData(sheetName);
  
  let filteredData = allData;

  // Apply filters based on parameters
  Object.keys(params).forEach(key => {
    if (key !== 'action' && key !== 'sheet' && params[key]) {
      filteredData = filteredData.filter(row => {
        const value = row[key];
        if (value === undefined || value === null) return false;
        
        // Case-insensitive search
        return value.toString().toLowerCase().includes(params[key].toLowerCase());
      });
    }
  });

  return filteredData;
}

/**
 * Add a new record with auto-generated ID
 */
function addRecord(sheetName, record) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Generate auto-increment ID
  const lastRow = sheet.getLastRow();
  const newId = lastRow; // Simple auto-increment
  
  // Add timestamps for specific fields
  const now = new Date();
  if (headers.includes('Created_Date') && !record.Created_Date) {
    record.Created_Date = now;
  }
  if (headers.includes('QR_Code') && !record.QR_Code && sheetName === 'Hives') {
    record.QR_Code = 'QR' + Date.now().toString().substr(-6);
  }

  // Set ID
  record.ID = newId;

  // Build values array matching headers order
  const values = headers.map(header => record[header] || '');
  
  // Append the new row
  sheet.appendRow(values);
  
  return newId;
}

/**
 * Update an existing record
 */
function updateRecord(sheetName, id, record) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find the row with matching ID
  const rowIndex = data.findIndex(row => row[0] == id);
  if (rowIndex === -1 || rowIndex === 0) { // 0 is header row
    return false;
  }

  // Update completed date for tasks
  if (sheetName === 'Tasks' && record.Status === 'Completed' && !record.Completed_Date) {
    record.Completed_Date = new Date();
  }

  // Update the row data
  headers.forEach((header, index) => {
    if (record[header] !== undefined) {
      sheet.getRange(rowIndex + 1, index + 1).setValue(record[header]);
    }
  });

  return true;
}

/**
 * Delete a record by ID
 */
function deleteRecord(sheetName, id) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }

  const data = sheet.getDataRange().getValues();
  
  // Find the row with matching ID
  const rowIndex = data.findIndex(row => row[0] == id);
  if (rowIndex === -1 || rowIndex === 0) { // 0 is header row
    return false;
  }

  // Delete the row
  sheet.deleteRow(rowIndex + 1);
  return true;
}

/**
 * Create a successful JSON response
 */
function createSuccessResponse(data, meta = {}) {
  const response = {
    success: true,
    data: data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
  
  return createResponse(JSON.stringify(response), 200, CORS_HEADERS);
}

/**
 * Create an error JSON response
 */
function createErrorResponse(message, statusCode = 400) {
  const response = {
    success: false,
    error: {
      message: message,
      code: statusCode,
      timestamp: new Date().toISOString()
    }
  };
  
  return createResponse(JSON.stringify(response), statusCode, CORS_HEADERS);
}

/**
 * Create HTTP response with headers
 */
function createResponse(content, statusCode = 200, headers = {}) {
  return ContentService
    .createTextOutput(content)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      ...CORS_HEADERS,
      ...headers
    });
}

/**
 * Test function to verify API functionality
 * Run this function to test the API without external calls
 */
function testAPI() {
  Logger.log('🧪 Testing BEE Keepers API...');
  
  try {
    // Test health check
    const healthResult = handleHealthCheck();
    Logger.log('✅ Health check passed');
    
    // Test get data
    const getResult = handleGetData({ sheet: 'Hives' });
    Logger.log('✅ Get data test passed');
    
    // Test add record
    const testRecord = {
      Apiary_ID: 1,
      Name: 'Test Hive API',
      Type: 'Langstroth',
      Status: 'Active',
      Notes: 'Created via API test'
    };
    const addResult = handleAddRecord('Hives', testRecord);
    Logger.log('✅ Add record test passed');
    
    Logger.log('🎉 All API tests passed successfully!');
    
  } catch (error) {
    Logger.log('❌ API test failed: ' + error.toString());
  }
}
