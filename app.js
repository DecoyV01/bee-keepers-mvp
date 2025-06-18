// BEE Keepers MVP - Frontend Application (Part 2)
// Continuation of app.js

                action: 'add',
                sheet: 'Inspections',
                record: inspectionData
            })
        });
        
        const result = await response.json();
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
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add',
                sheet: 'Metrics',
                record: {
                    ...metricData,
                    Source: metricData.Source || 'Manual'
                }
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showAlert('Metric recorded successfully!', 'success');
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('addMetricModal')).hide();
            await loadMetrics();
            loadMetricsForHive();
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
    
    if (!taskData.Title) {
        showAlert('Please enter a task title', 'warning');
        return;
    }
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add',
                sheet: 'Tasks',
                record: {
                    ...taskData,
                    Status: 'Pending',
                    Priority: taskData.Priority || 'Medium'
                }
            })
        });
        
        const result = await response.json();
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

async function completeTask(taskId) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update',
                sheet: 'Tasks',
                id: taskId,
                record: {
                    Status: 'Completed',
                    Completed_Date: new Date().toISOString().split('T')[0]
                }
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showAlert('Task completed!', 'success');
            await loadTasks();
            updateDashboard();
            renderTasks();
        } else {
            showAlert('Error completing task: ' + result.error.message, 'danger');
        }
    } catch (error) {
        console.error('Error completing task:', error);
        showAlert('Error completing task. Please try again.', 'danger');
    }
}

// Modal functions
function showAddHiveModal() {
    const modal = new bootstrap.Modal(document.getElementById('addHiveModal'));
    modal.show();
}

function showAddInspectionModal() {
    populateHiveSelects();
    if (allHives.length === 0) {
        showAlert('Please add a hive first before recording inspections.', 'warning');
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('addInspectionModal'));
    modal.show();
}

function showAddMetricModal() {
    populateHiveSelects();
    if (allHives.length === 0) {
        showAlert('Please add a hive first before recording metrics.', 'warning');
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('addMetricModal'));
    modal.show();
}

function showAddTaskModal() {
    populateHiveSelects();
    const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    modal.show();
}

// Quick action functions
function quickInspection(hiveId) {
    populateHiveSelects();
    document.getElementById('inspectionHiveSelect').value = hiveId;
    showAddInspectionModal();
}

function addMetricForHive(hiveId) {
    populateHiveSelects();
    document.getElementById('metricHiveSelect').value = hiveId;
    showAddMetricModal();
}

// Metrics and charts
function loadMetricsForHive() {
    const hiveId = document.getElementById('metricsHiveSelect').value;
    if (!hiveId) {
        document.getElementById('latestMetrics').innerHTML = '<p class="text-muted">Select a hive to view metrics</p>';
        return;
    }
    
    const hiveMetrics = allMetrics.filter(m => m.Hive_ID == hiveId);
    const latest = hiveMetrics
        .filter(m => m.Date)
        .sort((a, b) => new Date(b.Date) - new Date(a.Date))[0];
    
    const container = document.getElementById('latestMetrics');
    if (latest) {
        container.innerHTML = `
            <div class="row">
                <div class="col-4">
                    <div class="metric-display">
                        <h4 class="text-primary">${latest.Temperature || 'N/A'}</h4>
                        <small>Temperature (°F)</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="metric-display">
                        <h4 class="text-success">${latest.Weight || 'N/A'}</h4>
                        <small>Weight (lbs)</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="metric-display">
                        <h4 class="text-info">${latest.Humidity || 'N/A'}</h4>
                        <small>Humidity (%)</small>
                    </div>
                </div>
            </div>
            <hr>
            <small class="text-muted">Last updated: ${new Date(latest.Date).toLocaleDateString()}</small>
        `;
    } else {
        container.innerHTML = '<p class="text-muted">No metrics recorded for this hive yet.</p>';
    }
    
    // Update charts
    updateCharts(hiveMetrics);
}

function updateCharts(metrics) {
    // Temperature Chart
    const tempCanvas = document.getElementById('temperatureChart');
    const weightCanvas = document.getElementById('weightChart');
    
    if (tempCanvas.chart) tempCanvas.chart.destroy();
    if (weightCanvas.chart) weightCanvas.chart.destroy();
    
    // Filter and prepare temperature data
    const tempData = metrics
        .filter(m => m.Temperature && m.Date)
        .sort((a, b) => new Date(a.Date) - new Date(b.Date))
        .slice(-7); // Last 7 readings
    
    if (tempData.length > 0) {
        tempCanvas.chart = new Chart(tempCanvas, {
            type: 'line',
            data: {
                labels: tempData.map(m => new Date(m.Date).toLocaleDateString()),
                datasets: [{
                    label: 'Temperature (°F)',
                    data: tempData.map(m => parseFloat(m.Temperature)),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Filter and prepare weight data
    const weightData = metrics
        .filter(m => m.Weight && m.Date)
        .sort((a, b) => new Date(a.Date) - new Date(b.Date))
        .slice(-7); // Last 7 readings
    
    if (weightData.length > 0) {
        weightCanvas.chart = new Chart(weightCanvas, {
            type: 'line',
            data: {
                labels: weightData.map(m => new Date(m.Date).toLocaleDateString()),
                datasets: [{
                    label: 'Weight (lbs)',
                    data: weightData.map(m => parseFloat(m.Weight)),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Utility functions
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert.position-fixed');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;';
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

async function syncData() {
    const btn = document.getElementById('syncBtn');
    if (!btn) return;
    
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Syncing...';
    btn.disabled = true;
    
    try {
        await loadAllData();
        showAlert('Data synced successfully!', 'success');
        
        // Refresh current section
        const currentSection = document.querySelector('.section:not(.d-none)');
        if (currentSection) {
            const sectionId = currentSection.id;
            switch(sectionId) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'hives':
                    renderHives();
                    break;
                case 'inspections':
                    renderInspections();
                    break;
                case 'tasks':
                    renderTasks();
                    break;
            }
        }
    } catch (error) {
        console.error('Sync error:', error);
        showAlert('Sync failed. Please try again.', 'danger');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// Placeholder functions for future features
function viewInspectionDetails(inspectionId) {
    const inspection = allInspections.find(i => i.ID == inspectionId);
    if (inspection) {
        const hive = allHives.find(h => h.ID == inspection.Hive_ID);
        const hiveName = hive ? hive.Name : `Hive ${inspection.Hive_ID}`;
        
        let details = `
            <strong>Hive:</strong> ${hiveName}<br>
            <strong>Date:</strong> ${new Date(inspection.Date).toLocaleDateString()}<br>
            <strong>Inspector:</strong> ${inspection.Inspector}<br>
            <strong>Duration:</strong> ${inspection.Duration || 'N/A'} minutes<br><br>
            
            <strong>Queen Status:</strong><br>
            - Present: ${inspection.Queen_Present || 'Unknown'}<br>
            - Laying: ${inspection.Queen_Laying || 'Unknown'}<br>
            - Brood Pattern: ${inspection.Brood_Pattern ? inspection.Brood_Pattern + '/5' : 'Not assessed'}<br><br>
            
            <strong>Resources:</strong><br>
            - Honey Stores: ${inspection.Honey_Stores ? inspection.Honey_Stores + '/5' : 'Not assessed'}<br>
            - Weather: ${inspection.Weather || 'Not recorded'}<br><br>
        `;
        
        if (inspection.Notes) {
            details += `<strong>Notes:</strong><br>${inspection.Notes}`;
        }
        
        showAlert(details, 'info');
    }
}

// Initialize charts when metrics section is first shown
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Chart.js to load
    setTimeout(() => {
        const tempCanvas = document.getElementById('temperatureChart');
        const weightCanvas = document.getElementById('weightChart');
        
        if (tempCanvas && weightCanvas) {
            // Initialize empty charts
            tempCanvas.chart = new Chart(tempCanvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Temperature (°F)',
                        data: [],
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: false }
                    }
                }
            });
            
            weightCanvas.chart = new Chart(weightCanvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Weight (lbs)',
                        data: [],
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: false }
                    }
                }
            });
        }
    }, 1000);
});

console.log('🐝 BEE Keepers MVP JavaScript loaded successfully!');