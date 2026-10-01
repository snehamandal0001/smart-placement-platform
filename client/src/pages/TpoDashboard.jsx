import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const TpoDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to load global stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading) return <p className="text-center mt-10">Loading TPO Workspace...</p>;

  return (
    <div className="max-w-6xl mx-auto p-8 mt-10">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">TPO Command Center</h1>
      <p className="text-gray-500 mb-8">Placement Global Overview</p>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-t-4 border-blue-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Registered Students</h3>
            <p className="text-4xl font-bold mt-2 dark:text-white">{stats.totalStudents}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-t-4 border-purple-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Active Recruiters</h3>
            <p className="text-4xl font-bold mt-2 dark:text-white">{stats.totalRecruiters}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-t-4 border-green-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Jobs Posted</h3>
            <p className="text-4xl font-bold mt-2 dark:text-white">{stats.totalJobs}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-t-4 border-yellow-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Total Applications</h3>
            <p className="text-4xl font-bold mt-2 dark:text-white">{stats.totalApplications}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TpoDashboard;