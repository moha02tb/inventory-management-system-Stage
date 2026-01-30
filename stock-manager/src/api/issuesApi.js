import axios from 'axios';
import API_URL from '../config';

const ISSUES_URL = `${API_URL}/issues`;

export const getIssues = async () => {
    try {
        const response = await axios.get(ISSUES_URL, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching issues:', error);
        throw error;
    }
};

export const addIssue = async (issueData) => {
    try {
        const response = await axios.post(ISSUES_URL, issueData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error adding issue:', error);
        throw error;
    }
};

export const getIssuesReport = async () => {
    try {
        // Backend route: GET /api/issues/admin/report (see issuesRoutes.js)
        const response = await axios.get(`${API_URL}/issues/admin/report`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching issues report:', error);
        throw error;
    }
};

export const updateIssueStatus = async (issueId, status) => {
    try {
        const response = await axios.put(`${ISSUES_URL}/${issueId}`, { status }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating issue:', error);
        throw error;
    }
};
