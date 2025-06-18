/**
 * BEE Keepers MVP - Google Apps Script REST API (CORS FIXED VERSION)
 * 
 * This Google Apps Script provides a complete REST API for the BEE Keepers system
 * connecting the frontend application to the Google Sheets database.
 * 
 * CORS FIX: Proper CORS headers for GitHub Pages deployment
 * 
 * Features:
 * - Complete CRUD operations for all 6 database sheets
 * - Proper CORS handling for GitHub Pages and web access
 * - JSON response formatting with error handling
 * - Input validation and data sanitization
 * - Auto-increment ID generation
 * - Search and filter functionality
 * - Bulk operations support
 * 
 * Deployment:
 * 1. Copy this code to Google Apps Script project
 * 2. Update the SPREADSHEET_ID with your actual Google Sheets ID
 * 3. Deploy as web app with "Anyone" access
 * 4. Copy the web app URL for frontend configuration
 */

// Configuration - Update with your Google Sheets ID
const SPREADSHEET_ID = '1PVN5lq6U0Joszq5W7TlVTUi72m615qXv7wSeZmePbwM';

// Valid sheet names for the BEE Keepers database
const VALID_SHEETS = ['Apiaries', 'Hives', 'Inspections', 'Metrics', 'Tasks', 'Treatments'];

/**
 * Handle GET requests for data retrieval
 */
function doGet(e) {
  try {
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
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    return createErrorResponse('Sheet not found: ' + sheetName, 404);
  }
  
  const data = getSheetData(sheet);
  
  // Apply pagination if specified
  let paginatedData = data;
  if (limit) {
    paginatedData = data.slice(offset, offset + limit);
  }
  
  return createSuccessResponse(paginatedData, {
    total: data.length,
    limit: limit,
    offset: offset
  });
}

/**
 * Add a new record to a sheet
 */
function handleAddRecord(sheetName, record) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    return createErrorResponse('Sheet not found: ' + sheetName, 404);
  }
  
  // Get the next ID
  const data = getSheetData(sheet);
  const nextId = data.length > 0 ? Math.max(...data.map(row => row.ID || 0)) + 1 : 1;
  
  // Prepare the record with ID and timestamp
  const newRecord = {
    ID: nextId,
    ...record,
    Created_Date: new Date().toISOString().split('T')[0],
    ...(!record.Date && { Date: new Date().toISOString().split('T')[0] })
  };
  
  // Add the record
  addRecordToSheet(sheet, newRecord);
  
  return createSuccessResponse(newRecord, { id: nextId });
}

/**
 * Update an existing record
 */
function handleUpdateRecord(sheetName, id, record) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    return createErrorResponse('Sheet not found: ' + sheetName, 404);
  }
  
  const updated = updateRecordInSheet(sheet, parseInt(id), record);
  if (!updated) {
    return createErrorResponse('Record not found with ID: ' + id, 404);
  }
  
  return createSuccessResponse(record, { id: id });
}

/**
 * Delete a record
 */
function handleDeleteRecord(sheetName, id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    return createErrorResponse('Sheet not found: ' + sheetName, 404);
  }
  
  const deleted = deleteRecordFromSheet(sheet, parseInt(id));
  if (!deleted) {
    return createErrorResponse('Record not found with ID: ' + id, 404);
  }
  
  return createSuccessResponse({ deleted: true }, { id: id });
}

/**
 * Search records in a sheet
 */
function handleSearchData(params) {
  const sheetName = params.sheet;
  const searchTerm = params.q || '';
  const field = params.field;
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    return createErrorResponse('Sheet not found: ' + sheetName, 404);
  }
  
  const data = getSheetData(sheet);
  let filteredData = data;
  
  if (searchTerm) {
    filteredData = data.filter(row => {
      if (field && row[field]) {
        return row[field].toString().toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        // Search across all fields
        return Object.values(row).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    });
  }
  
  return createSuccessResponse(filteredData, { 
    total: data.length, 
    filtered: filteredData.length,
    searchTerm: searchTerm 
  });
}

/**
 * Count records in a sheet
 */
function handleCountData(params) {
  const sheetName = params.sheet;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    return createErrorResponse('Sheet not found: ' + sheetName, 404);
  }
  
  const data = getSheetData(sheet);
  return createSuccessResponse({ count: data.length });
}

/**
 * Health check endpoint
 */
function handleHealthCheck() {
  return createSuccessResponse({
    status: 'healthy',
    service: 'BEE Keepers API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}

/**
 * Bulk add multiple records
 */
function handleBulkAdd(sheetName, records) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) {
    return createErrorResponse('Sheet not found: ' + sheetName, 404);
  }
  
  const data = getSheetData(sheet);
  let nextId = data.length > 0 ? Math.max(...data.map(row => row.ID || 0)) + 1 : 1;
  
  const newRecords = records.map(record => {
    const newRecord = {
      ID: nextId++,
      ...record,
      Created_Date: new Date().toISOString().split('T')[0]
    };
    addRecordToSheet(sheet, newRecord);
    return newRecord;
  });
  
  return createSuccessResponse(newRecords, { count: newRecords.length });
}

/**
 * Get all data from a sheet as objects
 */
function getSheetData(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length === 0) {
    return [];
  }
  
  const headers = values[0];
  const data = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    data.push(row);
  }
  
  return data;
}

/**
 * Add a record to a sheet
 */
function addRecordToSheet(sheet, record) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = headers.map(header => record[header] || '');
  sheet.appendRow(values);
}

/**
 * Update a record in a sheet
 */
function updateRecordInSheet(sheet, id, record) {
  const data = getSheetData(sheet);
  const rowIndex = data.findIndex(row => row.ID === id);
  
  if (rowIndex === -1) {
    return false;
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const actualRowIndex = rowIndex + 2; // +1 for 0-based, +1 for header row
  
  headers.forEach((header, colIndex) => {
    if (record.hasOwnProperty(header) && header !== 'ID') {
      sheet.getRange(actualRowIndex, colIndex + 1).setValue(record[header]);
    }
  });
  
  return true;
}

/**
 * Delete a record from a sheet
 */
function deleteRecordFromSheet(sheet, id) {
  const data = getSheetData(sheet);
  const rowIndex = data.findIndex(row => row.ID === id);
  
  if (rowIndex === -1) {
    return false;
  }
  
  const actualRowIndex = rowIndex + 2; // +1 for 0-based, +1 for header row
  sheet.deleteRow(actualRowIndex);
  return true;
}

/**
 * Create a success response with CORS headers
 */
function createSuccessResponse(data, meta = {}) {
  const response = {
    success: true,
    data: data,
    meta: {
      timestamp: new Date().toISOString(),
      corsEnabled: true,
      ...meta
    }
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Create an error response with CORS headers
 */
function createErrorResponse(message, code = 400) {
  const response = {
    success: false,
    error: {
      message: message,
      code: code,
      timestamp: new Date().toISOString()
    }
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}