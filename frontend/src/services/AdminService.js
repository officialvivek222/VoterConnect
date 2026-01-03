import axios from "axios";
import AuthService from "./AuthService";

const API_URL = "http://localhost:8080/admin/";

const getAuthHeader = () => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
}

const createElection = (data) => {
    return axios.post(API_URL + "elections", data, { headers: getAuthHeader() });
};

const getAllElections = () => {
    return axios.get(API_URL + "elections", { headers: getAuthHeader() });
};

const publishElection = (id) => {
    return axios.put(API_URL + `elections/${id}/publish`, {}, { headers: getAuthHeader() });
};

const addCandidate = (id, data) => {
    return axios.post(API_URL + `elections/${id}/candidates`, data, { headers: getAuthHeader() });
};

const getResults = (id) => {
    return axios.get(API_URL + `results/${id}`, { headers: getAuthHeader() });
}

const AdminService = {
    createElection,
    getAllElections,
    publishElection,
    addCandidate,
    getResults
};

export default AdminService;
