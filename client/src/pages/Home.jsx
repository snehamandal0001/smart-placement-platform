import { useState, useEffect } from 'react';
import api from '../utils/api';

const Home = () => {
  // 1. State to hold our jobs and loading status
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. useEffect runs automatically when the page loads
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // 3. Make the API request to our backend (proxy handles the localhost:5000 part)
        const response = await api.get('/jobs');
        
        // 4. Save the jobs into our state
        setJobs(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // The empty array ensures this only runs ONCE.

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Latest Job Postings</h1>
      
      {loading ? (
        <p className="text-center text-xl text-gray-600">Loading jobs from database...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 5. Loop through the jobs array and render a card for each one */}
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold text-blue-600">{job.title}</h2>
              <p className="text-gray-700 font-medium mt-1">{job.company}</p>
              
              <div className="mt-4 flex flex-col space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold">Location:</span> {job.location}</p>
                <p><span className="font-semibold">Salary:</span> {job.salary}</p>
                <p><span className="font-semibold">Type:</span> {job.jobType}</p>
              </div>
              
              <button className="mt-6 w-full bg-blue-50 text-blue-600 font-semibold py-2 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;