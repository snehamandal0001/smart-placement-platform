import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New State for the Applicants Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    if (user?.role !== 'recruiter') {
      navigate('/');
      return;
    }

    const fetchMyJobs = async () => {
      try {
        const response = await api.get('/jobs');
        const recruiterJobs = response.data.data.filter(
          (job) => job.postedBy === user._id
        );
        setMyJobs(recruiterJobs);
      } catch (error) {
        console.error('Error fetching dashboard jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, [user, navigate]);

  // Function to fetch applicants when the button is clicked
  const handleViewApplicants = async (job) => {
    setSelectedJobTitle(job.title);
    setIsModalOpen(true);
    setLoadingApps(true);
    setApplications([]); // Clear previous data

    try {
      const response = await api.get(`/applications/job/${job._id}`);
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Recruiter Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition-colors">
          + Post New Job
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-lg">Loading your workspace...</p>
      ) : myJobs.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center border border-gray-100">
          <p className="text-gray-500">You haven't posted any jobs yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-700">Job Title</th>
                <th className="p-4 font-semibold text-gray-700">Location</th>
                <th className="p-4 font-semibold text-gray-700">Type</th>
                <th className="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myJobs.map((job) => (
                <tr key={job._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{job.title}</td>
                  <td className="p-4 text-gray-600">{job.location}</td>
                  <td className="p-4 text-gray-600">{job.jobType}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleViewApplicants(job)}
                      className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200 hover:bg-green-600 hover:text-white transition-colors"
                    >
                      View Applicants
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicants Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Applicants for {selectedJobTitle}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {loadingApps ? (
              <p className="text-gray-600 text-center py-4">Fetching candidates...</p>
            ) : applications.length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded">
                No students have applied for this position yet.
              </p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app._id} className="border border-gray-200 rounded p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{app.applicant.name}</h3>
                      <p className="text-sm text-gray-600">{app.applicant.email}</p>
                    </div>
                    <a 
                      href={app.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-medium hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      View Resume
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;