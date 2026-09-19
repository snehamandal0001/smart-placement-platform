import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import {Link} from 'react-router-dom';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // NEW: Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Modal State
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null); //Holds the actual PDF file
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Reset to Page 1 whenever the user types a new search or changes a filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, locationFilter]);

  // Fetch from backend WITH all query parameters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Dynamically build the URL query string based on what the user typed
        const params = new URLSearchParams({
          page: currentPage,
          ...(searchQuery && { keyword: searchQuery }),
          ...(typeFilter && { jobType: typeFilter }),
          ...(locationFilter && { location: locationFilter }),
        });

        // Fixed the backticks syntax here so the URL builds correctly!
        const response = await api.get(`/jobs?${params.toString()}`);
        setJobs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [currentPage, searchQuery, typeFilter, locationFilter]); // Re-runs when ANY of these change

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
      //  Create a FormData object to handle the file upload
      const formData = new FormData();
      formData.append('resumeUrl', resumeUrl);
      
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      }

      //  Send it with the special multipart/form-data header
      const response = await api.post(`/applications/${selectedJob._id}/apply`, formData
      );
      setFeedbackMessage(response.data.message); // Success messages
    } catch (err) {
      setFeedbackMessage(err.response?.data?.message || 'Failed to apply.'); // Error message
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job? This will also delete all student applications for it.")) {
      try {
        await api.delete(`/jobs/${jobId}`);
        // Remove the deleted job from the local state instantly
        setJobs(jobs.filter((job) => job._id !== jobId));
      } catch (error) {
        console.error("Failed to delete job:", error);
        alert(error.response?.data?.message || "Failed to delete job");
      }
    }
  };

  

  return (
    <div className="p-8 max-w-6xl mx-auto relative transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Latest Job Postings</h1>
      
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
      ) : jobs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8 bg-white dark:bg-gray-800 rounded shadow">No jobs match your search criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">{job.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium mt-1">{job.company}</p>
              <div className="mt-4 flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <p><span className="font-semibold dark:text-gray-200">Location:</span> {job.location}</p>
                <p><span className="font-semibold dark:text-gray-200">Salary:</span> {job.salary}</p>
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

      

      {/* NEW: Pagination Buttons */}
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

                {/* NEW: File Upload Input */}
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
    </div>
  );


};

export default Home;