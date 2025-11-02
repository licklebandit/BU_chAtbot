import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ConversationStats = ({ stats }) => {
    if (!stats) return null;

    const { total, recent, dailyCounts, hourlyCounts, messageStats } = stats;

    // Format data for daily chart
    const dailyChartData = {
        labels: dailyCounts.map(d => new Date(d._id).toLocaleDateString()),
        datasets: [{
            label: 'Daily Conversations',
            data: dailyCounts.map(d => d.count),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }]
    };

    // Format data for hourly chart
    const hourlyChartData = {
        labels: hourlyCounts.map(h => new Date(h._id).toLocaleTimeString()),
        datasets: [{
            label: 'Hourly Conversations',
            data: hourlyCounts.map(h => h.count),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Conversations</h3>
                    <p className="text-3xl font-bold text-blue-600">{total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Last 24 Hours</h3>
                    <p className="text-3xl font-bold text-green-600">{recent.last24Hours}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Last 7 Days</h3>
                    <p className="text-3xl font-bold text-purple-600">{recent.lastWeek}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Last 30 Days</h3>
                    <p className="text-3xl font-bold text-orange-600">{recent.lastMonth}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Daily Activity (Last 7 Days)</h3>
                    <Line data={dailyChartData} options={chartOptions} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Hourly Activity (Last 24 Hours)</h3>
                    <Line data={hourlyChartData} options={chartOptions} />
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Message Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Average Messages per Conversation</p>
                        <p className="text-2xl font-bold text-indigo-600">
                            {messageStats.avgMessages.toFixed(1)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Maximum Messages in a Conversation</p>
                        <p className="text-2xl font-bold text-indigo-600">
                            {messageStats.maxMessages}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationStats;