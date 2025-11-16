import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import ApplyForm from './components/ApplyForm';
import { useEffect, useState } from 'react';
import api, { setAuthToken } from './api';

function App() {
    const [user, setUser] = useState<{ id: number; name: string; is_babysitter: boolean } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            // Optional: decode token to get user info
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload.sub,
                    name: localStorage.getItem('userName') || 'User',
                    is_babysitter: payload.is_babysitter || false,
                });
            } catch {
                // invalid token
            }
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-indigo-600 p-4 text-white">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Babysitter Match</h1>
                    {user && (
                        <button onClick={logout} className="bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded">
                            Logout
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-4">
                <Routes>
                    <Route path="/" element={<JobList />} />
                    <Route path="/login" element={<LoginForm onLogin={setUser} />} />
                    <Route path="/register" element={<RegisterForm onRegister={setUser} />} />
                    <Route path="/post-job" element={user ? <JobForm /> : <Navigate to="/login" />} />
                    <Route path="/apply/:jobId" element={user ? <ApplyForm /> : <Navigate to="/login" />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;