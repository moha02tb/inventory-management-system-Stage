import axios from 'axios';
import API_URL from '../config'; 

const AUTH_URL = `${API_URL}/auth`;

// --- Helper for JWT Decoding (Made Robust) ---
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        const user = payload?.user || {};
        const role = user.role;
        const name = user.name || user.nom || null;

        if (role) {
            return { role, name };
        }

        console.error("JWT Decode Error: Role structure not found in payload. Check backend JWT payload.");
        return { role: null, name: null };
    } catch (e) {
        console.error("JWT Decode Error: Token is malformed or decoding failed.", e);
        return { role: null, name: null };
    }
};

// --- Token Management ---
const getToken = () => localStorage.getItem('token');
const setAuthData = (token, role, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    if (name) {
        localStorage.setItem('userName', name);
    } else {
        localStorage.removeItem('userName');
    }
};
const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
};

// --- API Calls ---

// 1. Login Function (Connects to POST /api/auth/login)
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${AUTH_URL}/login`, { email, motDePasse: password });
        
        const { token } = response.data;
        
        // CRITICAL: Use the safer decoding function
        const { role, name } = decodeToken(token); 

        if (role) {
            setAuthData(token, role, name); // Store token, role, and name
            console.log("LOGIN SUCCESS: Token stored, Role:", role);
            return { success: true, token, role, name };
        } else {
            // If decoding fails but token was received, treat as a client-side configuration error
            return { success: false, msg: 'Authentication failed due to client error (JWT structure). Check console.' };
        }

    } catch (error) {
        // This block catches network errors or backend 400/500 errors
        const errorMessage = error.response?.data?.msg || "Login failed. Server is unreachable or credential error.";
        console.error('Login failed:', error.response ? error.response.data : error.message);
        return { success: false, msg: errorMessage };
    }
};

// 2. Logout Function
export const logoutUser = () => {
    clearAuthData();
};

// 3. Authorization Check
export const checkAuthStatus = () => {
    const token = getToken();
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (token) {
        return { isAuthenticated: true, role: role, name };
    }
    return { isAuthenticated: false, role: null, name: null };
};
