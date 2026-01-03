import React, { useState, useEffect } from "react";
import VoterService from "../services/VoterService";

const VoterDashboard = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedElection, setSelectedElection] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadElections();
    }, []);

    const loadElections = () => {
        VoterService.getPublishedElections().then(
            (response) => {
                setElections(response.data);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading elections", error);
                setLoading(false);
            }
        );
    };

    const handleVote = () => {
        if (!selectedElection || !selectedCandidate) return;

        VoterService.castVote({
            electionId: selectedElection,
            candidateId: selectedCandidate
        }).then(
            (response) => {
                setMessage("Vote cast successfully!");
                setSelectedElection(null);
                setSelectedCandidate(null);
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) || // My custom error might be in message field or map
                    (error.response && error.response.data) || // If map
                    error.message ||
                    error.toString();
                // If it is a map (validation error), stringify it
                if (typeof resMessage === 'object') {
                    setMessage(JSON.stringify(resMessage));
                } else {
                    setMessage(resMessage);
                }
            }
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Voter Dashboard</h1>
            {message && <div className="bg-blue-100 text-blue-800 p-4 mb-4 rounded">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {elections.map((election) => (
                    <div key={election.id} className="bg-white shadow-md rounded-lg p-6 border-t-4 border-indigo-500 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-bold mb-2">{election.title}</h3>
                        <p className="text-gray-600 mb-4">{election.description}</p>
                        <p className="text-sm text-gray-500 mb-4">
                            Polling: {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                        </p>

                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Candidates:</h4>
                            <div className="space-y-2">
                                {election.candidates && election.candidates.map(candidate => (
                                    <label key={candidate.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                                        <input
                                            type="radio"
                                            name={`election-${election.id}`}
                                            value={candidate.id}
                                            checked={selectedElection === election.id && selectedCandidate === candidate.id}
                                            onChange={() => {
                                                setSelectedElection(election.id);
                                                setSelectedCandidate(candidate.id);
                                            }}
                                            className="form-radio text-indigo-600"
                                        />
                                        <span className="text-gray-800 font-medium">{candidate.name}</span>
                                        <span className="text-gray-500 text-sm">({candidate.party})</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {selectedElection === election.id && (
                            <button
                                onClick={handleVote}
                                className="mt-4 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
                            >
                                Cast Vote
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {elections.length === 0 && !loading && <p>No active elections found.</p>}
        </div>
    );
};

export default VoterDashboard;
