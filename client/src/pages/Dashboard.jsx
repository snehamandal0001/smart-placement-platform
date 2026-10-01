import { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [myJobs, setMyJobs] = useState([]);
  const [analytics, setAnalytics] = useState({ pipeline: [], avgCgpa: 0, topSkills: [] });
  const [loading, setLoading] = useState(true);
  const [scheduleDate, setScheduleDate] = useState('');

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
    const fetchData = async () => {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications/analytics/recruiter')
        ]);
        
        const recruiterJobs = jobsRes.data.data.filter((job) => job.postedBy === user._id);
        setMyJobs(recruiterJobs);
        setAnalytics(statsRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const handleStatusUpdate = async (applicationId, status, date) => {
    try {
      await api.put(`/applications/${applicationId}/status`, {
        status,
        interviewDate: date || null
      });
      
      // Instantly update the local state so the UI reflects the change without reloading
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status, interviewDate: date } : app
      ));
      
      alert('Interview scheduled successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to schedule interview.');
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
      
      {/* Visual Analytics Dashboard */}
      {!loading && analytics.pipeline?.length > 0 && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Applicant Pool Analytics</h3>
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm font-bold uppercase tracking-wide">Avg Applicant CGPA:</span>
              <span className="text-xl font-black ml-2">{analytics.avgCgpa}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-72">
            {/* Pie Chart: Status Pipeline */}
            <div className="w-full h-full">
              <h4 className="text-sm font-semibold text-gray-500 mb-2 text-center">Pipeline Distribution</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.pipeline}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                  >
                    {analytics.pipeline.map((entry, index) => {
                      const colors = { 'Applied': '#3b82f6', 'OA': '#eab308', 'Interview': '#a855f7', 'Offered': '#22c55e', 'Rejected': '#ef4444' };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#8884d8'} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart: Most Common Skills */}
            <div className="w-full h-full">
              <h4 className="text-sm font-semibold text-gray-500 mb-2 text-center">Top Skills in Resume Pool</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topSkills} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} stroke="#9ca3af" />                  <YAxis allowDecimals={false} tick={{fontSize: 12}} stroke="#9ca3af" />
                  <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

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
                   <li key={app._id} className="p-4 border dark:border-gray-700 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">{app.applicant.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{app.applicant.email}</p>
                      <p className="text-xs mt-1 font-bold text-blue-600 dark:text-blue-400">
                        Current Status: {app.status || 'Applied'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end w-full md:w-auto">
                      <a 
                        href={app.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 w-full text-center md:w-auto"
                      >
                        Open Resume
                      </a>
                      
                      {/* Scheduling UI */}
                      <div className="flex gap-2 mt-2 w-full md:w-auto">
                        <input 
                          type="datetime-local" 
                          className="text-sm border p-1 rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white w-full md:w-auto"
                          onChange={(e) => setScheduleDate(e.target.value)}
                        />
                        <button 
                          onClick={() => handleStatusUpdate(app._id, 'Interview', scheduleDate)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold px-3 py-1 rounded transition-colors whitespace-nowrap"
                        >
                          Set Interview
                        </button>
                      </div>
                    </div>
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