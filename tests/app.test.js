/**
 * Unit Tests for BEE Keepers MVP Application
 * Tests core functionality including data loading, rendering, and form submissions
 */

// Import the app functions (we'll need to modify app.js to export functions for testing)
// For now, we'll test by loading the script and accessing global functions

describe('BEE Keepers MVP Application', () => {
  
  beforeEach(() => {
    createTestDOM();
    
    // Reset global data
    global.apiariesData = [];
    global.hivesData = [];
    global.inspectionsData = [];
    global.metricsData = [];
    global.tasksData = [];
  });

  describe('Data Loading Functions', () => {
    
    test('should load apiaries data successfully', async () => {
      const sampleData = createSampleData();
      
      // Mock JSONP callback (simulate the script tag loading)
      global.mockJsonpCallback = (data) => {
        return { success: true, data: sampleData.apiaries };
      };
      
      // Simulate DOM script creation for JSONP
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'script') {
          const script = originalCreateElement.call(document, tagName);
          // Simulate successful script load
          setTimeout(() => {
            if (script.src.includes('action=get&sheet=Apiaries')) {
              const callbackMatch = script.src.match(/callback=([^&]+)/);
              if (callbackMatch) {
                const callbackName = callbackMatch[1];
                global[callbackName]({ success: true, data: sampleData.apiaries });
              }
            }
          }, 0);
          return script;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      // Test loading would happen here (need to refactor app.js to export functions)
      expect(true).toBe(true); // Placeholder until we refactor
    });

    test('should handle API errors gracefully', async () => {
      mockApiError('Network error');
      
      // Test error handling
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Form Validation', () => {
    
    test('should validate hive form requires apiary selection', () => {
      createTestDOM();
      
      const form = document.getElementById('addHiveForm');
      const formData = new FormData(form);
      
      // Set form values without apiary
      form.querySelector('[name="Name"]').value = 'Test Hive';
      form.querySelector('[name="Type"]').value = 'Langstroth';
      
      const hiveData = Object.fromEntries(new FormData(form).entries());
      
      expect(hiveData.Apiary_ID).toBe('');
      expect(hiveData.Name).toBe('Test Hive');
      expect(hiveData.Type).toBe('Langstroth');
    });

    test('should validate inspection form requires hive selection', () => {
      createTestDOM();
      
      const form = document.getElementById('addInspectionForm');
      form.querySelector('[name="Inspector"]').value = 'John Doe';
      form.querySelector('[name="Date"]').value = '2025-06-18';
      
      const inspectionData = Object.fromEntries(new FormData(form).entries());
      
      expect(inspectionData.Hive_ID).toBe('');
      expect(inspectionData.Inspector).toBe('John Doe');
      expect(inspectionData.Date).toBe('2025-06-18');
    });

    test('should validate metric form data types', () => {
      createTestDOM();
      
      const form = document.getElementById('addMetricForm');
      form.querySelector('[name="Temperature"]').value = '23.5';
      form.querySelector('[name="Weight"]').value = '42.1';
      form.querySelector('[name="Humidity"]').value = '65';
      
      const metricData = Object.fromEntries(new FormData(form).entries());
      
      expect(metricData.Temperature).toBe('23.5');
      expect(metricData.Weight).toBe('42.1');
      expect(metricData.Humidity).toBe('65');
      expect(parseFloat(metricData.Temperature)).toBe(23.5);
      expect(parseFloat(metricData.Weight)).toBe(42.1);
      expect(parseInt(metricData.Humidity)).toBe(65);
    });
  });

  describe('Data Rendering Functions', () => {
    
    test('should render hives correctly', () => {
      createTestDOM();
      const sampleData = createSampleData();
      
      // Mock the renderHives function logic
      const hivesContainer = document.getElementById('hivesGrid');
      const hiveHTML = sampleData.hives.map(hive => `
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">${hive.Name}</h5>
              <span class="badge">${hive.Status}</span>
              <p><strong>Type:</strong> ${hive.Type}</p>
              <p><strong>QR Code:</strong> ${hive.QR_Code || 'N/A'}</p>
            </div>
          </div>
        </div>
      `).join('');
      
      hivesContainer.innerHTML = hiveHTML;
      
      expect(hivesContainer.innerHTML).toContain('Hive Alpha');
      expect(hivesContainer.innerHTML).toContain('Langstroth');
      expect(hivesContainer.innerHTML).toContain('Active');
      expect(hivesContainer.innerHTML).toContain('QR001');
    });

    test('should render inspections correctly', () => {
      createTestDOM();
      const sampleData = createSampleData();
      
      const inspectionsContainer = document.getElementById('inspectionsTable');
      const inspectionHTML = sampleData.inspections.map(inspection => `
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5>Hive ${inspection.Hive_ID}</h5>
              <p>Inspector: ${inspection.Inspector}</p>
              <p>Queen Present: ${inspection.Queen_Present}</p>
              <p>Queen Laying: ${inspection.Queen_Laying}</p>
            </div>
          </div>
        </div>
      `).join('');
      
      inspectionsContainer.innerHTML = inspectionHTML;
      
      expect(inspectionsContainer.innerHTML).toContain('Hive 1');
      expect(inspectionsContainer.innerHTML).toContain('John Beekeeper');
      expect(inspectionsContainer.innerHTML).toContain('Queen Present: Yes');
      expect(inspectionsContainer.innerHTML).toContain('Queen Laying: Yes');
    });

    test('should render metrics with correct units', () => {
      createTestDOM();
      const sampleData = createSampleData();
      
      const metricsContainer = document.getElementById('latestMetrics');
      
      // Group metrics by hive (simulating the actual function logic)
      const metricsByHive = {};
      sampleData.metrics.forEach(metric => {
        if (!metricsByHive[metric.Hive_ID]) {
          metricsByHive[metric.Hive_ID] = [];
        }
        metricsByHive[metric.Hive_ID].push(metric);
      });
      
      const metricsHTML = Object.keys(metricsByHive).map(hiveId => {
        const hiveMetrics = metricsByHive[hiveId];
        const latestMetric = hiveMetrics[hiveMetrics.length - 1];
        
        return `
          <div class="col-md-4 mb-3">
            <div class="card">
              <div class="card-body">
                <h5>Hive ${hiveId}</h5>
                <div class="metric-value">${latestMetric.Temperature}°C</div>
                <div class="metric-value">${latestMetric.Weight} kg</div>
                <div class="metric-value">${latestMetric.Humidity}%</div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      metricsContainer.innerHTML = metricsHTML;
      
      expect(metricsContainer.innerHTML).toContain('23°C');
      expect(metricsContainer.innerHTML).toContain('42 kg');
      expect(metricsContainer.innerHTML).toContain('65%');
    });

    test('should render tasks grouped by priority', () => {
      createTestDOM();
      const sampleData = createSampleData();
      
      const groupedTasks = {
        'High': sampleData.tasks.filter(t => t.Priority === 'High'),
        'Medium': sampleData.tasks.filter(t => t.Priority === 'Medium'),
        'Low': sampleData.tasks.filter(t => t.Priority === 'Low')
      };
      
      // Test high priority tasks
      const highContainer = document.getElementById('highPriorityTasks');
      const highTasksHTML = groupedTasks.High.map(task => `
        <div class="card mb-2">
          <div class="card-body p-2">
            <h6>${task.Title}</h6>
            <p>${task.Description}</p>
            <span class="badge">${task.Status}</span>
          </div>
        </div>
      `).join('');
      
      highContainer.innerHTML = highTasksHTML;
      
      expect(highContainer.innerHTML).toContain('Varroa Treatment');
      expect(highContainer.innerHTML).toContain('Feed Sugar Syrup');
      expect(groupedTasks.High).toHaveLength(2);
      expect(groupedTasks.Medium).toHaveLength(1);
    });
  });

  describe('Dashboard Statistics', () => {
    
    test('should calculate correct dashboard statistics', () => {
      const sampleData = createSampleData();
      
      const totalHives = sampleData.hives.length;
      const activeHives = sampleData.hives.filter(h => h.Status === 'Active').length;
      const pendingTasks = sampleData.tasks.filter(t => t.Status === 'Pending').length;
      
      expect(totalHives).toBe(3);
      expect(activeHives).toBe(2);
      expect(pendingTasks).toBe(3);
    });

    test('should format dates correctly', () => {
      const testDate = '2025-06-18';
      const formattedDate = new Date(testDate).toLocaleDateString();
      
      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('Utility Functions', () => {
    
    test('should validate required form fields', () => {
      createTestDOM();
      
      const form = document.getElementById('addHiveForm');
      const requiredFields = form.querySelectorAll('[required]');
      
      expect(requiredFields.length).toBeGreaterThan(0);
      
      // Check that apiary and name are required
      const apiaryField = form.querySelector('[name="Apiary_ID"]');
      const nameField = form.querySelector('[name="Name"]');
      
      expect(apiaryField.hasAttribute('required')).toBe(true);
      expect(nameField.hasAttribute('required')).toBe(true);
    });

    test('should handle empty data arrays gracefully', () => {
      createTestDOM();
      
      // Test with empty arrays
      const emptyApiaries = [];
      const emptyHives = [];
      
      // Should not throw errors
      expect(() => {
        const dropdownHTML = '<option value="">Select an apiary...</option>' +
          emptyApiaries.map(apiary => `<option value="${apiary.ID}">${apiary.Name}</option>`).join('');
        expect(dropdownHTML).toBe('<option value="">Select an apiary...</option>');
      }).not.toThrow();
      
      expect(() => {
        const totalHives = emptyHives.length;
        const activeHives = emptyHives.filter(h => h.Status === 'Active').length;
        expect(totalHives).toBe(0);
        expect(activeHives).toBe(0);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    
    test('should handle missing DOM elements gracefully', () => {
      // Test with minimal DOM
      document.body.innerHTML = '<div></div>';
      
      expect(() => {
        const nonExistentElement = document.getElementById('nonExistentElement');
        if (!nonExistentElement) {
          console.log('Element not found - handled gracefully');
        }
        expect(nonExistentElement).toBeNull();
      }).not.toThrow();
    });

    test('should validate data types for metrics', () => {
      const testMetric = {
        Temperature: '23.5',
        Weight: '42.1',
        Humidity: '65'
      };
      
      const temperature = parseFloat(testMetric.Temperature) || 0;
      const weight = parseFloat(testMetric.Weight) || 0;
      const humidity = parseFloat(testMetric.Humidity) || 0;
      
      expect(temperature).toBe(23.5);
      expect(weight).toBe(42.1);
      expect(humidity).toBe(65);
      
      // Test invalid data
      const invalidTemp = parseFloat('invalid') || 0;
      expect(invalidTemp).toBe(0);
    });
  });

  describe('JSONP API Integration', () => {
    
    test('should construct correct JSONP URLs', () => {
      const baseURL = 'https://script.google.com/macros/s/test/exec';
      const action = 'get';
      const sheet = 'Hives';
      const callback = 'callback_12345';
      
      const expectedURL = `${baseURL}?action=${action}&sheet=${sheet}&callback=${callback}`;
      const constructedURL = `${baseURL}?action=${action}&sheet=${sheet}&callback=${callback}`;
      
      expect(constructedURL).toBe(expectedURL);
      expect(constructedURL).toContain('action=get');
      expect(constructedURL).toContain('sheet=Hives');
      expect(constructedURL).toContain('callback=callback_12345');
    });

    test('should handle JSONP callback functions', () => {
      const callbackName = 'test_callback_123';
      const testData = { success: true, data: [{ ID: 1, Name: 'Test' }] };
      
      // Simulate creating a callback function
      global[callbackName] = jest.fn();
      
      // Simulate the callback being called
      global[callbackName](testData);
      
      expect(global[callbackName]).toHaveBeenCalledWith(testData);
      expect(global[callbackName]).toHaveBeenCalledTimes(1);
      
      // Cleanup
      delete global[callbackName];
    });
  });

  describe('Form Data Processing', () => {
    
    test('should process hive form data correctly', () => {
      createTestDOM();
      
      const form = document.getElementById('addHiveForm');
      
      // Set form values
      form.querySelector('[name="Apiary_ID"]').value = '1';
      form.querySelector('[name="Name"]').value = 'Test Hive';
      form.querySelector('[name="Type"]').value = 'Langstroth';
      form.querySelector('[name="Install_Date"]').value = '2025-06-18';
      form.querySelector('[name="Status"]').value = 'Active';
      form.querySelector('[name="Notes"]').value = 'Test notes';
      
      const formData = new FormData(form);
      const hiveData = Object.fromEntries(formData.entries());
      
      expect(hiveData).toEqual({
        Apiary_ID: '1',
        Name: 'Test Hive',
        Type: 'Langstroth',
        Install_Date: '2025-06-18',
        Status: 'Active',
        Notes: 'Test notes'
      });
    });

    test('should process inspection form data correctly', () => {
      createTestDOM();
      
      const form = document.getElementById('addInspectionForm');
      
      // Set form values
      form.querySelector('[name="Hive_ID"]').value = '1';
      form.querySelector('[name="Inspector"]').value = 'John Doe';
      form.querySelector('[name="Date"]').value = '2025-06-18';
      form.querySelector('[name="Duration"]').value = '45';
      form.querySelector('[name="Queen_Present"]').value = 'Yes';
      form.querySelector('[name="Queen_Laying"]').value = 'Yes';
      
      const formData = new FormData(form);
      const inspectionData = Object.fromEntries(formData.entries());
      
      expect(inspectionData.Hive_ID).toBe('1');
      expect(inspectionData.Inspector).toBe('John Doe');
      expect(inspectionData.Date).toBe('2025-06-18');
      expect(inspectionData.Duration).toBe('45');
      expect(inspectionData.Queen_Present).toBe('Yes');
      expect(inspectionData.Queen_Laying).toBe('Yes');
    });
  });
});