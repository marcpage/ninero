import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../api';

export default function RegisterForm({ onRegister }: { onRegister: (u: any) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isBabysitter, setIsBabysitter] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/register', { email, password, name, is_babysitter: isBabysitter });
            localStorage.setItem('token', res.data.token);
            setAuthToken(res.data.token);
            onRegister({ id: 0, name, is_babysitter: isBabysitter });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border mb-3 rounded"
                    required
                />
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
                <label className="flex items-center mb-3">
                    <input
                        type="checkbox"
                        checked={isBabysitter}
                        onChange={(e) => setIsBabysitter(e.target.checked)}
                        className="mr-2"
                    />
                    I am a babysitter
                </label>
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
                    Register
                </button>
            </form>
            <p className="mt-4 text-center">
                Already have an account? <Link to="/login" className="text-indigo-600">Login</Link>
            </p>
        </div>
    );
}