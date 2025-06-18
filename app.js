// BEE Keepers MVP - Frontend Application
// Complete JavaScript functionality for beekeeping management system

// Google Apps Script API URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6K0wYCVgQl2FcLkyC78EXUc71UOzxHqikGi6k9ZBfL0ThaQQTeEYrLAefnGs9cAHC/exec';

// Global data storage
let hivesData = [];
let inspectionsData = [];
let metricsData = [];
let tasksData = [];

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
        loadHives(),
        loadInspections(),
        loadMetrics(),
        loadTasks()
    ]);
}

// API call helper
async function apiCall(action, sheet, record = null) {
    const url = action === 'get' ? `${GOOGLE_SCRIPT_URL}?action=${action}&sheet=${sheet}` : GOOGLE_SCRIPT_URL;
    
    const options = {
        method: action === 'get' ? 'GET' : 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (action !== 'get') {
        options.body = JSON.stringify({
            action: action,
            sheet: sheet,
            record: record
        });
    }

    const response = await fetch(url, options);
    return await response.json();
}

// Load functions
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
                    <h6 class="mb-1">Hive ${inspection.Hive_ID}</h6>
                    <small>${formatDate(inspection.Date)}</small>
                </div>
                <p class="mb-1">${inspection.Queen_Status || 'N/A'}</p>
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
                    <h6 class="mb-1">${task.Task_Name}</h6>
                    <small class="text-${task.Priority === 'High' ? 'danger' : task.Priority === 'Medium' ? 'warning' : 'success'}">${task.Priority}</small>
                </div>
                <p class="mb-1">${task.Description || ''}</p>
                ${task.Due_Date ? `<small>Due: ${formatDate(task.Due_Date)}</small>` : ''}
            </div>
        `).join('');
    }
}

// Render functions
function renderHives() {
    const hivesContainer = document.getElementById('hivesContainer');
    if (!hivesContainer) return;

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
                        <strong>Installed:</strong> ${formatDate(hive.Installation_Date)}<br>
                        <strong>Location:</strong> ${hive.Location || 'N/A'}
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
    const inspectionsContainer = document.getElementById('inspectionsContainer');
    if (!inspectionsContainer) return;

    inspectionsContainer.innerHTML = inspectionsData.map(inspection => `
        <div class="col-md-6 mb-3">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">Hive ${inspection.Hive_ID}</h5>
                        <small class="text-muted">${formatDate(inspection.Date)}</small>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <strong>Queen:</strong> ${inspection.Queen_Present ? 'Present' : 'Not Found'}<br>
                            <strong>Laying:</strong> ${inspection.Queen_Laying ? 'Yes' : 'No'}<br>
                            <strong>Brood Pattern:</strong> ${inspection.Brood_Pattern || 'N/A'}
                        </div>
                        <div class="col-6">
                            <strong>Honey Stores:</strong> ${inspection.Honey_Stores || 'N/A'}<br>
                            <strong>Weather:</strong> ${inspection.Weather || 'N/A'}<br>
                            <strong>Temperature:</strong> ${inspection.Temperature ? inspection.Temperature + '°F' : 'N/A'}
                        </div>
                    </div>
                    ${inspection.Notes ? `<div class="mt-2"><strong>Notes:</strong> ${inspection.Notes}</div>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderMetrics() {
    const metricsContainer = document.getElementById('metricsContainer');
    if (!metricsContainer) return;

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
                                <div class="metric-value">${latestMetric.Temperature || 'N/A'}</div>
                                <div class="metric-label">Temperature</div>
                            </div>
                            <div class="col-4">
                                <div class="metric-value">${latestMetric.Weight || 'N/A'}</div>
                                <div class="metric-label">Weight</div>
                            </div>
                            <div class="col-4">
                                <div class="metric-value">${latestMetric.Humidity || 'N/A'}</div>
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

function renderTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    if (!tasksContainer) return;

    const groupedTasks = {
        'High': tasksData.filter(t => t.Priority === 'High'),
        'Medium': tasksData.filter(t => t.Priority === 'Medium'),
        'Low': tasksData.filter(t => t.Priority === 'Low')
    };

    tasksContainer.innerHTML = Object.keys(groupedTasks).map(priority => `
        <div class="col-md-4 mb-3">
            <div class="card">
                <div class="card-header bg-${priority === 'High' ? 'danger' : priority === 'Medium' ? 'warning' : 'success'} text-white">
                    <h6 class="mb-0">${priority} Priority (${groupedTasks[priority].length})</h6>
                </div>
                <div class="card-body p-0">
                    <div class="list-group list-group-flush">
                        ${groupedTasks[priority].map(task => `
                            <div class="list-group-item">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1">${task.Task_Name}</h6>
                                    <span class="badge bg-${task.Status === 'Completed' ? 'success' : 'warning'}">${task.Status}</span>
                                </div>
                                <p class="mb-1">${task.Description || ''}</p>
                                ${task.Due_Date ? `<small>Due: ${formatDate(task.Due_Date)}</small>` : ''}
                                ${task.Hive_ID ? `<small class="d-block">Hive: ${task.Hive_ID}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Modal functions
function showAddHiveModal() {
    const modal = new bootstrap.Modal(document.getElementById('addHiveModal'));
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
    const selects = document.querySelectorAll('select[name="Hive_ID"]');
    selects.forEach(select => {
        select.innerHTML = '<option value="">Select Hive (Optional)</option>' +
            hivesData.map(hive => `<option value="${hive.ID}">Hive ${hive.ID} - ${hive.Name}</option>`).join('');
    });
}

// Add functions
async function addHive() {
    const form = document.getElementById('addHiveForm');
    const formData = new FormData(form);
    const hiveData = Object.fromEntries(formData.entries());
    
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
    
    // Convert checkboxes to boolean
    inspectionData.Queen_Present = form.querySelector('input[name="Queen_Present"]').checked;
    inspectionData.Queen_Laying = form.querySelector('input[name="Queen_Laying"]').checked;
    
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
    const ctx = document.getElementById('metricsChart');
    if (!ctx) return;
    
    const last7Days = metrics.slice(-7);
    const labels = last7Days.map(m => formatDate(m.Date));
    const temperatures = last7Days.map(m => parseFloat(m.Temperature) || 0);
    const weights = last7Days.map(m => parseFloat(m.Weight) || 0);
    const humidity = last7Days.map(m => parseFloat(m.Humidity) || 0);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°F)',
                data: temperatures,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
            }, {
                label: 'Weight (lbs)',
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