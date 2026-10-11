import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ApplicationSkeleton from '../components/ApplicationSkeleton';

const ViewApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [sortBy, setSortBy] = useState('matchScore');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, jobRes] = await Promise.all([
          api.get(`/applications/job/${jobId}`),
          api.get(`/jobs/${jobId}`)
        ]);
        
        const fetchedJob = jobRes.data.data;
        const fetchedApps = appRes.data.data;

        // Grade every applicant and attach the detailed score object
        const scoredApplications = fetchedApps.map(app => {
          const matchDetails = calculateMatchScore(app.resumeText, fetchedJob.requiredSkills);
          return { ...app, matchDetails };
        });

        setApplications(scoredApplications);
        setJob(fetchedJob);
      }
      catch (error) {
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

  // UPGRADED: Calculate Match Percentage AND categorize skills
  const calculateMatchScore = (resumeText, requiredSkills) => {
    if (!resumeText || !requiredSkills || requiredSkills.length === 0) {
      return { score: 0, matched: [], missing: requiredSkills || [] };
    }

    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matched = [];
    const missing = [];

    requiredSkills.forEach(skill => {
      const safeSkill = escapeRegExp(skill.trim());
      if (!safeSkill) return;
      
      const regex = new RegExp(`(?:^|\\W)${safeSkill}(?:\\W|$)`, 'i');      
      if (regex.test(resumeText)) {
        matched.push(skill.trim());
      } else {
        missing.push(skill.trim());
      }
    });
    
    const score = Math.round((matched.length / requiredSkills.length) * 100);
    return { score, matched, missing };
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplications(applications.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ));
      toast.success("Candidate status updated!");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Could not update status.");
    }
  };

  // Derive the sorted array using the new matchDetails.score
  const sortedApplications = [...applications].sort((a, b) => {
    if (sortBy === 'matchScore') {
      return (b.matchDetails?.score || 0) - (a.matchDetails?.score || 0);
    }
    if (sortBy === 'cgpa') {
      return (b.applicant?.cgpa || 0) - (a.applicant?.cgpa || 0);
    }
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

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
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <ApplicationSkeleton key={index} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">No students have applied for this position yet.</p>
        </div>
      ) : ( 
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">
              Candidate Leaderboard
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                Rank By:
              </label>
              <select 
                className="w-full sm:w-auto px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white font-medium shadow-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="matchScore">AI Match Score (Highest First)</option>
                <option value="cgpa">CGPA (Highest First)</option>
                <option value="date">Application Date (Newest First)</option>
              </select>
            </div>
          </div>

          {sortedApplications.map((app, index) => {
            const getRankBadge = (idx) => {
              if (idx === 0) return <span className="text-3xl" title="Rank 1">🥇</span>;
              if (idx === 1) return <span className="text-3xl" title="Rank 2">🥈</span>;
              if (idx === 2) return <span className="text-3xl" title="Rank 3">🥉</span>;
              return <span className="text-xl font-bold text-gray-400 w-8 text-center inline-block">#{idx + 1}</span>;
            };

            const score = app.matchDetails?.score || 0;
            const matched = app.matchDetails?.matched || [];
            const missing = app.matchDetails?.missing || [];
            const totalRequired = job?.requiredSkills?.length || 0;

            const scoreBadgeClass = score >= 75 ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-400' : 
                                    score >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-400' : 
                                    'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-400';
            
            const candidateStrength = score >= 75 ? 'Strong candidate' : score >= 50 ? 'Potential match' : 'Lacks required skills';

            return (
              <div key={app._id} className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Rank Indicator */}
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full border border-gray-100 dark:border-gray-600">
                    {getRankBadge(index)}
                  </div>

                  {/* Candidate Basic Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {app.applicant?.name || 'Unknown Candidate'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{app.applicant?.email}</p>
                    
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-bold border border-purple-100 dark:border-purple-800">
                        CGPA: {app.applicant?.cgpa || 'N/A'}
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-600">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  {/* Extracted Resume Text (Optional View) */}
                  {app.resumeText && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resume Snippet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {highlightKeywords(app.resumeText, job?.requiredSkills || [])}
                      </p>
                    </div>
                  )}
                  </div>

                  {/* Actions (Resume & Status) */}
                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <select
                      value={app.status || 'Applied'}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold shadow-sm outline-none cursor-pointer border
                        ${app.status === 'Offered' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 
                          app.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 
                          app.status === 'Interview' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800' :
                          app.status === 'OA' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800' :
                          'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'}`}
                    >
                      <option value="Applied" className="bg-white text-gray-800 font-medium">Status: Applied</option>
                      <option value="OA" className="bg-white text-gray-800 font-medium">Status: Online Assessment</option>
                      <option value="Interview" className="bg-white text-gray-800 font-medium">Status: Interview</option>
                      <option value="Offered" className="bg-white text-gray-800 font-medium">Status: Offered</option>
                      <option value="Rejected" className="bg-white text-gray-800 font-medium">Status: Rejected</option>
                    </select>

                    <a 
                      href={app.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-lg transition-colors text-center border border-gray-200 dark:border-gray-600"
                    >
                      Open Full Resume
                    </a>
                  </div>
                </div>

                {/* ATS Detailed Breakdown */}
                {totalRequired > 0 && (
                  <div className="mt-2 p-5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                       <span className={`px-4 py-1.5 rounded-full text-sm font-black tracking-wide border ${scoreBadgeClass}`}>
                          {score}% Match
                       </span>
                       <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {candidateStrength} — {matched.length}/{totalRequired} required skills matched
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div>
                         <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Matched Skills</h4>
                         {matched.length > 0 ? (
                           <div className="flex flex-col gap-2">
                             {matched.map(skill => (
                               <div key={skill} className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-400">
                                 <span>✅</span> {skill}
                               </div>
                             ))}
                           </div>
                         ) : (
                           <p className="text-sm text-gray-500 italic">No required skills matched.</p>
                         )}
                       </div>
                       
                       <div>
                         <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Missing Skills</h4>
                         {missing.length > 0 ? (
                           <div className="flex flex-col gap-2">
                             {missing.map(skill => (
                               <div key={skill} className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
                                 <span>❌</span> {skill}
                               </div>
                             ))}
                           </div>
                         ) : (
                           <p className="text-sm text-gray-500 italic">Candidate matches all required skills!</p>
                         )}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewApplications;