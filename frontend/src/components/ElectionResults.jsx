import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AdminService from '../services/AdminService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ElectionResults = ({ electionId }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AdminService.getResults(electionId).then(
            (response) => {
                const results = response.data; // Map: Candidate Name -> Count
                const labels = Object.keys(results);
                const data = Object.values(results);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Votes',
                            data: data,
                            backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        },
                    ],
                });
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching results", error);
                setLoading(false);
            }
        );
    }, [electionId]);

    if (loading) return <p>Loading results...</p>;
    if (!chartData) return <p>No data available</p>;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Election Results',
            },
        },
    };

    return <Bar options={options} data={chartData} />;
};

export default ElectionResults;
