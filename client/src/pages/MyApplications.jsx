import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

// --- Visual Timeline Component ---
const StatusTimeline = ({ currentStatus }) => {
  // Map our UI steps to the backend statuses
  const steps = ['Applied', 'Resume Shortlisted', 'Online Assessment', 'Interview', 'Final Decision'];
  
  // Determine how far along the timeline the student is based on the backend string
  const getStepIndex = (status) => {
    switch(status) {
      case 'Applied': return 0;
      // If they reach OA, they bypassed the 'Shortlisted' step automatically
      case 'OA': return 2; 
      case 'Interview': return 3;
      case 'Offered': return 4;
      case 'Rejected': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isRejected = currentStatus === 'Rejected';

  return (
    <div className="flex flex-col space-y-4 mt-6 md:mt-0 md:ml-8 border-l-2 border-gray-100 dark:border-gray-700 ml-3 pl-6 relative">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        
        // Special styling for the final step if rejected
        const isFinalAndRejected = isCurrent && isRejected;

        return (
          <div key={step} className="relative flex items-center">
            {/* The Timeline Dot */}
            <div className={`absolute -left-[33px] flex items-center justify-center w-4 h-4 rounded-full border-2 bg-white dark:bg-gray-800
              ${isCompleted ? 'border-green-500 bg-green-500' : 
                isFinalAndRejected ? 'border-red-500 bg-red-500' :
                isCurrent ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400' : 
                'border-gray-300 dark:border-gray-600'}
            `}>
              {isCompleted && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            {/* The Step Text */}
            <span className={`text-sm font-medium
              ${isCompleted ? 'text-gray-800 dark:text-gray-200' : 
                isFinalAndRejected ? 'text-red-600 font-bold dark:text-red-400' :
                isCurrent ? 'text-blue-700 font-bold dark:text-blue-400' : 
                'text-gray-400 dark:text-gray-500'}
            `}>
              {isFinalAndRejected ? 'Rejected' : currentStatus === 'Offered' && index === 4 ? 'Offer Extended 🎉' : step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Page Component ---
const MyApplicationSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse mb-4 flex flex-col md:flex-row justify-between">
    <div className="w-full md:w-1/2">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
  </div>
);

const MyApplications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'student') {
      navigate('/');
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications/my-applications');
        setApplications(response.data.data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user, navigate]);

  return (
    <div className="max-w-5xl mx-auto p-8 mt-4 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Application Tracker</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <MyApplicationSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded shadow border border-red-200 dark:border-red-900">
          <p className="text-red-600 dark:text-red-400 font-medium">We couldn't load your applications right now.</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">You haven't applied to any jobs yet.</p>
          <Link to="/" className="inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(app => (
            <div 
              key={app._id} 
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between hover:shadow-md transition-all"
            >
              {/* Left Side: Job Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {app.job?.company || 'Unknown Company'}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-6">
                  {app.job?.title || 'Unknown Role'}
                </p>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider mb-1">Applied On</p>
                    <p>{new Date(app.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  
                  {app.status === 'Interview' && app.interviewDate && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800 inline-block">
                      <p className="font-bold text-purple-800 dark:text-purple-300 uppercase text-xs tracking-wider mb-1">Interview Scheduled</p>
                      <p className="text-purple-900 dark:text-purple-200 font-medium">
                        {new Date(app.interviewDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <Link to={`/jobs/${app.job?._id}`} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    View Job Details &rarr;
                  </Link>
                </div>
              </div>
              
              {/* Right Side: Visual Timeline */}
              <div className="w-full md:w-64 mt-8 md:mt-0 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Application Timeline</h3>
                <StatusTimeline currentStatus={app.status || 'Applied'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;