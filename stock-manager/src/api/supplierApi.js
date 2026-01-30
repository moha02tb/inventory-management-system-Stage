import axios from "axios";
import API_URL from "../config";

const SUPPLIERS_URL = `${API_URL}/suppliers`;

const getToken = () => localStorage.getItem("token");
const getConfig = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});

export const getSuppliers = async () => {
    const res = await axios.get(SUPPLIERS_URL, getConfig());
    return res.data;
};

export const createSupplier = async (data) => {
    const res = await axios.post(SUPPLIERS_URL, data, getConfig());
    return res.data;
};

export const updateSupplier = async (id, data) => {
    const res = await axios.put(`${SUPPLIERS_URL}/${id}`, data, getConfig());
    return res.data;
};

export const deleteSupplier = async (id) => {
    const res = await axios.delete(`${SUPPLIERS_URL}/${id}`, getConfig());
    return res.data;
};
