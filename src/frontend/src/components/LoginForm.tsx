import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../api';

export default function LoginForm({ onLogin }: { onLogin: (u: any) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setAuthToken(res.data.token);
            onLogin({ id: 0, name: email.split('@')[0], is_babysitter: false });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border mb-3 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border mb-3 rounded"
                    required
                />
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                    Login
                </button>
            </form>
            <p className="mt-4 text-center">
                No account? <Link to="/register" className="text-indigo-600">Register</Link>
            </p>
        </div>
    );
}