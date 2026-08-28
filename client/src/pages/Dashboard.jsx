import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Applicants Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [loadingApps, setLoadingApps] = useState(false);

  // NEW: Post Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'Full-Time'
  });

  useEffect(() => {
    if (user?.role !== 'recruiter') {
      navigate('/');
      return;
    }
    const fetchMyJobs = async () => {
      try {
        const response = await api.get('/jobs');
        const recruiterJobs = response.data.data.filter((job) => job.postedBy === user._id);
        setMyJobs(recruiterJobs);
      } catch (error) {
        console.error('Error fetching dashboard jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyJobs();
  }, [user, navigate]);

  const handleViewApplicants = async (job) => {
    setSelectedJobTitle(job.title);
    setIsModalOpen(true);
    setLoadingApps(true);
    setApplications([]);
    try {
      const response = await api.get(`/applications/job/${job._id}`);
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  // NEW: Handle creating a job
  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/jobs', {
        ...newJob,
        description: 'Standard description applied.', // Hardcoded for brevity, can expand later
        requiredSkills: ['Communication'] // Hardcoded for brevity
      });
      
      // Instantly add the new job to the table
      setMyJobs([...myJobs, response.data.data]);
      
      // Close modal and reset form
      setIsPostJobModalOpen(false);
      setNewJob({ title: '', company: '', location: '', salary: '', jobType: 'Full-Time' });
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Recruiter Dashboard</h1>
        <button 
          onClick={() => setIsPostJobModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition-colors"
        >
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

      {/* NEW: Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Post a New Job</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <input 
                type="text" placeholder="Job Title (e.g. Data Analyst)" required
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              />
              <input 
                type="text" placeholder="Company Name" required
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})}
              />
              <div className="flex gap-4">
                <input 
                  type="text" placeholder="Location" required
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                />
                <input 
                  type="text" placeholder="Salary (e.g. 8 LPA)" required
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={newJob.salary} onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                />
              </div>
              <select 
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={newJob.jobType} onChange={(e) => setNewJob({...newJob, jobType: e.target.value})}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                Publish Job
              </button>
            </form>
            <button 
              onClick={() => setIsPostJobModalOpen(false)} 
              className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Applicants Modal remains here... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Applicants for {selectedJobTitle}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            {loadingApps ? (
              <p className="text-gray-600 text-center py-4">Fetching candidates...</p>
            ) : applications.length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded">No students have applied for this position yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app._id} className="border border-gray-200 rounded p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{app.applicant.name}</h3>
                      <p className="text-sm text-gray-600">{app.applicant.email}</p>
                    </div>
                    <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-medium hover:bg-blue-600 hover:text-white transition-colors">
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