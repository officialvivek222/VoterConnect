import React, { useState, useEffect } from "react";
import AdminService from "../services/AdminService";
import ElectionResults from "../components/ElectionResults";

const AdminDashboard = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // Create Election Form State
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Add Candidate Form State (mapped by election ID)
    const [candidateName, setCandidateName] = useState({});
    const [candidateParty, setCandidateParty] = useState({});
    const [viewResults, setViewResults] = useState({}); // Map: electionId -> boolean

    useEffect(() => {
        loadElections();
    }, []);

    const loadElections = () => {
        AdminService.getAllElections().then(
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

    const handleCreateElection = (e) => {
        e.preventDefault();
        setMessage("");
        AdminService.createElection({
            title: newTitle,
            description: newDesc,
            startDate: startDate, // Assuming ISO string or format required by backend
            endDate: endDate
        }).then(
            () => {
                setMessage("Election created successfully!");
                setNewTitle("");
                setNewDesc("");
                setStartDate("");
                setEndDate("");
                loadElections();
            },
            (error) => {
                setMessage("Failed to create election.");
            }
        );
    };

    const handlePublish = (id) => {
        AdminService.publishElection(id).then(
            () => {
                loadElections();
            },
            (error) => {
                alert("Failed to publish election");
            }
        );
    };

    const handleAddCandidate = (electionId) => {
        const name = candidateName[electionId];
        const party = candidateParty[electionId];
        if (!name || !party) return;

        AdminService.addCandidate(electionId, {
            name: name,
            party: party,
            electionId: electionId
        }).then(
            () => {
                setCandidateName({ ...candidateName, [electionId]: "" });
                setCandidateParty({ ...candidateParty, [electionId]: "" });
                loadElections(); // Reload to show new candidate
            },
            (error) => {
                alert("Failed to add candidate");
            }
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

            {/* Create Election Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Create New Election</h2>
                <form onSubmit={handleCreateElection} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input type="text" placeholder="Title" className="border p-2 rounded" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                    <input type="text" placeholder="Description" className="border p-2 rounded" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                    <input type="datetime-local" className="border p-2 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    <input type="datetime-local" className="border p-2 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 md:col-span-2">Create Election</button>
                </form>
                {message && <p className="mt-2 text-green-600">{message}</p>}
            </div>

            {/* Elections List */}
            <div className="grid grid-cols-1 gap-6">
                {elections.map((election) => (
                    <div key={election.id} className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <h3 className="text-2xl font-bold">{election.title}</h3>
                                <p className="text-gray-600">{election.description}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Status: <span className={`font-bold ${election.published ? "text-green-600" : "text-yellow-600"}`}>
                                        {election.published ? "Published" : "Draft"}
                                    </span>
                                </p>
                            </div>
                            {!election.published && (
                                <button onClick={() => handlePublish(election.id)} className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 w-full md:w-auto">
                                    Publish Election
                                </button>
                            )}
                        </div>

                        {/* Candidates Section */}
                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold mb-2">Candidates</h4>
                            <ul className="list-disc list-inside mb-4">
                                {election.candidates && election.candidates.map(c => (
                                    <li key={c.id} className="text-gray-700">{c.name} ({c.party})</li>
                                ))}
                            </ul>

                            {/* Add Candidate Form */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Candidate Name"
                                    className="border p-1 rounded flex-1 w-full"
                                    value={candidateName[election.id] || ""}
                                    onChange={(e) => setCandidateName({ ...candidateName, [election.id]: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Party"
                                    className="border p-1 rounded flex-1 w-full"
                                    value={candidateParty[election.id] || ""}
                                    onChange={(e) => setCandidateParty({ ...candidateParty, [election.id]: e.target.value })}
                                />
                                <button onClick={() => handleAddCandidate(election.id)} className="bg-purple-600 text-white py-1 px-3 rounded text-sm hover:bg-purple-700 w-full sm:w-auto">
                                    Add Cand.
                                </button>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="mt-4 border-t pt-4">
                            <button
                                onClick={() => setViewResults({ ...viewResults, [election.id]: !viewResults[election.id] })}
                                className="text-blue-600 hover:underline"
                            >
                                {viewResults[election.id] ? "Hide Results" : "View Results"}
                            </button>
                            {viewResults[election.id] && (
                                <div className="mt-4">
                                    <ElectionResults electionId={election.id} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
