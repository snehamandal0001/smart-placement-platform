import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

// Inline Skeleton for this specific page layout
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
    // Protect route: Only students should see this
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
    <div className="max-w-4xl mx-auto p-8 mt-4 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">My Applications</h1>

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
        <div className="space-y-4">
          {applications.map(app => (
            <div 
              key={app._id} 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-end gap-4 hover:shadow-md transition-all"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{app.job?.company || 'Unknown Company'}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-4">{app.job?.title || 'Unknown Role'}</p>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                  <p><span className="font-medium text-gray-800 dark:text-gray-200">Applied:</span> {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Status: </span>
                    <span className={`font-bold ${
                      app.status === 'Offered' ? 'text-green-600 dark:text-green-400' :
                      app.status === 'Rejected' ? 'text-red-600 dark:text-red-400' :
                      app.status === 'Interview' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                    }`}>{app.status || 'Applied'}</span>
                  </p>
                  
                  {/* Only show interview date if status is Interview */}
                  {app.status === 'Interview' && app.interviewDate && (
                    <p className="text-purple-700 dark:text-purple-300">
                      <span className="font-bold">Interview:</span> {new Date(app.interviewDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Link to="/" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  View Job Post <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;