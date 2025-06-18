// Test setup file for BEE Keepers MVP
import 'jest-environment-jsdom';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Mock fetch API
global.fetch = jest.fn();

// Mock Bootstrap Modal
global.bootstrap = {
  Modal: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
    hide: jest.fn(),
  })),
  getInstance: jest.fn().mockReturnValue({
    hide: jest.fn(),
  }),
};

// Mock Chart.js
global.Chart = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  update: jest.fn(),
}));

// Setup DOM
beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  
  // Reset mocks
  jest.clearAllMocks();
  fetch.mockClear();
});

// Helper function to create DOM elements for testing
global.createTestDOM = () => {
  document.body.innerHTML = `
    <div id="alertContainer"></div>
    <div id="hivesGrid"></div>
    <div id="inspectionsTable"></div>
    <div id="latestMetrics"></div>
    <div id="highPriorityTasks"></div>
    <div id="mediumPriorityTasks"></div>
    <div id="lowPriorityTasks"></div>
    <div id="totalHives">0</div>
    <div id="activeHives">0</div>
    <div id="pendingTasks">0</div>
    <div id="recentInspections"></div>
    <div id="upcomingTasks"></div>
    <canvas id="temperatureChart"></canvas>
    
    <!-- Forms -->
    <form id="addHiveForm">
      <select name="Apiary_ID" required>
        <option value="">Select an apiary...</option>
      </select>
      <input name="Name" required>
      <select name="Type">
        <option value="Langstroth">Langstroth</option>
      </select>
      <input name="Install_Date" type="date">
      <select name="Status">
        <option value="Active">Active</option>
      </select>
      <textarea name="Notes"></textarea>
    </form>
    
    <form id="addInspectionForm">
      <select name="Hive_ID" required>
        <option value="">Select a hive...</option>
      </select>
      <input name="Inspector" required>
      <input name="Date" type="date" required>
      <input name="Duration" type="number">
      <select name="Queen_Present">
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
      <select name="Queen_Laying">
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
      <select name="Brood_Pattern">
        <option value="5">5 - Excellent</option>
      </select>
      <select name="Honey_Stores">
        <option value="4">4 - Full</option>
      </select>
      <input name="Weather">
      <textarea name="Notes"></textarea>
    </form>
    
    <form id="addMetricForm">
      <select name="Hive_ID" required>
        <option value="">Select a hive...</option>
      </select>
      <input name="Date" type="date" required>
      <input name="Time" type="time">
      <input name="Temperature" type="number" step="0.1">
      <input name="Weight" type="number" step="0.1">
      <input name="Humidity" type="number">
      <select name="Source">
        <option value="Manual">Manual</option>
      </select>
      <textarea name="Notes"></textarea>
    </form>
    
    <form id="addTaskForm">
      <select name="Hive_ID">
        <option value="">Select a hive...</option>
      </select>
      <input name="Title" required>
      <textarea name="Description"></textarea>
      <input name="Due_Date" type="date">
      <select name="Priority">
        <option value="High">High</option>
      </select>
    </form>
  `;
};

// Helper function to create sample data
global.createSampleData = () => ({
  apiaries: [
    { ID: 1, Name: "Main Apiary", Location: "Rietondale", GPS_Lat: -25.73216104, GPS_Lng: 28.22284488, Owner_Email: "beekeeper@email.com", Created_Date: "2025-06-18", Notes: "Primary beekeeping location" },
    { ID: 2, Name: "Sample Apiary", Location: "Rietondale", GPS_Lat: -25.73216104, GPS_Lng: 28.22284488, Owner_Email: "beekeeper@example.com", Created_Date: "2025-06-18", Notes: "Sample apiary for testing" }
  ],
  hives: [
    { ID: 1, Apiary_ID: 1, Name: "Hive Alpha", Type: "Langstroth", Install_Date: "2024-03-01", Status: "Active", QR_Code: "QR001", Notes: "Strong colony" },
    { ID: 2, Apiary_ID: 1, Name: "Hive Beta", Type: "Langstroth", Install_Date: "2024-03-15", Status: "Active", QR_Code: "QR002", Notes: "New colony" },
    { ID: 3, Apiary_ID: 2, Name: "Hive Gamma", Type: "Top Bar", Install_Date: "2024-04-01", Status: "Inactive", QR_Code: "QR003", Notes: "Swarmed" }
  ],
  inspections: [
    { ID: 1, Hive_ID: 1, Inspector: "John Beekeeper", Date: "2025-06-18", Duration: 45, Queen_Present: "Yes", Queen_Laying: "Yes", Brood_Pattern: "5", Honey_Stores: "4", Weather: "Sunny", Notes: "Strong colony" },
    { ID: 2, Hive_ID: 2, Inspector: "John Beekeeper", Date: "2025-06-18", Duration: 30, Queen_Present: "Yes", Queen_Laying: "Yes", Brood_Pattern: "3", Honey_Stores: "2", Weather: "Sunny", Notes: "Progressing well" }
  ],
  metrics: [
    { ID: 1, Hive_ID: 1, Date: "2025-06-18", Time: "14:30", Temperature: 23, Weight: 42, Humidity: 65, Source: "Manual", Notes: "Stable readings" },
    { ID: 2, Hive_ID: 1, Date: "2025-06-17", Time: "09:15", Temperature: 24.2, Weight: 43, Humidity: 68, Source: "Manual", Notes: "Morning readings" },
    { ID: 3, Hive_ID: 2, Date: "2025-06-18", Time: "14:45", Temperature: 25, Weight: 25, Humidity: 67, Source: "Manual", Notes: "Lighter hive" }
  ],
  tasks: [
    { ID: 1, Hive_ID: 1, Title: "Varroa Treatment", Description: "Apply mite treatment", Due_Date: "2025-06-23", Status: "Pending", Priority: "High", Created_Date: "2025-06-18" },
    { ID: 2, Hive_ID: null, Title: "Equipment Maintenance", Description: "Clean spare boxes", Due_Date: "2025-06-28", Status: "Pending", Priority: "Medium", Created_Date: "2025-06-18" },
    { ID: 3, Hive_ID: 2, Title: "Feed Sugar Syrup", Description: "Provide 1:1 syrup", Due_Date: "2025-06-21", Status: "Pending", Priority: "High", Created_Date: "2025-06-18" }
  ]
});

// Mock successful API responses
global.mockApiSuccess = (data) => {
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data })
  });
};

// Mock API errors
global.mockApiError = (message = 'API Error') => {
  fetch.mockRejectedValue(new Error(message));
};