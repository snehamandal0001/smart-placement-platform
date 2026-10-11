import { useState, useEffect, useContext } from 'react';
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import DashboardSkeleton from '../components/DashboardSkeleton';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [myJobs, setMyJobs] = useState([]);
  const [analytics, setAnalytics] = useState({ pipeline: [], avgCgpa: 0, topSkills: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); 
  const [retryCount, setRetryCount] = useState(0);
  const [scheduleDate, setScheduleDate] = useState('');

  // Applicants Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [loadingApps, setLoadingApps] = useState(false);

  // Post Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false); 
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
      setLoading(true);
      setError(false); 
      try {
        const [jobsRes, statsRes] = await Promise.all([
          api.get('/jobs/my-jobs'),
          api.get('/applications/analytics/recruiter')
        ]);
        
        setMyJobs(jobsRes.data.data);
        setAnalytics(statsRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(true); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate, retryCount]); 

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
    setIsPosting(true); 
    try {
      const formattedSkills = newJob.requiredSkills 
        ? newJob.requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
        : [];

      const response = await api.post('/jobs', { 
        ...newJob, 
        requiredSkills: formattedSkills 
      });
      setMyJobs([response.data.data, ...myJobs]); 
      setIsPostJobModalOpen(false);
      setNewJob({ title: '', company: '', location: '', salary: '', jobType: 'Full-Time', requiredSkills: '', description: '' });
      toast.success('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job.');
    } finally {
      setIsPosting(false); 
    }
  };

  const handleStatusUpdate = async (applicationId, status, date) => {
    try {
      await api.put(`/applications/${applicationId}/status`, {
        status,
        interviewDate: date || null
      });
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status, interviewDate: date } : app
      ));
      toast.success('Interview scheduled successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to schedule interview.');
    }
  };

  // Helper functions to extract metrics from the pipeline array
  const getCount = (statusName) => analytics.pipeline?.find(item => item.name === statusName)?.value || 0;
  const totalApplicants = analytics.pipeline?.reduce((sum, item) => sum + item.value, 0) || 0;

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
      
      <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-6">Showing All Published Jobs</h3>
      
      {/* Visual Analytics Dashboard */}
      {!loading && analytics.pipeline?.length > 0 && (
        <div className="mb-8">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Applicants</h3>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{totalApplicants}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shortlist / OA</h3>
              <p className="text-3xl font-black text-yellow-500 dark:text-yellow-400">{getCount('OA')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Interviews</h3>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{getCount('Interview')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Offers</h3>
              <p className="text-3xl font-black text-green-600 dark:text-green-400">{getCount('Offered')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Application Pipeline Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Application Pipeline</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={analytics.pipeline}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#6B7280', fontWeight: 'bold' }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {
                        analytics.pipeline.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            entry.name === 'Offered' ? '#10B981' : 
                            entry.name === 'Interview' ? '#8B5CF6' : 
                            entry.name === 'OA' ? '#F59E0B' :
                            entry.name === 'Rejected' ? '#EF4444' :
                            '#3B82F6'
                          } />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Skills Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Top Skills in Resume Pool</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={analytics.topSkills}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    {/* Maps to the 'name' field currently in your state for skills */}
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: '#6B7280', fontWeight: 'bold', fontSize: 12 }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#4B5563" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-red-200 dark:border-red-900 mt-8">
          <p className="text-red-600 dark:text-red-400 mb-4 font-medium text-lg">We couldn't load your dashboard data right now.</p>
          <button 
            onClick={() => setRetryCount(prev => prev + 1)}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded font-bold transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
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
                    <button 
                      onClick={() => handleViewApplicants(job)}
                      className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200 hover:bg-green-600 hover:text-white transition-colors"
                    >
                      Quick View
                    </button>
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
                <button 
                  type="submit" 
                  disabled={isPosting}
                  className={`flex-1 text-white py-2 rounded font-bold transition-colors ${
                    isPosting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isPosting ? 'Posting...' : 'Post Job'}
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