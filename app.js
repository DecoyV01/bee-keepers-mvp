// BEE Keepers MVP - Frontend Application
// Complete JavaScript functionality for beekeeping management system

// Google Apps Script API URL with cache busting
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby_r-9PZ2zpfS-SCr1E61GeCk-qTpuSnZz_4c3VYjKao_F3OiIotb1WaRGO8dC58b7j/exec';

// Clear any problematic cached data on load
try {
    if (typeof(Storage) !== "undefined") {
        // Clear any old cached data that might be causing issues
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('bee') || key.includes('hive') || key.includes('api'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Also clear session storage
        sessionStorage.clear();
    }
} catch (e) {
    console.log('Storage cleanup failed (not available):', e);
}

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
    
    // Add network status monitoring for mobile
    if ('navigator' in window && 'onLine' in navigator) {
        console.log('Network status:', navigator.onLine ? 'Online' : 'Offline');
        
        window.addEventListener('online', function() {
            console.log('Network: Back online');
            showAlert('Connection restored! Retrying...', 'success');
            setTimeout(() => {
                initializeApp();
            }, 1000);
        });
        
        window.addEventListener('offline', function() {
            console.log('Network: Gone offline');
            showAlert('No internet connection. Please check your network.', 'warning');
        });
    }
    
    initializeApp();
});

// Initialize the application
async function initializeApp() {
    try {
        console.log('Initializing BEE Keepers app...');
        console.log('User agent:', navigator.userAgent);
        console.log('Platform:', navigator.platform);
        console.log('Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        
        showAlert('Connecting to BEE Keepers API...', 'info');
        
        // Test API connectivity first
        try {
            console.log('Testing API connectivity...');
            const healthCheck = await apiCall('health', '');
            console.log('API health check result:', healthCheck);
        } catch (healthError) {
            console.error('API health check failed:', healthError);
            showAlert('API connectivity test failed. Trying to load data anyway...', 'warning');
        }
        
        await loadAllData();
        showAlert('Connected to BEE Keepers API!', 'success');
        showSection('dashboard');
        updateDashboard();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        showAlert(`Unable to connect to API: ${error.message}. Please check your connection and try refreshing the page.`, 'danger');
        
        // Try to show the interface anyway with empty data
        try {
            showSection('dashboard');
            updateDashboard();
        } catch (fallbackError) {
            console.error('Even fallback failed:', fallbackError);
        }
    }
}

// Show/Hide sections
function showSection(sectionName) {
    // Hide all sections
    const sections = ['dashboard', 'apiaries', 'hives', 'inspections', 'metrics', 'tasks'];
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
        case 'apiaries':
            renderApiaries();
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
    // Load apiaries first, then others
    try {
        await loadApiaries();
    } catch (error) {
        console.error('Failed to load apiaries, continuing with other data...');
    }
    
    await Promise.all([
        loadHives(),
        loadInspections(),
        loadMetrics(),
        loadTasks()
    ]);
}

// API call helper
async function apiCall(action, sheet, record = null) {
    console.log(`API Call: ${action} on ${sheet}`, record ? 'with data' : 'no data');
    
    if (action === 'get' || action === 'health') {
        // Use JSONP for GET requests to avoid CORS
        return new Promise((resolve, reject) => {
            const callbackName = 'callback_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            // Add cache busting parameters
            const cacheBuster = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const url = `${GOOGLE_SCRIPT_URL}?action=${action}&sheet=${sheet}&callback=${callbackName}&_cb=${cacheBuster}&_t=${Date.now()}`;
            
            console.log('Making JSONP request to:', url);
            
            let timeoutId;
            let script;
            
            // Create callback function
            window[callbackName] = function(data) {
                console.log('JSONP callback received for', callbackName, data);
                clearTimeout(timeoutId);
                
                // Safe cleanup
                try {
                    if (script && script.parentNode) {
                        document.head.removeChild(script);
                    }
                } catch (e) {
                    console.warn('Script cleanup error:', e);
                }
                
                delete window[callbackName];
                resolve(data);
            };
            
            // Create script tag
            script = document.createElement('script');
            script.src = url;
            script.async = true; // Ensure async loading on mobile
            
            script.onerror = function(error) {
                console.error('Script loading error:', error);
                clearTimeout(timeoutId);
                
                try {
                    if (script.parentNode) {
                        document.head.removeChild(script);
                    }
                } catch (e) {
                    console.warn('Script cleanup error on error:', e);
                }
                
                delete window[callbackName];
                reject(new Error(`JSONP request failed for ${action}/${sheet}`));
            };
            
            // Add timeout (longer for mobile)
            const timeoutMs = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 20000 : 10000;
            timeoutId = setTimeout(() => {
                console.error('JSONP request timeout for', callbackName);
                
                if (window[callbackName]) {
                    try {
                        if (script && script.parentNode) {
                            document.head.removeChild(script);
                        }
                    } catch (e) {
                        console.warn('Script cleanup error on timeout:', e);
                    }
                    
                    delete window[callbackName];
                    reject(new Error(`API request timeout after ${timeoutMs}ms for ${action}/${sheet}`));
                }
            }, timeoutMs);
            
            // Add to DOM
            document.head.appendChild(script);
        });
    } else {
        // Use fetch for POST requests (they still work in most cases)
        try {
            console.log('Making POST request with data:', record);
            
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
            
            console.log('POST response status:', response.status);
            
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
        console.log('Starting to load apiaries...');
        const result = await apiCall('get', 'Apiaries');
        console.log('Apiaries API result:', result);
        
        if (result && result.data) {
            apiariesData = result.data;
            console.log('Loaded apiaries:', apiariesData.length);
            console.log('Apiaries data:', apiariesData);
        } else {
            console.warn('No apiaries data in response, creating default apiary');
            // Try to create a default apiary if none exist
            try {
                const createResult = await apiCall('add', 'Apiaries', {
                    Name: 'Main Apiary',
                    Location: 'Default Location',
                    Owner_Email: 'beekeeper@example.com',
                    Created_Date: new Date().toISOString().split('T')[0],
                    Notes: 'Default apiary created by system'
                });
                console.log('Created default apiary result:', createResult);
                
                // Reload apiaries after creating default
                const reloadResult = await apiCall('get', 'Apiaries');
                apiariesData = reloadResult.data || [];
                console.log('Reloaded apiaries after creating default:', apiariesData.length);
            } catch (createError) {
                console.error('Error creating default apiary:', createError);
                apiariesData = [];
            }
        }
    } catch (error) {
        console.error('Error loading apiaries:', error);
        apiariesData = [];
        showAlert('Unable to load apiaries. Please check if the Apiaries sheet exists in your database.', 'warning');
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
function renderApiaries() {
    const apiariesContainer = document.getElementById('apiariesTable');
    if (!apiariesContainer) {
        console.log('No apiariesTable element found');
        return;
    }
    
    console.log('Rendering apiaries:', apiariesData.length, 'apiaries');
    
    if (apiariesData.length === 0) {
        apiariesContainer.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-map-marker-alt fa-2x mb-3"></i>
                        <p>No apiaries found. <a href="#" onclick="showAddApiaryModal()">Add your first apiary</a> to get started.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const tableHTML = apiariesData.map(apiary => {
        const hiveCount = hivesData.filter(h => h.Apiary_ID == apiary.ID).length;
        const coordinates = (apiary.GPS_Lat && apiary.GPS_Lng) ? 
            `${parseFloat(apiary.GPS_Lat).toFixed(4)}, ${parseFloat(apiary.GPS_Lng).toFixed(4)}` : 
            'Not set';
        
        return `
            <tr>
                <td>
                    <strong>${apiary.Name}</strong>
                    ${apiary.Notes ? `<br><small class="text-muted">${apiary.Notes}</small>` : ''}
                </td>
                <td>${apiary.Location}</td>
                <td>
                    ${coordinates !== 'Not set' ? 
                        `<a href="https://maps.google.com/?q=${apiary.GPS_Lat},${apiary.GPS_Lng}" target="_blank" title="View on Google Maps">
                            <i class="fas fa-map-marker-alt me-1"></i>${coordinates}
                        </a>` : 
                        '<span class="text-muted">Not set</span>'
                    }
                </td>
                <td>${apiary.Owner_Email || '<span class="text-muted">Not set</span>'}</td>
                <td>${formatDate(apiary.Created_Date)}</td>
                <td>
                    <span class="badge bg-primary">${hiveCount} hive${hiveCount !== 1 ? 's' : ''}</span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-warning" onclick="showEditApiaryModal(${apiary.ID})" title="Edit apiary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" onclick="showSection('hives')" title="View hives">
                            <i class="fas fa-archive"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    apiariesContainer.innerHTML = tableHTML;
}

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
                        <button class="btn btn-sm btn-outline-warning" onclick="showEditHiveModal(${hive.ID})">
                            <i class="fas fa-edit me-1"></i>Edit
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
    console.log('Inspections container element:', inspectionsContainer);
    console.log('Container parent:', inspectionsContainer.parentElement);
    
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

    const tableHTML = inspectionsData.map(inspection => {
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
    
    console.log('Generated table HTML:', tableHTML);
    inspectionsContainer.innerHTML = tableHTML;
    console.log('INSPECTION TABLE FIXED - VERSION 1.2.1 - TABLE ROWS APPLIED');
}

function renderMetrics() {
    const metricsContainer = document.getElementById('latestMetrics');
    if (!metricsContainer) {
        console.log('No latestMetrics element found');
        return;
    }
    
    console.log('Rendering metrics table view:', metricsData.length, 'metrics');
    
    // Populate hive selects for metric forms
    populateHiveSelects();

    if (metricsData.length === 0) {
        metricsContainer.innerHTML = '<p class="text-muted">No metrics recorded yet. <a href="#" onclick="showAddMetricModal()">Add the first metric</a>.</p>';
        return;
    }

    // Show table view of all metrics
    const tableHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Date</th>
                        <th>Hive</th>
                        <th>Temperature</th>
                        <th>Weight</th>
                        <th>Humidity</th>
                        <th>Source</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${metricsData.slice().reverse().map(metric => {
                        const hiveName = hivesData.find(h => h.ID == metric.Hive_ID)?.Name || `Hive ${metric.Hive_ID}`;
                        return `
                            <tr>
                                <td>${formatDate(metric.Date)}</td>
                                <td>
                                    <span class="badge bg-primary">${hiveName}</span>
                                </td>
                                <td>${metric.Temperature ? metric.Temperature + '°C' : '<span class="text-muted">N/A</span>'}</td>
                                <td>${metric.Weight ? metric.Weight + ' kg' : '<span class="text-muted">N/A</span>'}</td>
                                <td>${metric.Humidity ? metric.Humidity + '%' : '<span class="text-muted">N/A</span>'}</td>
                                <td>
                                    <span class="badge bg-secondary">${metric.Source || 'Manual'}</span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="showAddMetricModal(${metric.Hive_ID})" title="Add metric for this hive">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="mt-3">
            <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>
                Showing ${metricsData.length} metric${metricsData.length !== 1 ? 's' : ''} from all hives. 
                Select a hive above to view detailed charts and trends.
            </small>
        </div>
    `;
    
    metricsContainer.innerHTML = tableHTML;
    
    // Clear charts when showing table view
    const temperatureChart = document.getElementById('temperatureChart');
    const weightChart = document.getElementById('weightChart');
    if (temperatureChart) {
        temperatureChart.getContext('2d').clearRect(0, 0, temperatureChart.width, temperatureChart.height);
    }
    if (weightChart) {
        weightChart.getContext('2d').clearRect(0, 0, weightChart.width, weightChart.height);
    }
}

// View inspection details in modal
function viewInspectionDetails(inspectionId) {
    const inspection = inspectionsData.find(i => i.ID == inspectionId);
    if (!inspection) {
        showAlert('Inspection not found!', 'danger');
        return;
    }
    
    const hiveName = hivesData.find(h => h.ID == inspection.Hive_ID)?.Name || `Hive ${inspection.Hive_ID}`;
    
    // Create and show modal with inspection details
    const modalHTML = `
        <div class="modal fade" id="viewInspectionModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-search me-2"></i>Inspection Details - ${hiveName}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-primary">Basic Information</h6>
                                <p><strong>Date:</strong> ${formatDate(inspection.Date)}</p>
                                <p><strong>Inspector:</strong> ${inspection.Inspector || 'N/A'}</p>
                                <p><strong>Duration:</strong> ${inspection.Duration ? inspection.Duration + ' minutes' : 'N/A'}</p>
                                <p><strong>Weather:</strong> ${inspection.Weather || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-primary">Queen Assessment</h6>
                                <p><strong>Queen Present:</strong> 
                                    <span class="badge bg-${inspection.Queen_Present === 'Yes' ? 'success' : 'warning'}">${inspection.Queen_Present || 'N/A'}</span>
                                </p>
                                <p><strong>Queen Laying:</strong> 
                                    <span class="badge bg-${inspection.Queen_Laying === 'Yes' ? 'success' : 'warning'}">${inspection.Queen_Laying || 'N/A'}</span>
                                </p>
                                <p><strong>Brood Pattern:</strong> 
                                    <span class="badge bg-primary">${inspection.Brood_Pattern || 'N/A'}</span>
                                </p>
                                <p><strong>Honey Stores:</strong> 
                                    <span class="badge bg-info">${inspection.Honey_Stores || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                        ${inspection.Notes ? `
                            <div class="mt-3">
                                <h6 class="text-primary">Notes</h6>
                                <div class="alert alert-light">${inspection.Notes}</div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-success" onclick="showAddInspectionModal(${inspection.Hive_ID})">
                            <i class="fas fa-plus me-2"></i>New Inspection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('viewInspectionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to DOM and show
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('viewInspectionModal'));
    modal.show();
    
    // Clean up modal when hidden
    document.getElementById('viewInspectionModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
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

function showEditHiveModal(hiveId) {
    const hive = hivesData.find(h => h.ID == hiveId);
    if (!hive) {
        showAlert('Hive not found!', 'danger');
        return;
    }
    
    console.log('Opening Edit Hive modal for:', hive);
    
    // Populate form with current hive data
    document.getElementById('editHiveId').value = hive.ID;
    document.getElementById('editHiveName').value = hive.Name || '';
    document.getElementById('editHiveType').value = hive.Type || 'Langstroth';
    document.getElementById('editHiveInstallDate').value = hive.Install_Date ? hive.Install_Date.split(' ')[0] : '';
    document.getElementById('editHiveStatus').value = hive.Status || 'Active';
    document.getElementById('editHiveQRCode').value = hive.QR_Code || '';
    document.getElementById('editHiveNotes').value = hive.Notes || '';
    
    // Populate apiary dropdown and set current value
    populateEditApiarySelects();
    setTimeout(() => {
        document.getElementById('editHiveApiarySelect').value = hive.Apiary_ID || '';
    }, 100);
    
    const modal = new bootstrap.Modal(document.getElementById('editHiveModal'));
    modal.show();
}

// Populate hive selects
function populateHiveSelects() {
    console.log('Populating hive selects with', hivesData.length, 'hives');
    const selects = document.querySelectorAll('select[name="Hive_ID"]');
    console.log('Found', selects.length, 'hive select elements');
    
    selects.forEach(select => {
        let defaultText = 'Select a hive...'; // Default for required fields
        
        // Determine appropriate text based on select ID/context
        if (select.id === 'taskHiveSelect') {
            defaultText = 'All hives / General task';
        } else if (select.id === 'metricHiveSelect' || select.id === 'inspectionHiveSelect') {
            defaultText = 'Select a hive...';
        }
        
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
        if (apiariesData.length === 0) {
            select.innerHTML = `
                <option value="">No apiaries available</option>
                <option value="create">Create "Main Apiary" automatically</option>
            `;
        } else {
            select.innerHTML = '<option value="">Select an apiary...</option>' +
                apiariesData.map(apiary => `<option value="${apiary.ID}">${apiary.Name} - ${apiary.Location || 'No location'}</option>`).join('');
        }
        console.log('Populated select with options:', select.innerHTML);
    });
}

// Populate apiary select for edit form specifically
function populateEditApiarySelects() {
    console.log('Populating edit apiary select with', apiariesData.length, 'apiaries');
    const select = document.getElementById('editHiveApiarySelect');
    if (select) {
        select.innerHTML = '<option value="">Select an apiary...</option>' +
            apiariesData.map(apiary => `<option value="${apiary.ID}">${apiary.Name} - ${apiary.Location || 'No location'}</option>`).join('');
    }
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

// Update hive function
async function updateHive() {
    const form = document.getElementById('editHiveForm');
    const formData = new FormData(form);
    const hiveData = Object.fromEntries(formData.entries());
    
    if (!hiveData.Name) {
        showAlert('Please enter a hive name', 'warning');
        return;
    }
    
    if (!hiveData.Apiary_ID) {
        showAlert('Please select an apiary', 'warning');
        return;
    }
    
    try {
        console.log('Updating hive with data:', hiveData);
        const result = await apiCall('add', 'Hives', hiveData); // Use 'add' action with ID for update
        console.log('Update result:', result);
        
        if (result.success) {
            showAlert('Hive updated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editHiveModal')).hide();
            await loadHives();
            updateDashboard();
            if (!document.getElementById('hives').classList.contains('d-none')) {
                renderHives();
            }
        } else {
            showAlert('Error updating hive: ' + (result.error?.message || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error updating hive:', error);
        showAlert('Error updating hive. Please try again.', 'danger');
    }
}

// Delete hive function
async function deleteHive() {
    const hiveId = document.getElementById('editHiveId').value;
    const hiveName = document.getElementById('editHiveName').value;
    
    if (!confirm(`Are you sure you want to delete "${hiveName}"? This action cannot be undone and will also delete all related inspections, metrics, and tasks.`)) {
        return;
    }
    
    try {
        const result = await apiCall('delete', 'Hives', { ID: hiveId });
        if (result.success) {
            showAlert('Hive deleted successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editHiveModal')).hide();
            await loadHives();
            updateDashboard();
            if (!document.getElementById('hives').classList.contains('d-none')) {
                renderHives();
            }
        } else {
            showAlert('Error deleting hive: ' + result.error.message, 'danger');
        }
    } catch (error) {
        console.error('Error deleting hive:', error);
        showAlert('Error deleting hive. Please try again.', 'danger');
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
    
    // Also try to destroy any chart attached to this canvas
    try {
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            console.log('Found existing chart on canvas, destroying it');
            existingChart.destroy();
        }
    } catch (e) {
        console.log('No existing chart found on canvas');
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

// Apiary Management Functions

// Show Add Apiary Modal
function showAddApiaryModal() {
    const modal = new bootstrap.Modal(document.getElementById('addApiaryModal'));
    
    // Set current date for Created_Date
    const today = new Date().toISOString().split('T')[0];
    
    // Clear form
    document.getElementById('addApiaryForm').reset();
    
    modal.show();
}

// Add new apiary
async function addApiary() {
    const form = document.getElementById('addApiaryForm');
    const formData = new FormData(form);
    
    // Add Created_Date
    formData.set('Created_Date', new Date().toISOString().split('T')[0]);
    
    const apiaryData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!apiaryData.Name || !apiaryData.Location) {
        showAlert('Please fill in all required fields (Name and Location).', 'danger');
        return;
    }
    
    try {
        console.log('Adding apiary with data:', apiaryData);
        const result = await apiCall('add', 'Apiaries', apiaryData);
        console.log('Add apiary result:', result);
        
        if (result.success) {
            showAlert('Apiary added successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addApiaryModal'));
            modal.hide();
            
            // Reload data and refresh display
            await loadApiaries();
            renderApiaries();
            
            // Update dropdowns
            populateApiarySelects();
        } else {
            showAlert('Failed to add apiary. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Error adding apiary:', error);
        showAlert('Error adding apiary: ' + error.message, 'danger');
    }
}

// Show Edit Apiary Modal
function showEditApiaryModal(apiaryId) {
    const apiary = apiariesData.find(a => a.ID == apiaryId);
    if (!apiary) {
        showAlert('Apiary not found!', 'danger');
        return;
    }
    
    // Populate form fields
    document.getElementById('editApiaryId').value = apiary.ID;
    document.getElementById('editApiaryName').value = apiary.Name || '';
    document.getElementById('editApiaryLocation').value = apiary.Location || '';
    document.getElementById('editApiaryLat').value = apiary.GPS_Lat || '';
    document.getElementById('editApiaryLng').value = apiary.GPS_Lng || '';
    document.getElementById('editApiaryEmail').value = apiary.Owner_Email || '';
    document.getElementById('editApiaryNotes').value = apiary.Notes || '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editApiaryModal'));
    modal.show();
}

// Update apiary
async function updateApiary() {
    const form = document.getElementById('editApiaryForm');
    const formData = new FormData(form);
    const apiaryData = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!apiaryData.Name || !apiaryData.Location) {
        showAlert('Please fill in all required fields (Name and Location).', 'danger');
        return;
    }
    
    try {
        console.log('Updating apiary with data:', apiaryData);
        const result = await apiCall('add', 'Apiaries', apiaryData);
        console.log('Update apiary result:', result);
        
        if (result.success) {
            showAlert('Apiary updated successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editApiaryModal'));
            modal.hide();
            
            // Reload data and refresh display
            await loadApiaries();
            renderApiaries();
            
            // Update dropdowns
            populateApiarySelects();
        } else {
            showAlert('Failed to update apiary. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Error updating apiary:', error);
        showAlert('Error updating apiary: ' + error.message, 'danger');
    }
}

// Delete apiary
async function deleteApiary() {
    const apiaryId = document.getElementById('editApiaryId').value;
    const apiary = apiariesData.find(a => a.ID == apiaryId);
    
    if (!apiary) {
        showAlert('Apiary not found!', 'danger');
        return;
    }
    
    // Check if apiary has hives
    const associatedHives = hivesData.filter(h => h.Apiary_ID == apiaryId);
    if (associatedHives.length > 0) {
        showAlert(`Cannot delete apiary "${apiary.Name}" because it contains ${associatedHives.length} hive(s). Please move or delete the hives first.`, 'danger');
        return;
    }
    
    const confirmDelete = confirm(`Are you sure you want to delete the apiary "${apiary.Name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    try {
        console.log('Deleting apiary:', apiaryId);
        const result = await apiCall('delete', 'Apiaries', { ID: apiaryId });
        console.log('Delete apiary result:', result);
        
        if (result.success) {
            showAlert('Apiary deleted successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editApiaryModal'));
            modal.hide();
            
            // Reload data and refresh display
            await loadApiaries();
            renderApiaries();
            
            // Update dropdowns
            populateApiarySelects();
        } else {
            showAlert('Failed to delete apiary. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Error deleting apiary:', error);
        showAlert('Error deleting apiary: ' + error.message, 'danger');
    }
}