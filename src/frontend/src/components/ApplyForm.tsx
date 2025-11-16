import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ApplyForm() {
    const { jobId } = useParams<{ jobId: string }>();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in');
            return;
        }

        try {
            await api.post('/apply', { job_id: Number(jobId), message });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to apply');
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Apply for Job #{jobId}</h2>
            {error && <p className="text-red-600 mb-3">{error}</p>}
            <form onSubmit={handleSubmit}>
                <textarea
                    placeholder="Message to parent (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border mb-3 rounded h-32"
                />
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
                >
                    Submit Application
                </button>
            </form>
        </div>
    );
}