import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Modal State
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Open modal and set the specific job
  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setFeedbackMessage('');
    setResumeUrl('');
  };

  // Submit the application to the backend
  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/applications/${selectedJob._id}/apply`, {
        resumeUrl,
      });
      setFeedbackMessage(response.data.message); // Success message
    } catch (err) {
      setFeedbackMessage(err.response?.data?.message || 'Failed to apply.'); // Error message
    }
  };

  // Filter the jobs based on user input
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter ? job.jobType === typeFilter : true;
    
    const matchesLocation = locationFilter ? job.location.toLowerCase().includes(locationFilter.toLowerCase()) : true;
    
    return matchesSearch && matchesType && matchesLocation;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Latest Job Postings</h1>
      
      {/* NEW: Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by title or company..."
          className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select 
          className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
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
          className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center text-xl text-gray-600">Loading jobs from database...</p>
      ) : filteredJobs.length === 0 ? (
        <p className="text-center text-gray-500 py-8 bg-white rounded shadow">No jobs match your search criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* IMPORTANT: Change jobs.map to filteredJobs.map */}
          {filteredJobs.map((job) => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow border border-gray-100">
              {/* ... KEEP YOUR EXISTING JOB CARD UI HERE ... */}
              <h2 className="text-xl font-bold text-blue-600">{job.title}</h2>
              <p className="text-gray-700 font-medium mt-1">{job.company}</p>
              <div className="mt-4 flex flex-col space-y-2 text-sm text-gray-600 mb-6">
                <p><span className="font-semibold">Location:</span> {job.location}</p>
                <p><span className="font-semibold">Salary:</span> {job.salary}</p>
              </div>
              
              {/* Only show Apply button if the user is a logged-in student */}
              {user?.role === 'student' ? (
                <button 
                  onClick={() => openModal(job)}
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
              ) : (
                <p className="text-sm text-gray-400 text-center italic">Log in as a student to apply</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Apply for {selectedJob?.title}</h2>
            
            {feedbackMessage ? (
              <div className="mb-4 p-3 bg-gray-100 rounded text-center font-medium">
                {feedbackMessage}
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Resume Link (Google Drive, etc.)</label>
                  <input
                    type="url"
                    required
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="https://drive.google.com/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
                  Submit Application
                </button>
              </form>
            )}
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
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