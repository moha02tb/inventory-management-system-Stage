import axios from 'axios';
import API_URL from '../config'; // Assuming you created this config file

// Define your two main endpoints
const PRODUCTS_URL = `${API_URL}/products`;
const CATEGORIES_URL = `${API_URL}/categories`; 

// --- Utility function to get the token ---
const getToken = () => localStorage.getItem('token');

// --- Utility function to set the Authorization header ---
// This function must be called for every API request that requires authentication.
const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});

// =======================================================
// PRODUCT CRUD OPERATIONS
// =======================================================

// 1. GET ALL PRODUCTS (GET /api/products)
export const getProducts = async () => {
    try {
        // Includes the JWT token in the header
        const response = await axios.get(PRODUCTS_URL, getConfig());
        return response.data; 
    } catch (error) {
        console.error('Error fetching products:', error.response ? error.response.data : error.message);
        // Throw the error so components can handle 401/403 errors (e.g., redirect to login)
        throw error; 
    }
};

// 2. ADD PRODUCT (POST /api/products)
export const addProduct = async (productData) => {
    try {
        const response = await axios.post(PRODUCTS_URL, productData, getConfig());
        return response.data; 
    } catch (error) {
        console.error('Error adding product:', error.response ? error.response.data : error.message);
        throw error; 
    }
};

// 3. GET PRODUCT BY ID (GET /api/products/:id)
export const getProductById = async (id) => {
    try {
        const response = await axios.get(`${PRODUCTS_URL}/${id}`, getConfig()); 
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// 4. UPDATE PRODUCT (PUT /api/products/:id)
export const updateProduct = async (id, updatedData) => {
    try {
        const response = await axios.put(`${PRODUCTS_URL}/${id}`, updatedData, getConfig());
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// 5. DELETE PRODUCT (DELETE /api/products/:id)
export const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(`${PRODUCTS_URL}/${id}`, getConfig());
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error.response ? error.response.data : error.message);
        throw error;
    } 
};

// =======================================================
// CATEGORY UTILITY (Used by AddProduct/EditProduct)
// =======================================================

/**
 * Fetches the list of all product categories.
 * This is crucial for populating the category dropdown in forms.
 */
export const getCategories = async () => {
    try {
        // Categories typically requires authentication as well
        const response = await axios.get(CATEGORIES_URL, getConfig()); 
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error.response ? error.response.data : error.message);
        // Return an empty array or throw, depending on required error handling
        throw error; 
    }
};