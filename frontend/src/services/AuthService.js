import axios from "axios";

const API_URL = "http://localhost:8080/auth/";

const register = (name, email, password, role) => {
    return axios.post(API_URL + "signup", {
        name,
        email,
        password,
        role,
    });
};

const login = (email, password) => {
    return axios
        .post(API_URL + "login", {
            email,
            password,
        })
        .then((response) => {
            // If login returns token (direct) or msg (OTP sent)
            // Check response structure
            return response.data;
        });
};

const verifyOtp = (email, otp) => {
    return axios.post(API_URL + "verify-otp", {
        email,
        otp
    }).then(response => {
        if (response.data.token) {
            localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    });
}

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

const AuthService = {
    register,
    login,
    verifyOtp,
    logout,
    getCurrentUser,
};

export default AuthService;
