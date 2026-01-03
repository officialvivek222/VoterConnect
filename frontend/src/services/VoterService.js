import axios from "axios";
import AuthService from "./AuthService";

const API_URL = "http://localhost:8080/voter/";

const getAuthHeader = () => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
}

const getPublishedElections = () => {
    return axios.get(API_URL + "elections", { headers: getAuthHeader() });
};

const castVote = (data) => {
    return axios.post(API_URL + "vote", data, { headers: getAuthHeader() });
};

const VoterService = {
    getPublishedElections,
    castVote
};

export default VoterService;
