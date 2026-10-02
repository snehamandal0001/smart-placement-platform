import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Tracks if the API failed
  const [retryCount, setRetryCount] = useState(0); // Triggers a re-fetch

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Modal State
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null); 
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // State for editing jobs
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '', company: '', location: '', salary: '', description: '', jobType:'', requiredSkills: ''
  });

  const [myApplications, setMyApplications] = useState([]);

  // Reset to Page 1 whenever the user types a new search or changes a filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, locationFilter]);

  // Fetch from backend WITH all query parameters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(false); // Reset error state before each attempt
      try {
        const params = new URLSearchParams({
          page: currentPage,
          ...(searchQuery && { keyword: searchQuery }),
          ...(typeFilter && { jobType: typeFilter }),
          ...(locationFilter && { location: locationFilter }),
        });

        const response = await api.get(`/jobs?${params.toString()}`);
        setJobs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setError(true); // Request failed (e.g., network error, server down)
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [currentPage, searchQuery, typeFilter, locationFilter, retryCount]); // Added retryCount

  // Fetch the student's applications when the page loads
  useEffect(() => {
    if (user && user.role === 'student') {
      const fetchMyApplications = async () => {
        try {
          const response = await api.get('/applications/my-applications'); 
          setMyApplications(response.data.data);
        } catch (error) {
          console.error('Error fetching student applications:', error);
        }
      };
      fetchMyApplications();
    }
  }, [user]);

  // Open modal and set the specific job
  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setFeedbackMessage('');
    setResumeUrl('');
    setResumeFile(null);
  };

  // Submit the application to the backend
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('resumeUrl', resumeUrl);
      
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      }

      const response = await api.post(`/applications/${selectedJob._id}/apply`, formData);
      setFeedbackMessage(response.data.message);
    } catch (err) {
      setFeedbackMessage(err.response?.data?.message || 'Failed to apply.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job? This will also delete all student applications for it.")) {
      try {
        await api.delete(`/jobs/${jobId}`);
        setJobs(jobs.filter((job) => job._id !== jobId));
      } catch (error) {
        console.error("Failed to delete job:", error);
        alert(error.response?.data?.message || "Failed to delete job");
      }
    }
  };

  // Opens the edit modal and pre-fills the form with the current job data
  const openEditModal = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      description: job.description,
      jobType: job.jobType,
      requiredSkills: job.requiredSkills ? job.requiredSkills.join(', ') : ''
    });
    setIsEditModalOpen(true);
  };

  // Submits the updated data to the backend
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const formattedSkills = editFormData.requiredSkills 
        ? editFormData.requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
        : [];

      const payload = { ...editFormData, requiredSkills: formattedSkills };

      const response = await api.put(`/jobs/${editingJob._id}`, payload);
      
      setJobs(jobs.map((job) => (job._id === editingJob._id ? response.data.data : job)));
      
      setIsEditModalOpen(false);
      setEditingJob(null);
      alert("Job updated successfully!");
    } catch (error) {
      console.error("Failed to update job:", error);
      alert(error.response?.data?.message || "Failed to update job");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto relative transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Latest Job Postings</h1>
      
      {/* STUDENT UPCOMING INTERVIEWS WIDGET */}
      {user?.role === 'student' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 mb-8 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            📅 Upcoming Interviews
          </h2>
          
          <div className="space-y-4">
            {myApplications
              .filter(app => app.status === 'Interview' && app.interviewDate)
              .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
              .map(app => {
                const dateObj = new Date(app.interviewDate);
                const month = dateObj.toLocaleString('default', { month: 'short' });
                const day = dateObj.getDate();
                const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={app._id} className="flex items-center gap-4 p-4 border border-l-4 border-l-purple-500 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:shadow-md transition-shadow">
                    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 w-16 h-16 flex flex-col items-center justify-center shadow-sm shrink-0">
                      <span className="text-xs font-bold text-red-500 uppercase">{month}</span>
                      <span className="text-2xl font-black text-gray-800 dark:text-white">{day}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{app.job?.title || 'Unknown Role'}</h3>
                      <p className="text-gray-600 dark:text-gray-300 font-medium truncate">{app.job?.company || 'Unknown Company'}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-bold">
                        ⏰ {time}
                      </span>
                    </div>
                  </div>
                );
            })}
            
            {myApplications.filter(app => app.status === 'Interview' && app.interviewDate).length === 0 && (
              <p className="text-gray-500 italic text-center py-4">No upcoming interviews scheduled.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 transition-colors duration-300">
        <input
          type="text"
          placeholder="Search by title or company..."
          className="flex-1 px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select 
          className="px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Job Types</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Internship">Internship</option>
        </select>

        <input
          type="text"
          placeholder="Filter by location..."
          className="px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
      </div>

     {/* Render Jobs Directly from Backend Array */}
      {loading ? (
        <p className="text-center text-xl text-gray-600 dark:text-gray-400">Loading jobs from database...</p>
      ) : error ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded shadow border border-red-200 dark:border-red-900">
          <p className="text-red-600 dark:text-red-400 mb-4 font-medium">We couldn't load jobs right now.</p>
          <button 
            onClick={() => setRetryCount(prev => prev + 1)}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded font-bold transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8 bg-white dark:bg-gray-800 rounded shadow">No jobs match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">{job.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">Company: {job.company}</p>
              <div className="mt-4 flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <p><span className="font-semibold dark:text-gray-200">Location:</span> {job.location}</p>
                <p><span className="font-semibold dark:text-gray-200">Salary:</span> {job.salary}</p>
                <p><span className="font-semibold dark:text-gray-200">Jobtype:</span> {job.jobType}</p>
                <p><span className="font-semibold dark:text-gray-200">Description:</span> {job.description}</p>
              </div>
              
              {user?.role === 'student' ? (
                <button 
                  onClick={() => openModal(job)}
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
              ) : user?.role === 'recruiter' && user?._id === job.postedBy ? (
                <div className="flex gap-2">
                  <Link 
                  to={`/applications/job/${job._id}`}
                  className="block flex-1 text-center w-full bg-purple-600 text-white font-semibold py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  View Applications
                </Link>
                <button 
                    onClick={() => openEditModal(job)}
                    className="px-4 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                <button 
                    onClick={() => handleDeleteJob(job._id)}
                    className="px-4 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center italic">Log in as a student to apply</p>
              )}
            </div>
          ))}
        </div>
        )}

      {/* Pagination Buttons */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8 mb-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>

          <span className="font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl transition-colors duration-300">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Apply for {selectedJob?.title}</h2>
            {feedbackMessage ? (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded text-center font-medium">{feedbackMessage}</div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Resume Link (Google Drive)</label>
                  <input
                    type="url"
                    required
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                    placeholder="https://drive.google.com/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Upload PDF Resume (For AI Parsing)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                  <p className="text-xs text-gray-500 mt-1">Only .pdf files are supported.</p>
                </div>

                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
                  Submit Application
                </button>
              </form>
            )}
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="mt-4 w-full bg-gray-200 dark:bg-gray-700 dark:text-white py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    
    {/* EDIT JOB MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Edit Job</h2>
            
            <form onSubmit={handleUpdateJob} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Job Title</label>
                <input
                  type="text" required
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded bg-transparent dark:text-white"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                />
              </div>
               <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Company</label>
                <input
                  type="text" required 
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded bg-transparent dark:text-white"
                  value={editFormData.company}
                  onChange={(e) => setEditFormData({...editFormData, company: e.target.value})}
                />
              </div> 

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Location</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded bg-transparent dark:text-white"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  />
                </div>
                <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Salary</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded bg-transparent dark:text-white"
                  value={editFormData.salary}
                  onChange={(e) => setEditFormData({...editFormData, salary: e.target.value})}
                />
              </div>
              </div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Job Type</label>
                <select 
                className = "w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white"
                value={editFormData.jobType} onChange={(e) => setEditFormData({...editFormData, jobType: e.target.value})}
              >
                <option value="Full-Time" className="dark:bg-gray-800">Full-Time</option>
                <option value="Part-Time" className="dark:bg-gray-800">Part-Time</option>
                <option value="Internship" className="dark:bg-gray-800">Internship</option>
              </select>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, C++, Java"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded bg-transparent dark:text-white"
                  value={editFormData.requiredSkills}
                  onChange={(e) => setEditFormData({...editFormData, requiredSkills: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                  Job Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, C++, Java"
                  rows="3"
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded bg-transparent dark:text-white"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded font-bold hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;