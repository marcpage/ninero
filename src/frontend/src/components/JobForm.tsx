import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function JobForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to post a job');
            return;
        }

        try {
            await api.post('/jobs', { title, description });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to post job');
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Post a New Job</h2>
            {error && <p className="text-red-600 mb-3">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Job title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border mb-3 rounded"
                    required
                />
                <textarea
                    placeholder="Description (e.g., 2 kids, Saturday 6-10pm)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border mb-3 rounded h-32"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                    Post Job
                </button>
            </form>
        </div>
    );
}