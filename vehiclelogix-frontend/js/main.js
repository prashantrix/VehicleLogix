// VehicleLogix - Smart Vehicle Service Management Solution
document.addEventListener('DOMContentLoaded', function() {
    // Initialize core components
    initializeComponents();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize application state
    updateRecordsTable();
    updateRegistrationList();
    showSection('home');
});

// Component Initialization
function initializeComponents() {
    // Initialize Bootstrap popovers
    const popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    popovers.forEach(popover => {
        new bootstrap.Popover(popover, {
            trigger: 'focus',
            placement: 'auto',
            container: 'body'
        });
    });

    // Initialize Bootstrap toast
    const alertToast = document.getElementById('alertToast');
    if (alertToast) {
        new bootstrap.Toast(alertToast, {
            delay: 3000,
            animation: true
        });
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            showSection(targetSection);
        });
    });

    // Feature card buttons
    document.querySelectorAll('.feature-card button').forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            showSection(targetSection);
        });
    });

    // Service form
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                vehicleName: document.getElementById('vehicleName').value,
                registrationNumber: document.getElementById('registrationNumber').value,
                ownerName: document.getElementById('ownerName').value,
                ownerMobile: document.getElementById('ownerMobile').value,
                mileage: document.getElementById('mileage').value,
                serviceDate: document.getElementById('serviceDate').value,
                partsChanged: document.getElementById('partsChanged').value
            };

            const editIndex = localStorage.getItem('editIndex');
            if (editIndex !== null) {
                const records = getRecords();
                const existingRecord = records[parseInt(editIndex)];
                if (existingRecord) {
                    formData.additionalInfo = existingRecord.additionalInfo;
                }
                
                saveRecord(formData, parseInt(editIndex));
                localStorage.removeItem('editIndex');
                showToast('Record updated successfully!', 'success');
                showSection('view-records');
                updateActiveLink(document.querySelector('[data-section="view-records"]'));
            } else {
                formData.additionalInfo = '';
                saveRecord(formData);
                showToast('Record added successfully!', 'success');
            }

            // Reset form completely
            this.reset();
            this.querySelectorAll('input, textarea').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        });
    }

    // Vehicle search input
    const vehicleSearchInput = document.getElementById('vehicleSearchInput');
    if (vehicleSearchInput) {
        vehicleSearchInput.addEventListener('input', searchVehicleInfo);
    }
}

// Navigation System
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    // Update navigation state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // Update page title
    const sectionTitle = document.querySelector(`[data-section="${sectionId}"]`).textContent;
    document.title = `VehicleLogix - ${sectionTitle}`;

    // Reset forms when switching sections
    if (sectionId !== 'input-data') {
        const serviceForm = document.getElementById('serviceForm');
        if (serviceForm) {
            serviceForm.reset();
            serviceForm.querySelectorAll('input, textarea').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        }
    }
    if (sectionId !== 'vehicle-info') {
        resetVehicleInfoForm();
    }
}

// Input Validation
function validateInput(input) {
    if (!input) return;
    
    const value = input.value.trim();
    input.classList.remove('is-valid', 'is-invalid');
    
    // Only validate if the field is required or has a value
    if (input.hasAttribute('required') || value) {
        const isValid = input.checkValidity();
        if (isValid && value) {
            input.classList.add('is-valid');
        } else if (!isValid) {
            input.classList.add('is-invalid');
        }
    }
}

// Form Submission Handler
function handleServiceFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        registrationNumber: document.getElementById('registrationNumber').value.trim(),
        serviceType: document.getElementById('serviceType').value,
        mileage: document.getElementById('mileage').value,
        serviceDate: document.getElementById('serviceDate').value,
        serviceCenter: document.getElementById('serviceCenter').value.trim(),
        cost: document.getElementById('cost').value
    };
    
    if (validateServiceRecord(formData)) {
        if (saveServiceRecord(formData)) {
            showAlert('Service record saved successfully!');
            this.reset();
            updateRecordsTable();
            showSection('view-records');
        } else {
            showAlert('Error saving service record. Please try again.', 'danger');
        }
    }
}

// Form Validation
function validateServiceRecord(data) {
    const validations = [
        { condition: !data.registrationNumber, message: 'Please enter a registration number' },
        { condition: !data.serviceType, message: 'Please select a service type' },
        { condition: !data.mileage || isNaN(data.mileage) || Number(data.mileage) <= 0, 
          message: 'Please enter a valid mileage' },
        { condition: !data.serviceDate, message: 'Please select a service date' },
        { condition: !data.serviceCenter, message: 'Please enter a service center' },
        { condition: !data.cost || isNaN(data.cost) || Number(data.cost) <= 0, 
          message: 'Please enter a valid service cost' }
    ];

    for (const validation of validations) {
        if (validation.condition) {
            showAlert(validation.message, 'warning');
            return false;
        }
    }
    return true;
}

// Service Records Management
function saveServiceRecord(data) {
    try {
        const records = JSON.parse(localStorage.getItem('serviceRecords')) || [];
        records.push({
            date: data.serviceDate,
            registrationNumber: data.registrationNumber.toUpperCase(),
            serviceType: data.serviceType,
            mileage: Number(data.mileage),
            serviceCenter: data.serviceCenter,
            cost: Number(data.cost),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('serviceRecords', JSON.stringify(records));
        return true;
    } catch (error) {
        console.error('VehicleLogix: Error saving service record:', error);
        return false;
    }
}

function updateRecordsTable() {
    const recordsTableBody = document.getElementById('recordsTableBody');
    if (!recordsTableBody) return;
    
    const records = JSON.parse(localStorage.getItem('serviceRecords')) || [];
    
    if (records.length === 0) {
        recordsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="text-muted">
                        <i class="fas fa-clipboard-list fa-3x mb-3"></i>
                        <h4 class="mb-3">Welcome to VehicleLogix!</h4>
                        <p class="mb-4">Start managing your vehicle service records with our smart solution.</p>
                        <button class="btn btn-primary btn-lg" onclick="showSection('input-data')">
                            <i class="fas fa-plus me-2"></i>Add First Record
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    recordsTableBody.innerHTML = '';
    records.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${record.registrationNumber}</td>
            <td><span class="badge bg-primary">${record.serviceType}</span></td>
            <td>${record.mileage.toLocaleString('en-IN')} km</td>
            <td>${record.serviceCenter}</td>
            <td>₹${record.cost.toLocaleString('en-IN')}</td>
        `;
        recordsTableBody.appendChild(row);
    });

    // Show success message if records exist
    if (records.length > 0) {
        showAlert(`Displaying ${records.length} service record${records.length > 1 ? 's' : ''}`, 'info');
    }
}

// Vehicle Information Management
function updateRegistrationList() {
    const records = getRecords();
    const datalist = document.getElementById('registrationList');
    
    // Clear existing options
    datalist.innerHTML = '';
    
    // Add unique registration numbers
    const uniqueRegs = [...new Set(records.map(r => r.registrationNumber))];
    uniqueRegs.sort().forEach(reg => {
        const option = document.createElement('option');
        option.value = reg;
        datalist.appendChild(option);
    });
}

function searchVehicleInfo() {
    const regNumber = document.getElementById('vehicleSearchInput').value.trim();
    const records = getRecords();
    const vehicleRecord = records.find(record => 
        record.registrationNumber.toLowerCase() === regNumber.toLowerCase()
    );
    
    const additionalInfoTextarea = document.getElementById('additionalInfo');
    if (vehicleRecord) {
        // Set the additional info and make textarea readonly
        additionalInfoTextarea.value = vehicleRecord.additionalInfo || '';
        additionalInfoTextarea.readOnly = true;
        // Show the record was found
        showToast('Vehicle information loaded successfully', 'success');
    } else {
        // Clear the textarea and make it editable
        additionalInfoTextarea.value = '';
        additionalInfoTextarea.readOnly = false;
        showToast('No vehicle found with this registration number', 'error');
    }
}

// Add this function to save vehicle info
function saveVehicleInfo() {
    const regNumber = document.getElementById('vehicleSearchInput').value.trim();
    const additionalInfo = document.getElementById('additionalInfo').value.trim();
    
    const records = getRecords();
    const index = records.findIndex(record => 
        record.registrationNumber.toLowerCase() === regNumber.toLowerCase()
    );
    
    if (index !== -1) {
        // Update the record with new additional info
        records[index].additionalInfo = additionalInfo;
        localStorage.setItem('vehicleRecords', JSON.stringify(records));
        showToast('Vehicle information updated successfully', 'success');
        updateRecordsTable();
        // Reset the vehicle info form
        resetVehicleInfoForm();
    } else {
        showToast('No vehicle found to update', 'error');
    }
}

function resetVehicleInfoForm() {
    document.getElementById('vehicleSearchInput').value = '';
    const additionalInfoTextarea = document.getElementById('additionalInfo');
    additionalInfoTextarea.value = '';
    additionalInfoTextarea.readOnly = false;
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function showAlert(message, type = 'success') {
    const alertToast = document.getElementById('alertToast');
    if (alertToast) {
        alertToast.querySelector('.toast-body').textContent = message;
        alertToast.className = `toast align-items-center text-white bg-${type} border-0`;
        const toast = new bootstrap.Toast(alertToast, {
            delay: type === 'primary' ? 5000 : 3000,
            autohide: true
        });
        toast.show();
    }
}

// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    // Navigation links and buttons
    const navLinks = document.querySelectorAll('.nav-link, [data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            showSection(targetSection);
            updateActiveLink(document.querySelector(`.nav-link[data-section="${targetSection}"]`));
        });
    });

    // Initialize records table and show home section
    updateRecordsTable();
    updateRegistrationList();
    showSection('home');
});

function updateActiveLink(clickedLink) {
    if (!clickedLink) return;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

// Record management
function saveRecord(record, editIndex = -1) {
    let records = getRecords();
    
    if (editIndex >= 0 && editIndex < records.length) {
        // Update existing record
        const existingRecord = records[editIndex];
        records[editIndex] = {
            ...existingRecord,  // Keep all existing data including additionalInfo
            ...record,         // Update with new data
            additionalInfo: existingRecord.additionalInfo || '' // Preserve additionalInfo
        };
    } else {
        // Add new record
        records.push({
            ...record,
            additionalInfo: record.additionalInfo || ''
        });
    }
    
    localStorage.setItem('vehicleRecords', JSON.stringify(records));
    updateRecordsTable();
    updateRegistrationList();
}

function getRecords() {
    return JSON.parse(localStorage.getItem('vehicleRecords') || '[]');
}

function updateRecordsTable() {
    const records = getRecords();
    const tableBody = document.getElementById('recordsTableBody');
    tableBody.innerHTML = '';

    records.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.vehicleName}</td>
            <td>${record.registrationNumber}</td>
            <td>${record.ownerName}</td>
            <td>${record.ownerMobile}</td>
            <td>${record.mileage}</td>
            <td>${record.serviceDate}</td>
            <td>${record.partsChanged}</td>
            <td>${record.additionalInfo || ''}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editRecord(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecord(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function editRecord(index) {
    const records = getRecords();
    if (records[index]) {
        const record = records[index];
        
        // First switch to the input section
        showSection('input-data');
        updateActiveLink(document.querySelector('[data-section="input-data"]'));
        
        // Then reset the form completely
        const form = document.getElementById('serviceForm');
        if (form) {
            form.reset();
            form.noValidate = true; // Temporarily disable HTML5 validation
            form.querySelectorAll('input, textarea').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        }
        
        // Fill form fields
        document.getElementById('vehicleName').value = record.vehicleName || '';
        document.getElementById('registrationNumber').value = record.registrationNumber || '';
        document.getElementById('ownerName').value = record.ownerName || '';
        document.getElementById('ownerMobile').value = record.ownerMobile || '';
        document.getElementById('mileage').value = record.mileage || '';
        document.getElementById('serviceDate').value = record.serviceDate || '';
        document.getElementById('partsChanged').value = record.partsChanged || '';
        
        localStorage.setItem('editIndex', index);
        
        // Re-enable validation after form is filled
        if (form) {
            form.noValidate = false;
        }
    }
}

function deleteRecord(index, showMessage = true) {
    const records = getRecords();
    records.splice(index, 1);
    localStorage.setItem('vehicleRecords', JSON.stringify(records));
    updateRecordsTable();
    if (showMessage) {
        showToast('Record deleted successfully!', 'success');
    }
}

// Search functionality
function searchRecords(searchTerm) {
    const records = getRecords();
    const filteredRecords = records.filter(record => 
        record.vehicleName.toLowerCase().includes(searchTerm) ||
        record.registrationNumber.toLowerCase().includes(searchTerm) ||
        record.ownerName.toLowerCase().includes(searchTerm)
    );
    
    const tbody = document.getElementById('recordsTableBody');
    tbody.innerHTML = '';
    
    filteredRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.vehicleName}</td>
            <td>${record.registrationNumber}</td>
            <td>${record.ownerName}</td>
            <td>${record.ownerMobile}</td>
            <td>${record.mileage}</td>
            <td>${record.serviceDate}</td>
            <td>${record.partsChanged}</td>
            <td>${record.additionalInfo || ''}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editRecord(${records.findIndex(r => r.registrationNumber === record.registrationNumber)})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecord(${records.findIndex(r => r.registrationNumber === record.registrationNumber)})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('searchRecords').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    searchRecords(searchTerm);
});

// Vehicle Information handling
function updateSearchInput(value) {
    document.getElementById('vehicleSearchInput').value = value;
    if (value) {
        searchVehicleInfo();
    }
}

function searchVehicleInfo() {
    const regNumber = document.getElementById('vehicleSearchInput').value;
    const records = getRecords();
    const vehicleRecord = records.find(record => 
        record.registrationNumber.toLowerCase() === regNumber.toLowerCase()
    );
    
    if (vehicleRecord) {
        document.getElementById('additionalInfo').value = vehicleRecord.additionalInfo || '';
        document.getElementById('registrationSelect').value = vehicleRecord.registrationNumber;
    } else {
        showToast('No vehicle found with this registration number', 'error');
        document.getElementById('additionalInfo').value = '';
        document.getElementById('registrationSelect').value = '';
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('alertToast');
    const toastBody = toast.querySelector('.toast-body');
    
    toast.classList.remove('bg-success', 'bg-danger');
    toast.classList.add(type === 'success' ? 'bg-success' : 'bg-danger');
    
    toastBody.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}