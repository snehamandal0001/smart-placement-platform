import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const ViewApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both the applications AND the job details at the same time
        const [appRes, jobRes] = await Promise.all([
          api.get(`/applications/job/${jobId}`),
          api.get(`/jobs/${jobId}`)
        ]);
        setApplications(appRes.data.data);
        setJob(jobRes.data.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  // Helper function to highlight specific skills in the resume text
  const highlightKeywords = (text, keywords) => {
    if (!text || !keywords || keywords.length === 0) return text;

    // Escape regex special characters so they don't break the search
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeKeywords = keywords.map(escapeRegExp).filter(k => k.trim() !== '');
    
    if (safeKeywords.length === 0) return text;

    const regex = new RegExp(`(${safeKeywords.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-300 text-black font-semibold px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Handle updating the student's status
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      
      // Update the React UI instantly without refreshing the page
      setApplications(applications.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Could not update status.");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Job Applications</h1>
          {job && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Showing applicants for: <span className="font-semibold">{job.title}</span>
            </p>
          )}
        </div>
        <Link to="/" className="text-blue-600 hover:underline font-medium">← Back to Jobs</Link>
      </div>

      {/* Target Skills Banner */}
      {job?.requiredSkills?.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Target Skills for this Job:</h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

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
                <th className="p-4 border-b dark:border-gray-600">Resume Data</th>
                <th className="p-4 border-b dark:border-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="p-4 border-b dark:border-gray-600 font-medium text-gray-800 dark:text-white align-top">
                    {app.applicant.name}
                  </td>
                  <td className="p-4 border-b dark:border-gray-600 text-gray-600 dark:text-gray-300 align-top">
                    {app.applicant.email}
                  </td>
                  <td className="p-4 border-b dark:border-gray-600 text-gray-600 dark:text-gray-300 align-top">
                    {app.applicant.cgpa || 'N/A'}
                  </td>
                  <td className="p-4 border-b dark:border-gray-600 align-top w-1/2">
                    <a 
                      href={app.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mb-4 bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-medium text-sm"
                    >
                      View Resume URL 
                    </a>

                    {app.resumeText ? (
                      <div className="mt-2">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Extracted Resume Text
                        </h4>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                          {/* Pass the dynamic job skills array into the highlighter */}
                          {highlightKeywords(app.resumeText, job?.requiredSkills || [])}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500 italic">No PDF text extracted for this applicant.</p>
                    )}
                  </td>

                    <td className="p-4 border-b dark:border-gray-600 align-top">
                    <select
                      value={app.status || 'Applied'}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className={`px-3 py-1 rounded text-sm font-semibold outline-none cursor-pointer border-r-8 border-transparent
                        ${app.status === 'Offered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          app.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                          app.status === 'Interview' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          app.status === 'OA' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}
                    >
                      <option value="Applied" className="bg-white text-black">Applied</option>
                      <option value="OA" className="bg-white text-black">Online Assessment</option>
                      <option value="Interview" className="bg-white text-black">Interview</option>
                      <option value="Offered" className="bg-white text-black">Offered</option>
                      <option value="Rejected" className="bg-white text-black">Rejected</option>
                    </select>
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