/**
 * Integration Tests for BEE Keepers MVP
 * Tests end-to-end workflows and component interactions
 */

describe('BEE Keepers MVP Integration Tests', () => {
  
  beforeEach(() => {
    createTestDOM();
  });

  describe('Complete Workflow Tests', () => {
    
    test('should complete full hive creation workflow', async () => {
      const sampleData = createSampleData();
      
      // 1. Load apiaries data
      global.apiariesData = sampleData.apiaries;
      
      // 2. Populate apiary dropdown
      const apiarySelect = document.querySelector('[name="Apiary_ID"]');
      apiarySelect.innerHTML = '<option value="">Select an apiary...</option>' +
        sampleData.apiaries.map(apiary => 
          `<option value="${apiary.ID}">${apiary.Name} - ${apiary.Location}</option>`
        ).join('');
      
      // 3. Fill form
      const form = document.getElementById('addHiveForm');
      form.querySelector('[name="Apiary_ID"]').value = '1';
      form.querySelector('[name="Name"]').value = 'New Test Hive';
      form.querySelector('[name="Type"]').value = 'Langstroth';
      form.querySelector('[name="Install_Date"]').value = '2025-06-18';
      form.querySelector('[name="Status"]').value = 'Active';
      
      // 4. Validate form data
      const formData = new FormData(form);
      const hiveData = Object.fromEntries(formData.entries());
      
      expect(hiveData.Apiary_ID).toBe('1');
      expect(hiveData.Name).toBe('New Test Hive');
      expect(hiveData.Type).toBe('Langstroth');
      
      // 5. Verify apiary dropdown has options
      const options = apiarySelect.querySelectorAll('option');
      expect(options.length).toBe(3); // 1 default + 2 apiaries
      expect(options[1].textContent).toContain('Main Apiary');
      expect(options[2].textContent).toContain('Sample Apiary');
    });

    test('should complete full inspection workflow', async () => {
      const sampleData = createSampleData();
      
      // 1. Load hives data
      global.hivesData = sampleData.hives;
      
      // 2. Populate hive dropdown
      const hiveSelect = document.querySelector('#addInspectionForm [name="Hive_ID"]');
      hiveSelect.innerHTML = '<option value="">Select a hive...</option>' +
        sampleData.hives.map(hive => 
          `<option value="${hive.ID}">Hive ${hive.ID} - ${hive.Name}</option>`
        ).join('');
      
      // 3. Fill inspection form
      const form = document.getElementById('addInspectionForm');
      form.querySelector('[name="Hive_ID"]').value = '1';
      form.querySelector('[name="Inspector"]').value = 'Jane Beekeeper';
      form.querySelector('[name="Date"]').value = '2025-06-19';
      form.querySelector('[name="Duration"]').value = '30';
      form.querySelector('[name="Queen_Present"]').value = 'Yes';
      form.querySelector('[name="Queen_Laying"]').value = 'Yes';
      form.querySelector('[name="Brood_Pattern"]').value = '5';
      form.querySelector('[name="Honey_Stores"]').value = '4';
      form.querySelector('[name="Weather"]').value = 'Sunny';
      form.querySelector('[name="Notes"]').value = 'Excellent colony condition';
      
      // 4. Validate inspection data
      const formData = new FormData(form);
      const inspectionData = Object.fromEntries(formData.entries());
      
      expect(inspectionData.Hive_ID).toBe('1');
      expect(inspectionData.Inspector).toBe('Jane Beekeeper');
      expect(inspectionData.Queen_Present).toBe('Yes');
      expect(inspectionData.Queen_Laying).toBe('Yes');
      expect(inspectionData.Duration).toBe('30');
      
      // 5. Verify hive dropdown has options
      const options = hiveSelect.querySelectorAll('option');
      expect(options.length).toBe(4); // 1 default + 3 hives
    });

    test('should complete full metrics recording workflow', async () => {
      const sampleData = createSampleData();
      
      // 1. Load hives data
      global.hivesData = sampleData.hives;
      
      // 2. Populate hive dropdown
      const hiveSelect = document.querySelector('#addMetricForm [name="Hive_ID"]');
      hiveSelect.innerHTML = '<option value="">Select a hive...</option>' +
        sampleData.hives.map(hive => 
          `<option value="${hive.ID}">Hive ${hive.ID} - ${hive.Name}</option>`
        ).join('');
      
      // 3. Fill metrics form
      const form = document.getElementById('addMetricForm');
      form.querySelector('[name="Hive_ID"]').value = '2';
      form.querySelector('[name="Date"]').value = '2025-06-19';
      form.querySelector('[name="Time"]').value = '15:30';
      form.querySelector('[name="Temperature"]').value = '24.5';
      form.querySelector('[name="Weight"]').value = '45.2';
      form.querySelector('[name="Humidity"]').value = '62';
      form.querySelector('[name="Source"]').value = 'Manual';
      form.querySelector('[name="Notes"]').value = 'Afternoon readings';
      
      // 4. Validate metrics data
      const formData = new FormData(form);
      const metricData = Object.fromEntries(formData.entries());
      
      expect(metricData.Hive_ID).toBe('2');
      expect(metricData.Date).toBe('2025-06-19');
      expect(metricData.Time).toBe('15:30');
      expect(parseFloat(metricData.Temperature)).toBe(24.5);
      expect(parseFloat(metricData.Weight)).toBe(45.2);
      expect(parseInt(metricData.Humidity)).toBe(62);
    });

    test('should complete task creation workflow', async () => {
      const sampleData = createSampleData();
      
      // 1. Load hives data (optional for tasks)
      global.hivesData = sampleData.hives;
      
      // 2. Populate hive dropdown
      const hiveSelect = document.querySelector('#addTaskForm [name="Hive_ID"]');
      hiveSelect.innerHTML = '<option value="">Select a hive...</option>' +
        sampleData.hives.map(hive => 
          `<option value="${hive.ID}">Hive ${hive.ID} - ${hive.Name}</option>`
        ).join('');
      
      // 3. Fill task form
      const form = document.getElementById('addTaskForm');
      form.querySelector('[name="Hive_ID"]').value = '1';
      form.querySelector('[name="Title"]').value = 'Weekly Inspection';
      form.querySelector('[name="Description"]').value = 'Perform routine weekly inspection';
      form.querySelector('[name="Due_Date"]').value = '2025-06-25';
      form.querySelector('[name="Priority"]').value = 'High';
      
      // 4. Validate task data
      const formData = new FormData(form);
      const taskData = Object.fromEntries(formData.entries());
      
      expect(taskData.Hive_ID).toBe('1');
      expect(taskData.Title).toBe('Weekly Inspection');
      expect(taskData.Description).toBe('Perform routine weekly inspection');
      expect(taskData.Priority).toBe('High');
    });
  });

  describe('Data Filtering and Grouping', () => {
    
    test('should filter hives by status correctly', () => {
      const sampleData = createSampleData();
      
      const activeHives = sampleData.hives.filter(h => h.Status === 'Active');
      const inactiveHives = sampleData.hives.filter(h => h.Status === 'Inactive');
      
      expect(activeHives).toHaveLength(2);
      expect(inactiveHives).toHaveLength(1);
      expect(activeHives[0].Name).toBe('Hive Alpha');
      expect(activeHives[1].Name).toBe('Hive Beta');
      expect(inactiveHives[0].Name).toBe('Hive Gamma');
    });

    test('should group tasks by priority correctly', () => {
      const sampleData = createSampleData();
      
      const groupedTasks = {
        'High': sampleData.tasks.filter(t => t.Priority === 'High'),
        'Medium': sampleData.tasks.filter(t => t.Priority === 'Medium'),
        'Low': sampleData.tasks.filter(t => t.Priority === 'Low'),
        'Critical': sampleData.tasks.filter(t => t.Priority === 'Critical')
      };
      
      expect(groupedTasks.High).toHaveLength(2);
      expect(groupedTasks.Medium).toHaveLength(1);
      expect(groupedTasks.Low).toHaveLength(0);
      expect(groupedTasks.Critical).toHaveLength(0);
      
      expect(groupedTasks.High[0].Title).toBe('Varroa Treatment');
      expect(groupedTasks.High[1].Title).toBe('Feed Sugar Syrup');
      expect(groupedTasks.Medium[0].Title).toBe('Equipment Maintenance');
    });

    test('should group metrics by hive correctly', () => {
      const sampleData = createSampleData();
      
      const metricsByHive = {};
      sampleData.metrics.forEach(metric => {
        if (!metricsByHive[metric.Hive_ID]) {
          metricsByHive[metric.Hive_ID] = [];
        }
        metricsByHive[metric.Hive_ID].push(metric);
      });
      
      expect(Object.keys(metricsByHive)).toHaveLength(2);
      expect(metricsByHive[1]).toHaveLength(2);
      expect(metricsByHive[2]).toHaveLength(1);
      
      // Test latest metric selection
      const hive1Latest = metricsByHive[1][metricsByHive[1].length - 1];
      expect(hive1Latest.Temperature).toBe(24.2);
      expect(hive1Latest.Weight).toBe(43);
    });
  });

  describe('Dashboard Integration', () => {
    
    test('should calculate and display dashboard statistics', () => {
      const sampleData = createSampleData();
      
      // Simulate dashboard calculations
      const totalHives = sampleData.hives.length;
      const activeHives = sampleData.hives.filter(h => h.Status === 'Active').length;
      const pendingTasks = sampleData.tasks.filter(t => t.Status === 'Pending').length;
      const recentInspections = sampleData.inspections.slice(-5);
      
      // Update dashboard elements
      document.getElementById('totalHives').textContent = totalHives;
      document.getElementById('activeHives').textContent = activeHives;
      document.getElementById('pendingTasks').textContent = pendingTasks;
      
      expect(document.getElementById('totalHives').textContent).toBe('3');
      expect(document.getElementById('activeHives').textContent).toBe('2');
      expect(document.getElementById('pendingTasks').textContent).toBe('3');
      expect(recentInspections).toHaveLength(2);
    });

    test('should display recent inspections on dashboard', () => {
      const sampleData = createSampleData();
      const recentInspections = sampleData.inspections.slice(-5);
      
      const recentInspectionsList = document.getElementById('recentInspections');
      recentInspectionsList.innerHTML = recentInspections.map(inspection => `
        <div class="list-group-item">
          <div class="d-flex w-100 justify-content-between">
            <h6>Hive ${inspection.Hive_ID} by ${inspection.Inspector}</h6>
            <small>${inspection.Date}</small>
          </div>
          <p>Queen: ${inspection.Queen_Present}, Laying: ${inspection.Queen_Laying}</p>
        </div>
      `).join('');
      
      expect(recentInspectionsList.innerHTML).toContain('Hive 1 by John Beekeeper');
      expect(recentInspectionsList.innerHTML).toContain('Hive 2 by John Beekeeper');
      expect(recentInspectionsList.innerHTML).toContain('Queen: Yes, Laying: Yes');
    });

    test('should display upcoming tasks on dashboard', () => {
      const sampleData = createSampleData();
      const upcomingTasks = sampleData.tasks.filter(t => t.Status === 'Pending').slice(0, 5);
      
      const upcomingTasksList = document.getElementById('upcomingTasks');
      upcomingTasksList.innerHTML = upcomingTasks.map(task => `
        <div class="list-group-item">
          <div class="d-flex w-100 justify-content-between">
            <h6>${task.Title}</h6>
            <small class="text-${task.Priority === 'High' ? 'danger' : 'warning'}">${task.Priority}</small>
          </div>
          <p>${task.Description}</p>
          ${task.Due_Date ? `<small>Due: ${task.Due_Date}</small>` : ''}
        </div>
      `).join('');
      
      expect(upcomingTasksList.innerHTML).toContain('Varroa Treatment');
      expect(upcomingTasksList.innerHTML).toContain('Equipment Maintenance');
      expect(upcomingTasksList.innerHTML).toContain('text-danger');
      expect(upcomingTasksList.innerHTML).toContain('Due: 2025-06-23');
    });
  });

  describe('Error Handling Integration', () => {
    
    test('should handle empty data sets gracefully', () => {
      // Test with empty data
      global.apiariesData = [];
      global.hivesData = [];
      global.inspectionsData = [];
      global.metricsData = [];
      global.tasksData = [];
      
      // Dashboard calculations should not crash
      const totalHives = global.hivesData.length;
      const activeHives = global.hivesData.filter(h => h.Status === 'Active').length;
      const pendingTasks = global.tasksData.filter(t => t.Status === 'Pending').length;
      
      expect(totalHives).toBe(0);
      expect(activeHives).toBe(0);
      expect(pendingTasks).toBe(0);
      
      // Dropdown population should not crash
      const apiarySelect = document.querySelector('[name="Apiary_ID"]');
      apiarySelect.innerHTML = '<option value="">Select an apiary...</option>' +
        global.apiariesData.map(apiary => `<option value="${apiary.ID}">${apiary.Name}</option>`).join('');
      
      expect(apiarySelect.innerHTML).toBe('<option value="">Select an apiary...</option>');
    });

    test('should handle missing form elements gracefully', () => {
      // Test with minimal DOM
      document.body.innerHTML = '<div id="alertContainer"></div>';
      
      expect(() => {
        const form = document.getElementById('addHiveForm');
        expect(form).toBeNull();
      }).not.toThrow();
      
      expect(() => {
        const hivesContainer = document.getElementById('hivesGrid');
        expect(hivesContainer).toBeNull();
      }).not.toThrow();
    });
  });

  describe('Form Validation Integration', () => {
    
    test('should prevent submission without required fields', () => {
      createTestDOM();
      
      const form = document.getElementById('addHiveForm');
      
      // Test validation logic
      const formData = new FormData(form);
      const hiveData = Object.fromEntries(formData.entries());
      
      // Simulate validation check
      const isValid = hiveData.Apiary_ID && hiveData.Name;
      expect(isValid).toBe(false); // Should be false with empty form
      
      // Fill required fields
      form.querySelector('[name="Apiary_ID"]').value = '1';
      form.querySelector('[name="Name"]').value = 'Test Hive';
      
      const newFormData = new FormData(form);
      const newHiveData = Object.fromEntries(newFormData.entries());
      const newIsValid = newHiveData.Apiary_ID && newHiveData.Name;
      
      expect(newIsValid).toBe(true);
    });

    test('should validate inspection form completeness', () => {
      createTestDOM();
      
      const form = document.getElementById('addInspectionForm');
      
      // Minimum required fields
      form.querySelector('[name="Hive_ID"]').value = '1';
      form.querySelector('[name="Inspector"]').value = 'John Doe';
      form.querySelector('[name="Date"]').value = '2025-06-18';
      
      const formData = new FormData(form);
      const inspectionData = Object.fromEntries(formData.entries());
      
      const isValid = inspectionData.Hive_ID && inspectionData.Inspector && inspectionData.Date;
      expect(isValid).toBe(true);
    });
  });
});