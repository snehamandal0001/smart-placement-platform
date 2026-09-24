import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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

  // Post Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'Full-Time',
    description: '',
    requiredSkills: '' 
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

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      // 1. Convert comma-separated string into an array
      const formattedSkills = newJob.requiredSkills 
        ? newJob.requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
        : [];

      // 2. Send dynamic data instead of hardcoded values
      const response = await api.post('/jobs', {
        ...newJob,
        requiredSkills: formattedSkills
      });

      setMyJobs([response.data.data, ...myJobs]); // Add new job to the top of the list
      
      setIsPostJobModalOpen(false);
      setNewJob({ title: '', company: '', location: '', salary: '', jobType: 'Full-Time', requiredSkills: '', description: '' });
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Recruiter Dashboard</h1>
        <button 
          onClick={() => setIsPostJobModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium transition-colors"
        >
          + Post New Job
        </button>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-6">Showing Recently Published Jobs</h3>

      {loading ? (
        <p className="text-gray-600 text-lg">Loading your workspace...</p>
      ) : myJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow text-center border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">You haven't posted any jobs yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Job Title</th>
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Company</th>
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Location</th>
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Salary</th>
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Job Type</th>
                <th className="p-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myJobs.map((job) => (
                <tr key={job._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{job.title}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{job.company}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{job.location}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{job.salary}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{job.jobType}</td>
                  <td className="p-4 flex gap-2">
                    {/* Opens Quick Modal */}
                    <button 
                      onClick={() => handleViewApplicants(job)}
                      className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200 hover:bg-green-600 hover:text-white transition-colors"
                    >
                      Quick View
                    </button>
                    {/* Routes to your dedicated ViewApplications page for the AI extraction view! */}
                    <Link 
                      to={`/applications/job/${job._id}`}
                      className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded border border-purple-200 hover:bg-purple-600 hover:text-white transition-colors"
                    >
                       Resume View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Post a New Job</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <input 
                type="text" placeholder="Job Title (e.g. Data Analyst)" required
                className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              />
              <input 
                type="text" placeholder="Company Name" required
                className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})}
              />
              <div className="flex gap-4">
                <input 
                  type="text" placeholder="Location" required
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                  value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                />
                <input 
                  type="text" placeholder="Salary (e.g. 8 LPA)" required
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                  value={newJob.salary} onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                />
              </div>
              
              <select 
                className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                value={newJob.jobType} onChange={(e) => setNewJob({...newJob, jobType: e.target.value})}
              >
                <option value="Full-Time" className="dark:bg-gray-800">Full-Time</option>
                <option value="Part-Time" className="dark:bg-gray-800">Part-Time</option>
                <option value="Internship" className="dark:bg-gray-800">Internship</option>
              </select>

              <input 
                type="text" placeholder="Required Skills (comma separated, e.g. Java, React, C++)" required
                className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                value={newJob.requiredSkills} onChange={(e) => setNewJob({...newJob, requiredSkills: e.target.value})}
              />

              <textarea 
                placeholder="Job Description..." required rows="3"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              />

              <div className="flex gap-4 mt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition-colors">
                  Post Job
                </button>
                <button type="button" onClick={() => setIsPostJobModalOpen(false)} className="flex-1 bg-gray-500 text-white py-2 rounded font-bold hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick View Applicants Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold dark:text-white">Applicants for {selectedJobTitle}</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
             </div>
             
             {loadingApps ? (
               <p className="text-gray-600 dark:text-gray-400">Loading applicants...</p>
             ) : applications.length === 0 ? (
               <p className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded text-center">No applicants yet.</p>
             ) : (
               <ul className="space-y-3">
                 {applications.map(app => (
                   <li key={app._id} className="p-4 border dark:border-gray-700 rounded flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                     <div>
                       <p className="font-semibold text-gray-800 dark:text-white">{app.applicant.name}</p>
                       <p className="text-sm text-gray-600 dark:text-gray-400">{app.applicant.email}</p>
                     </div>
                     <a 
                       href={app.resumeUrl} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200"
                     >
                       Open Resume
                     </a>
                   </li>
                 ))}
               </ul>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;