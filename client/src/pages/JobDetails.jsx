import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data.data);
      } catch (error) {
        console.error("Failed to fetch job details", error);
        toast.error("Job not found");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('resumeUrl', resumeUrl);
      if (resumeFile) formData.append('resumeFile', resumeFile);

      await api.post(`/applications/${job._id}/apply`, formData);
      toast.success("Application submitted successfully!");
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-10 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block font-medium">
        &larr; Back to Jobs
      </Link>

      <div className="border-b dark:border-gray-700 pb-6 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{job.title}</h1>
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-6">{job.company}</h2>

        <div className="flex flex-col gap-3 text-gray-700 dark:text-gray-300 font-medium">
          <p className="flex items-center gap-2">📍 {job.location}</p>
          <p className="flex items-center gap-2">💰 {job.salary}</p>
          <p className="flex items-center gap-2">💼 {job.jobType}</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About the role</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {job.description}
          </p>
        </div>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Required skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <span key={index} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-bold border border-blue-100 dark:border-blue-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Eligibility</h3>
          <ul className="text-gray-700 dark:text-gray-300 space-y-1">
            <li>CGPA ≥ 8.0</li>
            <li>CSE/IT</li>
            <li>2027 batch</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Deadline</h3>
          <p className="text-gray-700 dark:text-gray-300 font-medium">October 10, 2026</p>
        </div> */}

        <div className="pt-6">
          {user?.role === 'student' ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              [ Apply Now ]
            </button>
          ) : !user ? (
            <p className="text-sm text-gray-500 italic">Log in as a student to apply</p>
          ) : null}
        </div>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-xl transition-colors">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Apply for {job.title}</h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Resume Link (Google Drive)</label>
                <input type="url" required className="w-full px-4 py-2 border dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white" value={resumeUrl} placeholder="https://drive.google.com/..." onChange={(e) => setResumeUrl(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Upload PDF Resume</label>
                <input type="file" accept=".pdf" className="w-full px-4 py-2 border dark:border-gray-600 rounded bg-transparent dark:text-white" onChange={(e) => setResumeFile(e.target.files[0])} />
                <p className="text-xs text-gray-500 mt-1">Only .pdf files are supported.</p>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Submit Application</button>
            </form>
            <button onClick={() => setIsModalOpen(false)} className="mt-4 w-full bg-gray-200 dark:bg-gray-700 dark:text-white py-2 rounded hover:bg-gray-600 font-medium transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;