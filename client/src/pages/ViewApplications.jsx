import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const ViewApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get(`/applications/job/${jobId}`);
        setApplications(response.data.data);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Job Applications</h1>
        <Link to="/" className="text-blue-600 hover:underline font-medium">← Back to Jobs</Link>
      </div>

      {loading ? (
        <p className="text-center text-xl text-gray-600">Loading applicants...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">No students have applied for this position yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase text-sm">
                <th className="p-4 border-b dark:border-gray-600">Applicant Name</th>
                <th className="p-4 border-b dark:border-gray-600">Email</th>
                <th className="p-4 border-b dark:border-gray-600">CGPA</th>
                <th className="p-4 border-b dark:border-gray-600">Resume</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-4 border-b dark:border-gray-600 font-medium text-gray-800 dark:text-white">
                    {app.applicant.name}
                  </td>
                  <td className="p-4 border-b dark:border-gray-600 text-gray-600 dark:text-gray-300">
                    {app.applicant.email}
                  </td>
                  <td className="p-4 border-b dark:border-gray-600 text-gray-600 dark:text-gray-300">
                    {app.applicant.cgpa || 'N/A'}
                  </td>
                  <td className="p-4 border-b dark:border-gray-600">
                    <a 
                      href={app.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-medium text-sm"
                    >
                      View Resume
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;