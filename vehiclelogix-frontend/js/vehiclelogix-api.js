// VehicleLogix API Service
const API_BASE_URL = 'http://localhost:8000/api/v1';

class VehicleLogixAPI {
    // Vehicle endpoints
    static async createVehicle(vehicleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vehicleData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating vehicle:', error);
            return null;
        }
    }

    static async getVehicle(vehicleId) {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            return null;
        }
    }

    // Service record endpoints
    static async createServiceRecord(recordData) {
        try {
            const response = await fetch(`${API_BASE_URL}/service-records/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordData)
            });
            
            // If API call successful, also save to localStorage for backwards compatibility
            if (response.ok) {
                const apiData = await response.json();
                // Get existing records from localStorage
                const existingRecords = JSON.parse(localStorage.getItem('serviceRecords') || '[]');
                existingRecords.push(recordData);
                localStorage.setItem('serviceRecords', JSON.stringify(existingRecords));
                return apiData;
            }
            return null;
        } catch (error) {
            console.error('Error creating service record:', error);
            // Fallback to localStorage only if API fails
            const existingRecords = JSON.parse(localStorage.getItem('serviceRecords') || '[]');
            existingRecords.push(recordData);
            localStorage.setItem('serviceRecords', JSON.stringify(existingRecords));
            return recordData;
        }
    }

    static async getServiceHistory(vehicleId) {
        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/service-history/`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching service history:', error);
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('serviceRecords') || '[]');
        }
    }

    static async getUpcomingServices() {
        try {
            const response = await fetch(`${API_BASE_URL}/service-records/upcoming/`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching upcoming services:', error);
            return [];
        }
    }
    
}

// Silent connection check without popups
async function testBackendConnection() {
    try {
        const response = await fetch('http://localhost:8000/');
        if (response.ok) {
            console.log('Backend connected');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Backend connection error:', error);
        return false;
    }
}
