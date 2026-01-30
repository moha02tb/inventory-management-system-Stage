import axios from 'axios';
import API_URL from '../config'; 

const MOVEMENTS_URL = `${API_URL}/movements`;

const getToken = () => localStorage.getItem('token');
const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});

// =======================================================
// 1. GET ALL STOCK MOVEMENTS (GET /api/movements)
// Used by StockMovement.jsx
// =======================================================
export const getStockMovements = async () => {
    try {
        const response = await axios.get(MOVEMENTS_URL, getConfig());
        return response.data; 
    } catch (error) {
        console.error('Error fetching stock movements:', error);
        return [];
    }
};

// =======================================================
// 2. RECORD NEW MOVEMENT (POST /api/movements)
// Used by StockMovement.jsx (Triggers the MySQL database logic)
// =======================================================
export const addStockMovement = async (movementData) => {
    // movementData structure: { produitId, type ('IN'/'OUT'), quantité, raison, fournisseurId? }
    try {
        const response = await axios.post(MOVEMENTS_URL, movementData, getConfig());
        return response.data; 
    } catch (error) {
        console.error('Error recording movement:', error.response ? error.response.data : error.message);
        throw error; // Propagate error (e.g., if quantity is invalid or DB fails)
    }
};
