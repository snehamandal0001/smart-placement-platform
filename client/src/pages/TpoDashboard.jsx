import { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import TpoDashboardSkeleton from '../components/TpoDashboardSkeleton';

const TpoDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/stats');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to load global stats', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (recruiterId, newStatus) => {
    try {
      await api.put(`/admin/recruiters/${recruiterId}/status`, { accountStatus: newStatus });
      fetchDashboardData(); 
      toast.success(`Recruiter marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <TpoDashboardSkeleton />;

  return (
    <div className="max-w-6xl mx-auto p-8 mt-4">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">TPO Command Center</h1>
      <p className="text-gray-500 mb-8">Global College Placement Overview</p>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border-t-4 border-blue-500">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Students</h3>
            <p className="text-3xl font-bold mt-1 dark:text-white">{data.stats.totalStudents}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border-t-4 border-purple-500">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Recruiters</h3>
            <p className="text-3xl font-bold mt-1 dark:text-white">{data.stats.totalRecruiters}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border-t-4 border-green-500">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Jobs Posted</h3>
            <p className="text-3xl font-bold mt-1 dark:text-white">{data.stats.totalJobs}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow border-t-4 border-yellow-500">
            <h3 className="text-xs font-bold text-gray-500 uppercase">Applications</h3>
            <p className="text-3xl font-bold mt-1 dark:text-white">{data.stats.totalApplications}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded shadow border-t-4 border-indigo-300 text-white">
            <h3 className="text-xs font-bold text-indigo-100 uppercase">Placement %</h3>
            <p className="text-3xl font-bold mt-1">{data.stats.placementPercentage}%</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recruiter Approvals Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <h2 className="bg-gray-50 dark:bg-gray-700 p-4 font-bold text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
            Recruiter Approvals
          </h2>
          <div className="p-4 overflow-y-auto max-h-96">
            {data?.recruiters.map(recruiter => (
              <div key={recruiter._id} className="flex justify-between items-center p-3 border-b dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{recruiter.name}</p>
                  <p className="text-sm text-gray-500">{recruiter.email}</p>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    recruiter.accountStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                    recruiter.accountStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {recruiter.accountStatus || 'Approved'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStatusUpdate(recruiter._id, 'Approved')} className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded font-bold">Approve</button>
                  <button onClick={() => handleStatusUpdate(recruiter._id, 'Rejected')} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded font-bold">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Student Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <h2 className="bg-gray-50 dark:bg-gray-700 p-4 font-bold text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
            Global Student Directory
          </h2>
          <div className="p-4 overflow-y-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">CGPA</th>
                </tr>
              </thead>
              <tbody>
                {data?.students.map(student => (
                  <tr key={student._id} className="border-b dark:border-gray-700 last:border-0">
                    <td className="py-3 font-medium text-gray-800 dark:text-white">{student.name}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">{student.email}</td>
                    <td className="py-3 font-bold text-blue-600 dark:text-blue-400">{student.cgpa || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default TpoDashboard;