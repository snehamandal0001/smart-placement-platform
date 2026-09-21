import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api'; 
import { AuthContext } from '../context/AuthContext'; 

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' 
  });
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Send registration data to the backend
      const response = await api.post('/auth/register', formData);
      login(response.data.data); 
      
      // Redirect to home dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Create an Account</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Full Name</label>
          <input 
            type="text" required
            className="w-full px-4 py-2 border rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Email Address</label>
          <input 
            type="email" required
            className="w-full px-4 py-2 border rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Password</label>
          <input 
            type="password" required minLength="6"
            className="w-full px-4 py-2 border rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">I am a:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
              <input 
                type="radio" 
                name="role" 
                value="student" 
                checked={formData.role === 'student'}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-4 h-4 text-blue-600"
              />
              Student
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
              <input 
                type="radio" 
                name="role" 
                value="recruiter" 
                checked={formData.role === 'recruiter'}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-4 h-4 text-blue-600"
              />
              Recruiter
            </label>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded mt-4 hover:bg-blue-700">
          Sign Up
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default Register;