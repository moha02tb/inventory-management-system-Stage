import axios from 'axios';
import API_URL from '../config';

const SALES_URL = `${API_URL}/sales`;

export const getSales = async () => {
    try {
        const response = await axios.get(SALES_URL, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching sales:', error);
        throw error;
    }
};

export const addSale = async (saleData) => {
    try {
        const response = await axios.post(SALES_URL, saleData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding sale:', error);
        throw error;
    }
};

export const getSalesReport = async () => {
    try {
        // Backend route: GET /api/sales/admin/report (see salesRoutes.js)
        const response = await axios.get(`${API_URL}/sales/admin/report`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching sales report:', error);
        throw error;
    }
};
