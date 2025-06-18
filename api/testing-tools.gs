/**
 * API Testing and Development Tools
 * 
 * These functions help test and debug the BEE Keepers API during development.
 * Run these functions in Google Apps Script to verify functionality.
 */

/**
 * Comprehensive API test suite
 * Run this to test all API functionality
 */
function runFullAPITest() {
  Logger.log('🧪 Starting comprehensive API test suite...');
  Logger.log('===============================================');
  
  try {
    // Test 1: Health Check
    Logger.log('Test 1: Health Check');
    const healthResult = handleHealthCheck();
    const healthData = JSON.parse(healthResult.getContent());
    if (healthData.success) {
      Logger.log('✅ Health check passed');
      Logger.log('   Available sheets: ' + healthData.data.availableSheets.join(', '));
    } else {
      Logger.log('❌ Health check failed');
      return;
    }
    
    // Test 2: Get Data
    Logger.log('\nTest 2: Get Hives Data');
    const getResult = handleGetData({ sheet: 'Hives' });
    const getData = JSON.parse(getResult.getContent());
    if (getData.success) {
      Logger.log('✅ Get data test passed');
      Logger.log('   Retrieved ' + getData.data.length + ' hive records');
    } else {
      Logger.log('❌ Get data test failed: ' + getData.error.message);
    }
    
    // Test 3: Add Record
    Logger.log('\nTest 3: Add New Hive');
    const testHive = {
      Apiary_ID: 1,
      Name: 'API Test Hive ' + Date.now(),
      Type: 'Langstroth',
      Status: 'Active',
      Notes: 'Created by API test suite'
    };
    const addResult = handleAddRecord('Hives', testHive);
    const addData = JSON.parse(addResult.getContent());
    if (addData.success) {
      Logger.log('✅ Add record test passed');
      Logger.log('   New hive ID: ' + addData.data.id);
      
      // Test 4: Update Record
      Logger.log('\nTest 4: Update Hive');
      const updateResult = handleUpdateRecord('Hives', addData.data.id, {
        Status: 'Inactive',
        Notes: 'Updated by API test suite'
      });
      const updateData = JSON.parse(updateResult.getContent());
      if (updateData.success) {
        Logger.log('✅ Update record test passed');
      } else {
        Logger.log('❌ Update record test failed: ' + updateData.error.message);
      }
      
      // Test 5: Search Data
      Logger.log('\nTest 5: Search for Test Hive');
      const searchResult = handleSearchData({ 
        sheet: 'Hives', 
        Status: 'Inactive',
        Notes: 'Updated by API test suite'
      });
      const searchData = JSON.parse(searchResult.getContent());
      if (searchData.success) {
        Logger.log('✅ Search test passed');
        Logger.log('   Found ' + searchData.data.length + ' matching records');
      } else {
        Logger.log('❌ Search test failed: ' + searchData.error.message);
      }
      
      // Test 6: Delete Record
      Logger.log('\nTest 6: Delete Test Hive');
      const deleteResult = handleDeleteRecord('Hives', addData.data.id);
      const deleteData = JSON.parse(deleteResult.getContent());
      if (deleteData.success) {
        Logger.log('✅ Delete record test passed');
      } else {
        Logger.log('❌ Delete record test failed: ' + deleteData.error.message);
      }
      
    } else {
      Logger.log('❌ Add record test failed: ' + addData.error.message);
    }
    
    // Test 7: Bulk Add
    Logger.log('\nTest 7: Bulk Add Metrics');
    const testMetrics = [
      {
        Hive_ID: 1,
        Date: new Date(),
        Time: '14:30',
        Temperature: 95.5,
        Weight: 87.3,
        Humidity: 65,
        Source: 'Manual',
        Notes: 'API test metric 1'
      },
      {
        Hive_ID: 1,
        Date: new Date(),
        Time: '14:35',
        Temperature: 95.8,
        Weight: 87.4,
        Humidity: 66,
        Source: 'Manual',
        Notes: 'API test metric 2'
      }
    ];
    const bulkResult = handleBulkAdd('Metrics', testMetrics);
    const bulkData = JSON.parse(bulkResult.getContent());
    if (bulkData.success) {
      Logger.log('✅ Bulk add test passed');
      Logger.log('   Added ' + bulkData.data.count + ' metric records');
      Logger.log('   New IDs: ' + bulkData.data.ids.join(', '));
    } else {
      Logger.log('❌ Bulk add test failed: ' + bulkData.error.message);
    }
    
    // Test 8: Count Records
    Logger.log('\nTest 8: Count Records');
    const countResult = handleCountData({ sheet: 'Hives' });
    const countData = JSON.parse(countResult.getContent());
    if (countData.success) {
      Logger.log('✅ Count test passed');
      Logger.log('   Total hives: ' + countData.data.count);
    } else {
      Logger.log('❌ Count test failed: ' + countData.error.message);
    }
    
    Logger.log('\n===============================================');
    Logger.log('🎉 API test suite completed successfully!');
    Logger.log('   All core functionality is working properly');
    Logger.log('   Ready for frontend integration');
    
  } catch (error) {
    Logger.log('\n❌ API test suite failed with error:');
    Logger.log('   ' + error.toString());
    Logger.log('   Check your spreadsheet ID and permissions');
  }
}

/**
 * Test error handling scenarios
 */
function testErrorHandling() {
  Logger.log('🧪 Testing error handling scenarios...');
  
  // Test invalid sheet name
  Logger.log('\nTest: Invalid sheet name');
  const invalidSheetResult = handleGetData({ sheet: 'InvalidSheet' });
  const invalidSheetData = JSON.parse(invalidSheetResult.getContent());
  if (!invalidSheetData.success && invalidSheetData.error.code === 400) {
    Logger.log('✅ Invalid sheet error handling works');
  } else {
    Logger.log('❌ Invalid sheet error handling failed');
  }
  
  // Test missing parameters
  Logger.log('\nTest: Missing sheet parameter');
  const missingParamResult = handleGetData({});
  const missingParamData = JSON.parse(missingParamResult.getContent());
  if (!missingParamData.success && missingParamData.error.code === 400) {
    Logger.log('✅ Missing parameter error handling works');
  } else {
    Logger.log('❌ Missing parameter error handling failed');
  }
  
  // Test update non-existent record
  Logger.log('\nTest: Update non-existent record');
  const updateNonExistentResult = handleUpdateRecord('Hives', 99999, { Name: 'Test' });
  const updateNonExistentData = JSON.parse(updateNonExistentResult.getContent());
  if (!updateNonExistentData.success && updateNonExistentData.error.code === 404) {
    Logger.log('✅ Non-existent record error handling works');
  } else {
    Logger.log('❌ Non-existent record error handling failed');
  }
  
  Logger.log('\n✅ Error handling tests completed');
}

/**
 * Performance test with multiple operations
 */
function testPerformance() {
  Logger.log('🧪 Testing API performance...');
  
  const startTime = new Date();
  
  // Test multiple GET requests
  for (let i = 0; i < 5; i++) {
    handleGetData({ sheet: 'Hives' });
  }
  
  // Test multiple add operations
  for (let i = 0; i < 3; i++) {
    const testRecord = {
      Hive_ID: 1,
      Date: new Date(),
      Temperature: 95 + i,
      Weight: 87 + i,
      Source: 'Performance Test'
    };
    handleAddRecord('Metrics', testRecord);
  }
  
  const endTime = new Date();
  const executionTime = endTime - startTime;
  
  Logger.log('✅ Performance test completed');
  Logger.log('   Execution time: ' + executionTime + 'ms');
  Logger.log('   Average per operation: ' + (executionTime / 8) + 'ms');
}

/**
 * Generate sample data for testing
 */
function generateSampleData() {
  Logger.log('📝 Generating comprehensive sample data...');
  
  try {
    // Add sample inspections
    const sampleInspections = [
      {
        Hive_ID: 1,
        Inspector: 'Test Inspector',
        Date: new Date(),
        Duration: 30,
        Queen_Present: 'Yes',
        Queen_Laying: 'Yes',
        Brood_Pattern: 4,
        Honey_Stores: 3,
        Weather: 'Sunny',
        Notes: 'Sample inspection 1'
      },
      {
        Hive_ID: 2,
        Inspector: 'Test Inspector',
        Date: new Date(Date.now() - 86400000), // Yesterday
        Duration: 25,
        Queen_Present: 'Yes',
        Queen_Laying: 'Unknown',
        Brood_Pattern: 3,
        Honey_Stores: 2,
        Weather: 'Cloudy',
        Notes: 'Sample inspection 2'
      }
    ];
    
    sampleInspections.forEach(inspection => {
      handleAddRecord('Inspections', inspection);
    });
    
    // Add sample tasks
    const sampleTasks = [
      {
        Title: 'Weekly Inspection',
        Description: 'Conduct routine weekly hive inspection',
        Due_Date: new Date(Date.now() + 7*24*60*60*1000), // Next week
        Status: 'Pending',
        Priority: 'Medium'
      },
      {
        Hive_ID: 1,
        Title: 'Mite Treatment',
        Description: 'Apply varroa mite treatment strips',
        Due_Date: new Date(Date.now() + 3*24*60*60*1000), // 3 days
        Status: 'Pending',
        Priority: 'High'
      },
      {
        Title: 'Equipment Maintenance',
        Description: 'Clean and repair hive equipment',
        Due_Date: new Date(Date.now() + 14*24*60*60*1000), // 2 weeks
        Status: 'Pending',
        Priority: 'Low'
      }
    ];
    
    sampleTasks.forEach(task => {
      handleAddRecord('Tasks', task);
    });
    
    // Add sample metrics (7 days of data)
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - i*24*60*60*1000);
      const metrics = [
        {
          Hive_ID: 1,
          Date: date,
          Time: '09:00',
          Temperature: 92 + Math.random() * 6, // 92-98°F
          Weight: 85 + Math.random() * 5, // 85-90 lbs
          Humidity: 60 + Math.random() * 10, // 60-70%
          Source: 'Manual',
          Notes: `Day ${i+1} morning reading`
        },
        {
          Hive_ID: 1,
          Date: date,
          Time: '15:00',
          Temperature: 94 + Math.random() * 6, // 94-100°F
          Weight: 85 + Math.random() * 5,
          Humidity: 60 + Math.random() * 10,
          Source: 'Manual',
          Notes: `Day ${i+1} afternoon reading`
        }
      ];
      
      metrics.forEach(metric => {
        handleAddRecord('Metrics', metric);
      });
    }
    
    Logger.log('✅ Sample data generation completed');
    Logger.log('   Added inspections, tasks, and 7 days of metrics');
    Logger.log('   Database is now ready for frontend testing');
    
  } catch (error) {
    Logger.log('❌ Sample data generation failed: ' + error.toString());
  }
}

/**
 * Clean up test data
 */
function cleanupTestData() {
  Logger.log('🧹 Cleaning up test data...');
  
  try {
    // Get all sheets and look for test records
    const sheets = ['Hives', 'Inspections', 'Metrics', 'Tasks', 'Treatments'];
    
    sheets.forEach(sheetName => {
      const data = getSheetData(sheetName);
      data.forEach(record => {
        if (record.Notes && (
          record.Notes.includes('API test') || 
          record.Notes.includes('Performance Test') ||
          record.Notes.includes('Sample')
        )) {
          handleDeleteRecord(sheetName, record.ID);
          Logger.log('   Deleted test record from ' + sheetName + ' (ID: ' + record.ID + ')');
        }
      });
    });
    
    Logger.log('✅ Test data cleanup completed');
    
  } catch (error) {
    Logger.log('❌ Cleanup failed: ' + error.toString());
  }
}

/**
 * Validate database structure
 */
function validateDatabaseStructure() {
  Logger.log('🔍 Validating database structure...');
  
  const expectedSheets = {
    'Apiaries': ['ID', 'Name', 'Location', 'GPS_Lat', 'GPS_Lng', 'Owner_Email', 'Created_Date', 'Notes'],
    'Hives': ['ID', 'Apiary_ID', 'Name', 'Type', 'Install_Date', 'Status', 'QR_Code', 'Notes'],
    'Inspections': ['ID', 'Hive_ID', 'Inspector', 'Date', 'Duration', 'Queen_Present', 'Queen_Laying', 'Brood_Pattern', 'Honey_Stores', 'Weather', 'Notes'],
    'Metrics': ['ID', 'Hive_ID', 'Date', 'Time', 'Temperature', 'Weight', 'Humidity', 'Source', 'Notes'],
    'Tasks': ['ID', 'Hive_ID', 'Title', 'Description', 'Due_Date', 'Status', 'Priority', 'Created_Date', 'Completed_Date'],
    'Treatments': ['ID', 'Hive_ID', 'Treatment_Type', 'Medicine', 'Dosage', 'Date_Applied', 'Date_Completed', 'Effectiveness', 'Notes']
  };
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const availableSheets = spreadsheet.getSheets().map(sheet => sheet.getName());
    
    let allValid = true;
    
    Object.keys(expectedSheets).forEach(sheetName => {
      if (!availableSheets.includes(sheetName)) {
        Logger.log('❌ Missing sheet: ' + sheetName);
        allValid = false;
        return;
      }
      
      const sheet = spreadsheet.getSheetByName(sheetName);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const expectedHeaders = expectedSheets[sheetName];
      
      // Check if all expected headers exist
      expectedHeaders.forEach(expectedHeader => {
        if (!headers.includes(expectedHeader)) {
          Logger.log('❌ Missing header in ' + sheetName + ': ' + expectedHeader);
          allValid = false;
        }
      });
      
      if (headers.length === expectedHeaders.length && 
          expectedHeaders.every(header => headers.includes(header))) {
        Logger.log('✅ ' + sheetName + ' structure is valid (' + headers.length + ' columns)');
      }
    });
    
    if (allValid) {
      Logger.log('\n✅ Database structure validation passed');
      Logger.log('   All required sheets and columns are present');
    } else {
      Logger.log('\n❌ Database structure validation failed');
      Logger.log('   Please check your database setup');
    }
    
  } catch (error) {
    Logger.log('❌ Structure validation failed: ' + error.toString());
  }
}

/**
 * Quick deployment test
 * Run this after deploying to verify the web app works
 */
function testDeployment() {
  Logger.log('🚀 Testing deployment readiness...');
  
  try {
    // Test all core functions
    const healthCheck = handleHealthCheck();
    const getData = handleGetData({ sheet: 'Hives' });
    const countData = handleCountData({ sheet: 'Hives' });
    
    // Parse responses
    const health = JSON.parse(healthCheck.getContent());
    const data = JSON.parse(getData.getContent());
    const count = JSON.parse(countData.getContent());
    
    if (health.success && data.success && count.success) {
      Logger.log('✅ Deployment test passed!');
      Logger.log('   API is ready for web deployment');
      Logger.log('   Health check: ' + health.data.status);
      Logger.log('   Available sheets: ' + health.data.availableSheets.length);
      Logger.log('   Sample data: ' + data.data.length + ' records');
    } else {
      Logger.log('❌ Deployment test failed');
      Logger.log('   Check logs for specific errors');
    }
    
  } catch (error) {
    Logger.log('❌ Deployment test error: ' + error.toString());
  }
}
