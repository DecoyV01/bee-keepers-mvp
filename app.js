// BEE Keepers MVP - Frontend Application
// Complete JavaScript functionality for beekeeping management system

// Google Apps Script API URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_r-9PZ2zpfS-SCr1E61GeCk-qTpuSnZz_4c3VYjKao_F3OiIotb1WaRGO8dC58b7j/exec';

// Global data storage
let apiariesData = [];
let hivesData = [];
let inspectionsData = [];
let metricsData = [];
let tasksData = [];

// Chart instances
let temperatureChart = null;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('BEE Keepers MVP - Application Starting...');
    initializeApp();
});

// Initialize the application
async function initializeApp() {
    try {
        showAlert('Connecting to BEE Keepers API...', 'info');
        await loadAllData();
        showAlert('Connected to BEE Keepers API!', 'success');
        showSection('dashboard');
        updateDashboard();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showAlert('Unable to connect to API. Please check your connection.', 'danger');
    }
}

// Show/Hide sections
function showSection(sectionName) {
    // Hide all sections
    const sections = ['dashboard', 'hives', 'inspections', 'metrics', 'tasks'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.classList.add('d-none');
        }
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionName);
    if (selectedSection) {
        selectedSection.classList.remove('d-none');
    }

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'hives':
            renderHives();
            break;
        case 'inspections':
            renderInspections();
            break;
        case 'metrics':
            renderMetrics();
            break;
        case 'tasks':
            renderTasks();
            break;
    }
}

// Load all data from API
async function loadAllData() {
    await Promise.all([
        loadApiaries(),
        loadHives(),
        loadInspections(),
        loadMetrics(),
        loadTasks()
    ]);
}

// API call helper
async function apiCall(action, sheet, record = null) {
    if (action === 'get' || action === 'health') {
        // Use JSONP for GET requests to avoid CORS
        return new Promise((resolve, reject) => {
            const callbackName = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            const url = `${GOOGLE_SCRIPT_URL}?action=${action}&sheet=${sheet}&callback=${callbackName}`;
            
            // Create callback function
            window[callbackName] = function(data) {
                document.head.removeChild(script);
                delete window[callbackName];
                resolve(data);
            };
            
            // Create script tag
            const script = document.createElement('script');
            script.src = url;
            script.onerror = function() {
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('API request failed'));
            };
            
            // Add timeout
            setTimeout(() => {
                if (window[callbackName]) {
                    document.head.removeChild(script);
                    delete window[callbackName];
                    reject(new Error('API request timeout'));
                }
            }, 10000);
            
            document.head.appendChild(script);
        });
    } else {
        // Use fetch for POST requests (they still work in most cases)
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    sheet: sheet,
                    record: record
                })
            });
            
            // With no-cors, we can't read the response, so assume success
            return { success: true, data: record };
        } catch (error) {
            console.error('POST request error:', error);
            throw error;
        }
    }
}

// Load functions
async function loadApiaries() {
    try {
        const result = await apiCall('get', 'Apiaries');
        apiariesData = result.data || [];
        console.log('Loaded apiaries:', apiariesData.length);
    } catch (error) {
        console.error('Error loading apiaries:', error);
        apiariesData = [];
        throw error;
    }
}

async function loadHives() {
    try {
        const result = await apiCall('get', 'Hives');
        hivesData = result.data || [];
        console.log('Loaded hives:', hivesData.length);
    } catch (error) {
        console.error('Error loading hives:', error);
        hivesData = [];
        throw error;
    }
}

async function loadInspections() {
    try {
        const result = await apiCall('get', 'Inspections');
        inspectionsData = result.data || [];
        console.log('Loaded inspections:', inspectionsData.length);
    } catch (error) {
        console.error('Error loading inspections:', error);
        inspectionsData = [];
        throw error;
    }
}

async function loadMetrics() {
    try {
        const result = await apiCall('get', 'Metrics');
        metricsData = result.data || [];
        console.log('Loaded metrics:', metricsData.length);
    } catch (error) {
        console.error('Error loading metrics:', error);
        metricsData = [];
        throw error;
    }
}

async function loadTasks() {
    try {
        const result = await apiCall('get', 'Tasks');
        tasksData = result.data || [];
        console.log('Loaded tasks:', tasksData.length);
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasksData = [];
        throw error;
    }
}

// Dashboard functions
function updateDashboard() {
    // Populate dropdowns when dashboard loads
    populateApiarySelects();
    populateHiveSelects();
    
    const totalHives = hivesData.length;
    const activeHives = hivesData.filter(h => h.Status === 'Active').length;
    const pendingTasks = tasksData.filter(t => t.Status === 'Pending').length;
    const recentInspections = inspectionsData.slice(-5);

    document.getElementById('totalHives').textContent = totalHives;
    document.getElementById('activeHives').textContent = activeHives;
    document.getElementById('pendingTasks').textContent = pendingTasks;

    // Recent inspections
    const recentInspectionsList = document.getElementById('recentInspections');
    if (recentInspectionsList) {
        recentInspectionsList.innerHTML = recentInspections.map(inspection => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">Hive ${inspection.Hive_ID} by ${inspection.Inspector}</h6>
                    <small>${formatDate(inspection.Date)}</small>
                </div>
                <p class="mb-1">Queen: ${inspection.Queen_Present || 'Unknown'}, Laying: ${inspection.Queen_Laying || 'Unknown'}</p>
            </div>
        `).join('');
    }

    // Upcoming tasks
    const upcomingTasksList = document.getElementById('upcomingTasks');
    if (upcomingTasksList) {
        const upcomingTasks = tasksData.filter(t => t.Status === 'Pending').slice(0, 5);
        upcomingTasksList.innerHTML = upcomingTasks.map(task => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${task.Title}</h6>
                    <small class="text-${task.Priority === 'Critical' ? 'dark' : task.Priority === 'High' ? 'danger' : task.Priority === 'Medium' ? 'warning' : 'success'}">${task.Priority}</small>
                </div>
                <p class="mb-1">${task.Description || ''}</p>
                ${task.Due_Date ? `<small>Due: ${formatDate(task.Due_Date)}</small>` : ''}
            </div>
        `).join('');
    }
}

// Render functions
function renderHives() {
    const hivesContainer = document.getElementById('hivesGrid');
    if (!hivesContainer) {
        console.log('No hivesGrid element found');
        return;
    }
    
    console.log('Rendering hives:', hivesData.length, 'hives');
    
    // Populate apiary selects for hive forms
    populateApiarySelects();

    hivesContainer.innerHTML = hivesData.map(hive => `
        <div class="col-md-4 mb-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${hive.Name}</h5>
                        <span class="badge bg-${hive.Status === 'Active' ? 'success' : 'secondary'}">${hive.Status}</span>
                    </div>
                    <p class="card-text">
                        <strong>Type:</strong> ${hive.Type}<br>
                        <strong>Installed:</strong> ${formatDate(hive.Install_Date)}<br>
                        <strong>QR Code:</strong> ${hive.QR_Code || 'N/A'}
                    </p>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="showAddInspectionModal(${hive.ID})">
                            <i class="fas fa-search me-1"></i>Inspect
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="showAddMetricModal(${hive.ID})">
                            <i class="fas fa-thermometer-half me-1"></i>Metrics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderInspections() {
    const inspectionsContainer = document.getElementById('inspectionsTable');
    if (!inspectionsContainer) {
        console.log('No inspectionsTable element found');
        return;
    }
    
    console.log('Rendering inspections:', inspectionsData.length, 'inspections');
    
    // Populate hive selects for inspection forms
    populateHiveSelects();

    if (inspectionsData.length === 0) {
        inspectionsContainer.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-info-circle me-2"></i>No inspections recorded yet.
                </td>
            </tr>
        `;
        return;
    }

    inspectionsContainer.innerHTML = inspectionsData.map(inspection => {
        const hiveName = hivesData.find(h => h.ID == inspection.Hive_ID)?.Name || `Hive ${inspection.Hive_ID}`;
        const queenStatus = `${inspection.Queen_Present || 'N/A'} / ${inspection.Queen_Laying || 'N/A'}`;
        
        return `
            <tr>
                <td>${formatDate(inspection.Date)}</td>
                <td>${hiveName}</td>
                <td>${inspection.Inspector || 'N/A'}</td>
                <td>${inspection.Duration ? inspection.Duration + ' min' : 'N/A'}</td>
                <td>${queenStatus}</td>
                <td>${inspection.Brood_Pattern || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewInspectionDetails(${inspection.ID})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="showAddInspectionModal(${inspection.Hive_ID})" title="New Inspection">
                        <i class="fas fa-plus"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderMetrics() {
    const metricsContainer = document.getElementById('latestMetrics');
    if (!metricsContainer) {
        console.log('No latestMetrics element found');
        return;
    }
    
    console.log('Rendering metrics:', metricsData.length, 'metrics');
    
    // Populate hive selects for metric forms
    populateHiveSelects();

    // Group metrics by hive
    const metricsByHive = {};
    metricsData.forEach(metric => {
        if (!metricsByHive[metric.Hive_ID]) {
            metricsByHive[metric.Hive_ID] = [];
        }
        metricsByHive[metric.Hive_ID].push(metric);
    });

    metricsContainer.innerHTML = Object.keys(metricsByHive).map(hiveId => {
        const hiveMetrics = metricsByHive[hiveId];
        const latestMetric = hiveMetrics[hiveMetrics.length - 1];
        
        return `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Hive ${hiveId}</h5>
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="metric-value">${latestMetric.Temperature ? latestMetric.Temperature + '°C' : 'N/A'}</div>
                                <div class="metric-label">Temperature</div>
                            </div>
                            <div class="col-4">
                                <div class="metric-value">${latestMetric.Weight ? latestMetric.Weight + ' kg' : 'N/A'}</div>
                                <div class="metric-label">Weight</div>
                            </div>
                            <div class="col-4">
                                <div class="metric-value">${latestMetric.Humidity ? latestMetric.Humidity + '%' : 'N/A'}</div>
                                <div class="metric-label">Humidity</div>
                            </div>
                        </div>
                        <small class="text-muted">Last updated: ${formatDate(latestMetric.Date)}</small>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Create charts for the first hive if metrics exist
    if (Object.keys(metricsByHive).length > 0) {
        const firstHiveId = Object.keys(metricsByHive)[0];
        createMetricsChart(metricsByHive[firstHiveId]);
    }
}

// View inspection details (placeholder function)
function viewInspectionDetails(inspectionId) {
    const inspection = inspectionsData.find(i => i.ID == inspectionId);
    if (!inspection) return;
    
    const hiveName = hivesData.find(h => h.ID == inspection.Hive_ID)?.Name || `Hive ${inspection.Hive_ID}`;
    
    showAlert(`
        <strong>${hiveName} - ${formatDate(inspection.Date)}</strong><br>
        Inspector: ${inspection.Inspector || 'N/A'}<br>
        Duration: ${inspection.Duration ? inspection.Duration + ' min' : 'N/A'}<br>
        Queen Present: ${inspection.Queen_Present || 'N/A'}<br>
        Queen Laying: ${inspection.Queen_Laying || 'N/A'}<br>
        Brood Pattern: ${inspection.Brood_Pattern || 'N/A'}<br>
        Honey Stores: ${inspection.Honey_Stores || 'N/A'}<br>
        Weather: ${inspection.Weather || 'N/A'}<br>
        ${inspection.Notes ? `<br><strong>Notes:</strong> ${inspection.Notes}` : ''}
    `, 'info');
}

// Load metrics for a specific hive (called by dropdown onchange)
function loadMetricsForHive() {
    const hiveSelect = document.getElementById('metricsHiveSelect');
    const selectedHiveId = hiveSelect.value;
    
    console.log('Loading metrics for hive:', selectedHiveId);
    
    if (!selectedHiveId) {
        // No hive selected, show all metrics
        renderMetrics();
        return;
    }
    
    // Filter metrics for the selected hive
    const hiveMetrics = metricsData.filter(metric => metric.Hive_ID == selectedHiveId);
    console.log('Found', hiveMetrics.length, 'metrics for hive', selectedHiveId);
    
    const metricsContainer = document.getElementById('latestMetrics');
    if (!metricsContainer) return;
    
    if (hiveMetrics.length === 0) {
        metricsContainer.innerHTML = '<p class="text-muted">No metrics recorded for this hive yet.</p>';
        return;
    }
    
    // Show metrics for the selected hive
    const latestMetric = hiveMetrics[hiveMetrics.length - 1];
    const hiveName = hivesData.find(h => h.ID == selectedHiveId)?.Name || `Hive ${selectedHiveId}`;
    
    metricsContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${hiveName}</h5>
                <div class="row text-center">
                    <div class="col-4">
                        <div class="metric-value">${latestMetric.Temperature ? latestMetric.Temperature + '°C' : 'N/A'}</div>
                        <div class="metric-label">Temperature</div>
                    </div>
                    <div class="col-4">
                        <div class="metric-value">${latestMetric.Weight ? latestMetric.Weight + ' kg' : 'N/A'}</div>
                        <div class="metric-label">Weight</div>
                    </div>
                    <div class="col-4">
                        <div class="metric-value">${latestMetric.Humidity ? latestMetric.Humidity + '%' : 'N/A'}</div>
                        <div class="metric-label">Humidity</div>
                    </div>
                </div>
                <small class="text-muted">Last updated: ${formatDate(latestMetric.Date)}</small>
                <div class="mt-3">
                    <button class="btn btn-sm btn-primary" onclick="showAddMetricModal(${selectedHiveId})">
                        <i class="fas fa-plus me-1"></i>Add Metric
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Create chart for this hive
    createMetricsChart(hiveMetrics);
}

function renderTasks() {
    console.log('Rendering tasks:', tasksData.length, 'tasks');
    
    // Populate hive selects for task forms
    populateHiveSelects();

    const groupedTasks = {
        'High': tasksData.filter(t => t.Priority === 'High'),
        'Medium': tasksData.filter(t => t.Priority === 'Medium'),
        'Low': tasksData.filter(t => t.Priority === 'Low'),
        'Critical': tasksData.filter(t => t.Priority === 'Critical')
    };

    // Render high priority tasks
    const highContainer = document.getElementById('highPriorityTasks');
    if (highContainer) {
        highContainer.innerHTML = groupedTasks.High.map(task => `
            <div class="card mb-2">
                <div class="card-body p-2">
                    <h6 class="mb-1">${task.Title}</h6>
                    <p class="mb-1 small">${task.Description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${task.Due_Date ? formatDate(task.Due_Date) : 'No due date'}</small>
                        <span class="badge bg-${task.Status === 'Completed' ? 'success' : task.Status === 'In Progress' ? 'info' : 'warning'}">${task.Status}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render medium priority tasks
    const mediumContainer = document.getElementById('mediumPriorityTasks');
    if (mediumContainer) {
        mediumContainer.innerHTML = groupedTasks.Medium.map(task => `
            <div class="card mb-2">
                <div class="card-body p-2">
                    <h6 class="mb-1">${task.Title}</h6>
                    <p class="mb-1 small">${task.Description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${task.Due_Date ? formatDate(task.Due_Date) : 'No due date'}</small>
                        <span class="badge bg-${task.Status === 'Completed' ? 'success' : task.Status === 'In Progress' ? 'info' : 'warning'}">${task.Status}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render low priority tasks
    const lowContainer = document.getElementById('lowPriorityTasks');
    if (lowContainer) {
        lowContainer.innerHTML = groupedTasks.Low.map(task => `
            <div class="card mb-2">
                <div class="card-body p-2">
                    <h6 class="mb-1">${task.Title}</h6>
                    <p class="mb-1 small">${task.Description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${task.Due_Date ? formatDate(task.Due_Date) : 'No due date'}</small>
                        <span class="badge bg-${task.Status === 'Completed' ? 'success' : task.Status === 'In Progress' ? 'info' : 'warning'}">${task.Status}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Modal functions
function showAddHiveModal() {
    console.log('Opening Add Hive modal');
    const modal = new bootstrap.Modal(document.getElementById('addHiveModal'));
    populateApiarySelects();
    modal.show();
}

function showAddInspectionModal(hiveId = null) {
    const modal = new bootstrap.Modal(document.getElementById('addInspectionModal'));
    if (hiveId) {
        document.querySelector('#addInspectionForm select[name="Hive_ID"]').value = hiveId;
    }
    populateHiveSelects();
    modal.show();
}

function showAddMetricModal(hiveId = null) {
    const modal = new bootstrap.Modal(document.getElementById('addMetricModal'));
    if (hiveId) {
        document.querySelector('#addMetricForm select[name="Hive_ID"]').value = hiveId;
    }
    populateHiveSelects();
    modal.show();
}

function showAddTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    populateHiveSelects();
    modal.show();
}

// Populate hive selects
function populateHiveSelects() {
    console.log('Populating hive selects with', hivesData.length, 'hives');
    const selects = document.querySelectorAll('select[name="Hive_ID"]');
    console.log('Found', selects.length, 'hive select elements');
    
    selects.forEach(select => {
        const defaultText = select.id === 'metricHiveSelect' ? 'Select a hive...' : 'Select Hive (Optional)';
        select.innerHTML = `<option value="">${defaultText}</option>` +
            hivesData.map(hive => `<option value="${hive.ID}">Hive ${hive.ID} - ${hive.Name}</option>`).join('');
        console.log('Populated hive select with options:', select.innerHTML);
    });
    
    // Also populate the metrics filter dropdown
    const metricsHiveSelect = document.getElementById('metricsHiveSelect');
    if (metricsHiveSelect) {
        console.log('Populating metrics hive filter dropdown');
        metricsHiveSelect.innerHTML = '<option value="">Select a hive...</option>' +
            hivesData.map(hive => `<option value="${hive.ID}">Hive ${hive.ID} - ${hive.Name}</option>`).join('');
    }
}

// Populate apiary selects
function populateApiarySelects() {
    console.log('Populating apiary selects with', apiariesData.length, 'apiaries');
    const selects = document.querySelectorAll('select[name="Apiary_ID"]');
    console.log('Found', selects.length, 'apiary select elements');
    
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select an apiary...</option>' +
            apiariesData.map(apiary => `<option value="${apiary.ID}">${apiary.Name} - ${apiary.Location || 'No location'}</option>`).join('');
        console.log('Populated select with options:', select.innerHTML);
    });
}

// Add functions
async function addHive() {
    const form = document.getElementById('addHiveForm');
    const formData = new FormData(form);
    const hiveData = Object.fromEntries(formData.entries());
    
    // Validate that an apiary is selected
    if (!hiveData.Apiary_ID) {
        showAlert('Please select an apiary for this hive', 'warning');
        return;
    }
    
    try {
        const result = await apiCall('add', 'Hives', hiveData);
        if (result.success) {
            showAlert('Hive added successfully!', 'success');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addHiveModal')).hide();
            await loadHives();
            updateDashboard();
            if (!document.getElementById('hives').classList.contains('d-none')) {
                renderHives();
            }
        } else {
            showAlert('Error adding hive: ' + result.error.message, 'danger');
        }
    } catch (error) {
        console.error('Error adding hive:', error);
        showAlert('Error adding hive. Please try again.', 'danger');
    }
}

async function addInspection() {
    const form = document.getElementById('addInspectionForm');
    const formData = new FormData(form);
    const inspectionData = Object.fromEntries(formData.entries());
    
    // Queen_Present and Queen_Laying are already select values, no conversion needed
    
    if (!inspectionData.Hive_ID) {
        showAlert('Please select a hive', 'warning');
        return;
    }
    
    try {
        const result = await apiCall('add', 'Inspections', inspectionData);
        if (result.success) {
            showAlert('Inspection recorded successfully!', 'success');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addInspectionModal')).hide();
            await loadInspections();
            updateDashboard();
            if (!document.getElementById('inspections').classList.contains('d-none')) {
                renderInspections();
            }
        } else {
            showAlert('Error recording inspection: ' + result.error.message, 'danger');
        }
    } catch (error) {
        console.error('Error recording inspection:', error);
        showAlert('Error recording inspection. Please try again.', 'danger');
    }
}

async function addMetric() {
    const form = document.getElementById('addMetricForm');
    const formData = new FormData(form);
    const metricData = Object.fromEntries(formData.entries());
    
    if (!metricData.Hive_ID) {
        showAlert('Please select a hive', 'warning');
        return;
    }
    
    try {
        const result = await apiCall('add', 'Metrics', {
            ...metricData,
            Source: metricData.Source || 'Manual'
        });
        
        if (result.success) {
            showAlert('Metric recorded successfully!', 'success');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addMetricModal')).hide();
            await loadMetrics();
            updateDashboard();
            if (!document.getElementById('metrics').classList.contains('d-none')) {
                renderMetrics();
            }
        } else {
            showAlert('Error recording metric: ' + result.error.message, 'danger');
        }
    } catch (error) {
        console.error('Error recording metric:', error);
        showAlert('Error recording metric. Please try again.', 'danger');
    }
}

async function addTask() {
    const form = document.getElementById('addTaskForm');
    const formData = new FormData(form);
    const taskData = Object.fromEntries(formData.entries());
    
    try {
        const result = await apiCall('add', 'Tasks', {
            ...taskData,
            Status: 'Pending'
        });
        
        if (result.success) {
            showAlert('Task added successfully!', 'success');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
            await loadTasks();
            updateDashboard();
            if (!document.getElementById('tasks').classList.contains('d-none')) {
                renderTasks();
            }
        } else {
            showAlert('Error adding task: ' + result.error.message, 'danger');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showAlert('Error adding task. Please try again.', 'danger');
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Sync data function
async function syncData() {
    const syncBtn = document.getElementById('syncBtn');
    const originalText = syncBtn.innerHTML;
    
    syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Syncing...';
    syncBtn.disabled = true;
    
    try {
        await loadAllData();
        updateDashboard();
        
        // Update current section
        const activeSection = document.querySelector('.nav-link.active')?.getAttribute('data-section');
        if (activeSection) {
            showSection(activeSection);
        }
        
        showAlert('Data synchronized successfully!', 'success');
    } catch (error) {
        console.error('Sync error:', error);
        showAlert('Error syncing data. Please try again.', 'danger');
    } finally {
        syncBtn.innerHTML = originalText;
        syncBtn.disabled = false;
    }
}

// Create metrics chart
function createMetricsChart(metrics) {
    const ctx = document.getElementById('temperatureChart');
    if (!ctx) {
        console.log('No temperatureChart element found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (temperatureChart) {
        console.log('Destroying existing chart');
        temperatureChart.destroy();
        temperatureChart = null;
    }
    
    const last7Days = metrics.slice(-7);
    const labels = last7Days.map(m => formatDate(m.Date));
    const temperatures = last7Days.map(m => parseFloat(m.Temperature) || 0);
    const weights = last7Days.map(m => parseFloat(m.Weight) || 0);
    const humidity = last7Days.map(m => parseFloat(m.Humidity) || 0);
    
    console.log('Creating chart with data:', { labels, temperatures, weights, humidity });
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
            }, {
                label: 'Weight (kg)',
                data: weights,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.1
            }, {
                label: 'Humidity (%)',
                data: humidity,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Metrics Trend (Last 7 Days)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}