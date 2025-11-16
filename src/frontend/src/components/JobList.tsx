import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Job {
    id: number;
    title: string;
    description: string;
}

export default function JobList() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/jobs').then((res) => {
            setJobs(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <p className="text-center">Loading jobs...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Available Jobs</h2>
                <Link
                    to="/post-job"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Post a Job
                </Link>
            </div>

            {jobs.length === 0 ? (
                <p className="text-gray-600">No jobs posted yet.</p>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white p-4 rounded shadow">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-gray-700">{job.description}</p>
                            <Link
                                to={`/apply/${job.id}`}
                                className="mt-2 inline-block text-indigo-600 hover:underline"
                            >
                                Apply →
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}