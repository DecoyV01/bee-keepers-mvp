/**
 * BEE Keepers Database Setup Script
 * 
 * This Google Apps Script will automatically create a complete Google Sheets database
 * for the BEE Keepers MVP system with all required sheets and headers.
 * 
 * Instructions:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Replace Code.gs content with this script
 * 4. Run the createBeeKeepersDatabase() function
 * 5. Check the execution log for the spreadsheet URL
 */

function createBeeKeepersDatabase() {
  try {
    // Create new spreadsheet
    const spreadsheet = SpreadsheetApp.create('BEE Keepers Database');
    const spreadsheetId = spreadsheet.getId();
    const spreadsheetUrl = spreadsheet.getUrl();
    
    Logger.log('Creating BEE Keepers Database...');
    Logger.log('Spreadsheet ID: ' + spreadsheetId);
    Logger.log('Spreadsheet URL: ' + spreadsheetUrl);
    
    // Delete the default sheet
    const defaultSheet = spreadsheet.getSheetByName('Sheet1');
    if (defaultSheet) {
      spreadsheet.deleteSheet(defaultSheet);
    }
    
    // Define all sheets and their headers
    const sheetsConfig = {
      'Apiaries': [
        'ID', 'Name', 'Location', 'GPS_Lat', 'GPS_Lng', 'Owner_Email', 'Created_Date', 'Notes'
      ],
      'Hives': [
        'ID', 'Apiary_ID', 'Name', 'Type', 'Install_Date', 'Status', 'QR_Code', 'Notes'
      ],
      'Inspections': [
        'ID', 'Hive_ID', 'Inspector', 'Date', 'Duration', 'Queen_Present', 
        'Queen_Laying', 'Brood_Pattern', 'Honey_Stores', 'Weather', 'Notes'
      ],
      'Metrics': [
        'ID', 'Hive_ID', 'Date', 'Time', 'Temperature', 'Weight', 'Humidity', 'Source', 'Notes'
      ],
      'Tasks': [
        'ID', 'Hive_ID', 'Title', 'Description', 'Due_Date', 'Status', 
        'Priority', 'Created_Date', 'Completed_Date'
      ],
      'Treatments': [
        'ID', 'Hive_ID', 'Treatment_Type', 'Medicine', 'Dosage', 'Date_Applied', 
        'Date_Completed', 'Effectiveness', 'Notes'
      ]
    };
    
    // Create each sheet with headers
    Object.keys(sheetsConfig).forEach(sheetName => {
      const sheet = spreadsheet.insertSheet(sheetName);
      const headers = sheetsConfig[sheetName];
      
      // Add headers to row 1
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#E8F0FE');
      headerRange.setBorder(true, true, true, true, true, true);
      
      // Freeze header row
      sheet.setFrozenRows(1);
      
      // Auto-resize columns
      sheet.autoResizeColumns(1, headers.length);
      
      Logger.log('Created sheet: ' + sheetName + ' with ' + headers.length + ' columns');
    });
    
    // Set up data validation and formatting for specific columns
    setupDataValidation(spreadsheet);
    
    // Add sample data
    addSampleData(spreadsheet);
    
    // Set sharing permissions (requires permission)
    try {
      const file = DriveApp.getFileById(spreadsheetId);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      Logger.log('Sharing permissions set to: Anyone with link can edit');
    } catch (e) {
      Logger.log('Note: Could not set sharing permissions automatically. Please set manually.');
      Logger.log('Go to Share > Change to anyone with the link > Editor');
    }
    
    Logger.log('✅ BEE Keepers Database created successfully!');
    Logger.log('📊 Total sheets created: ' + Object.keys(sheetsConfig).length);
    Logger.log('🔗 Access your database at: ' + spreadsheetUrl);
    
    // Return the URL for easy access
    return {
      success: true,
      spreadsheetId: spreadsheetId,
      spreadsheetUrl: spreadsheetUrl,
      message: 'Database created successfully!'
    };
    
  } catch (error) {
    Logger.log('❌ Error creating database: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

function setupDataValidation(spreadsheet) {
  try {
    // Set up data validation for specific columns
    
    // Hives sheet validations
    const hivesSheet = spreadsheet.getSheetByName('Hives');
    
    // Hive Type validation (column D)
    const hiveTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Langstroth', 'Top Bar', 'Warre', 'Other'])
      .setAllowInvalid(false)
      .setHelpText('Select hive type')
      .build();
    hivesSheet.getRange('D2:D1000').setDataValidation(hiveTypeRule);
    
    // Hive Status validation (column F)
    const hiveStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Active', 'Inactive', 'Swarmed', 'Dead'])
      .setAllowInvalid(false)
      .setHelpText('Select hive status')
      .build();
    hivesSheet.getRange('F2:F1000').setDataValidation(hiveStatusRule);
    
    // Inspections sheet validations
    const inspectionsSheet = spreadsheet.getSheetByName('Inspections');
    
    // Queen Present validation (column F)
    const queenPresentRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Yes', 'No', 'Unknown'])
      .setAllowInvalid(false)
      .build();
    inspectionsSheet.getRange('F2:F1000').setDataValidation(queenPresentRule);
    
    // Queen Laying validation (column G)
    inspectionsSheet.getRange('G2:G1000').setDataValidation(queenPresentRule);
    
    // Tasks sheet validations
    const tasksSheet = spreadsheet.getSheetByName('Tasks');
    
    // Task Status validation (column F)
    const taskStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pending', 'In Progress', 'Completed'])
      .setAllowInvalid(false)
      .build();
    tasksSheet.getRange('F2:F1000').setDataValidation(taskStatusRule);
    
    // Priority validation (column G)
    const priorityRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Low', 'Medium', 'High', 'Critical'])
      .setAllowInvalid(false)
      .build();
    tasksSheet.getRange('G2:G1000').setDataValidation(priorityRule);
    
    // Metrics sheet validations
    const metricsSheet = spreadsheet.getSheetByName('Metrics');
    
    // Source validation (column H)
    const sourceRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Manual', 'Digital', 'Estimated'])
      .setAllowInvalid(false)
      .build();
    metricsSheet.getRange('H2:H1000').setDataValidation(sourceRule);
    
    Logger.log('✅ Data validation rules applied');
    
  } catch (error) {
    Logger.log('⚠️ Warning: Could not set up all data validation rules: ' + error.toString());
  }
}

function addSampleData(spreadsheet) {
  try {
    Logger.log('Adding sample data...');
    
    // Add sample apiary
    const apiariesSheet = spreadsheet.getSheetByName('Apiaries');
    apiariesSheet.getRange('A2:H2').setValues([[
      1, 'Main Apiary', '123 Farm Road, Bee Valley, State 12345', 
      40.7128, -74.0060, 'beekeeper@email.com', new Date(), 'Primary beekeeping location'
    ]]);
    
    // Add sample hives
    const hivesSheet = spreadsheet.getSheetByName('Hives');
    hivesSheet.getRange('A2:H4').setValues([
      [1, 1, 'Hive Alpha', 'Langstroth', new Date('2024-03-01'), 'Active', 'QR001', 'Strong colony'],
      [2, 1, 'Hive Beta', 'Langstroth', new Date('2024-03-15'), 'Active', 'QR002', 'New colony'],
      [3, 1, 'Hive Gamma', 'Top Bar', new Date('2024-04-01'), 'Inactive', 'QR003', 'Needs attention']
    ]);
    
    // Add sample inspection
    const inspectionsSheet = spreadsheet.getSheetByName('Inspections');
    inspectionsSheet.getRange('A2:K2').setValues([[
      1, 1, 'John Beekeeper', new Date(), 45, 'Yes', 'Yes', 5, 4, 'Sunny', 'Colony looking strong'
    ]]);
    
    // Add sample metrics
    const metricsSheet = spreadsheet.getSheetByName('Metrics');
    metricsSheet.getRange('A2:I3').setValues([
      [1, 1, new Date(), '14:30', 95.5, 87.3, 65, 'Manual', 'Good readings'],
      [2, 2, new Date(), '14:45', 94.8, 52.1, 67, 'Manual', 'Lighter hive']
    ]);
    
    // Add sample task
    const tasksSheet = spreadsheet.getSheetByName('Tasks');
    tasksSheet.getRange('A2:I2').setValues([[
      1, 1, 'Varroa Treatment', 'Apply mite treatment', new Date(Date.now() + 5*24*60*60*1000), 
      'Pending', 'High', new Date(), ''
    ]]);
    
    // Add sample treatment
    const treatmentsSheet = spreadsheet.getSheetByName('Treatments');
    treatmentsSheet.getRange('A2:I2').setValues([[
      1, 1, 'Varroa Mites', 'Apiguard', '50g', new Date('2024-05-01'), 
      new Date('2024-05-15'), 4, 'Effective treatment'
    ]]);
    
    Logger.log('✅ Sample data added to all sheets');
    
  } catch (error) {
    Logger.log('⚠️ Warning: Could not add sample data: ' + error.toString());
  }
}

/**
 * Helper function to test the database creation
 * Run this to see what would be created without actually creating it
 */
function testDatabaseStructure() {
  const sheetsConfig = {
    'Apiaries': ['ID', 'Name', 'Location', 'GPS_Lat', 'GPS_Lng', 'Owner_Email', 'Created_Date', 'Notes'],
    'Hives': ['ID', 'Apiary_ID', 'Name', 'Type', 'Install_Date', 'Status', 'QR_Code', 'Notes'],
    'Inspections': ['ID', 'Hive_ID', 'Inspector', 'Date', 'Duration', 'Queen_Present', 'Queen_Laying', 'Brood_Pattern', 'Honey_Stores', 'Weather', 'Notes'],
    'Metrics': ['ID', 'Hive_ID', 'Date', 'Time', 'Temperature', 'Weight', 'Humidity', 'Source', 'Notes'],
    'Tasks': ['ID', 'Hive_ID', 'Title', 'Description', 'Due_Date', 'Status', 'Priority', 'Created_Date', 'Completed_Date'],
    'Treatments': ['ID', 'Hive_ID', 'Treatment_Type', 'Medicine', 'Dosage', 'Date_Applied', 'Date_Completed', 'Effectiveness', 'Notes']
  };
  
  Logger.log('📋 BEE Keepers Database Structure:');
  Logger.log('Total sheets: ' + Object.keys(sheetsConfig).length);
  
  Object.keys(sheetsConfig).forEach(sheetName => {
    Logger.log('📊 ' + sheetName + ': ' + sheetsConfig[sheetName].length + ' columns');
    Logger.log('   Columns: ' + sheetsConfig[sheetName].join(', '));
  });
}
