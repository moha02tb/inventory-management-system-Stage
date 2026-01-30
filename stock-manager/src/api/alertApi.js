import axios from 'axios';
import API_URL from '../config'; 

const ALERTS_URL = `${API_URL}/alerts`;

// --- Utility function to get the token ---
const getToken = () => localStorage.getItem('token');

// --- Utility function to set the Authorization header ---
const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});

// =======================================================
// GET OPEN STOCK ALERTS (GET /api/alerts)
// Used by Dashboard.jsx (Requires 'admin' role, as defined in Express middleware)
// =======================================================
export const getOpenStockAlerts = async () => {
    try {
        const response = await axios.get(ALERTS_URL, getConfig());
        
        // The backend returns details of the open alerts joined with product data
        // e.g., [{ id, type, date, produitNom, currentQuantite, threshold }, ...]
        return response.data; 
    } catch (error) {
        console.error('Error fetching stock alerts:', error.response ? error.response.data : error.message);
        // If the request fails (e.g., unauthorized access), return an empty array.
        return [];
    }
};

// You could add a function here later to close or acknowledge an alert (PUT /api/alerts/:id)