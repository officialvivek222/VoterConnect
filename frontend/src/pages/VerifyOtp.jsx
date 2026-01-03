import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthService from "../services/AuthService";

const VerifyOtp = () => {
    const location = useLocation();
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const [emailInput, setEmailInput] = useState("");
    const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

    const email = location.state?.email || emailInput;

    if (!location.state?.email && !isEmailSubmitted) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Enter Email</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                        <button
                            onClick={() => setIsEmailSubmitted(true)}
                            className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleVerify = (e) => {
        e.preventDefault();
        setMessage("");

        AuthService.verifyOtp(email, otp).then(
            () => {
                navigate("/voter"); // Or admin depending on role, but for now /voter which is shared or I'll check role
                const user = AuthService.getCurrentUser();
                if (user.roles.includes("ADMIN")) {
                    navigate("/admin");
                }
                window.location.reload();
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                setMessage(resMessage);
            }
        );
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Verify OTP</h2>
                <p className="mb-4 text-center text-gray-600">Enter the OTP sent to {email}</p>
                <form onSubmit={handleVerify}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
                    >
                        Verify
                    </button>
                    {message && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;
