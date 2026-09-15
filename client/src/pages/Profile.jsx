import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [skills, setSkills] = useState('');
  const [cgpa, setCgpa] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // 1. Fetch current profile data when page loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        const data = response.data.data;
        
        setName(data.name || '');
        setEmail(data.email || '');
        setResumeUrl(data.resumeUrl || '');
        setCgpa(data.cgpa || '');
        // Convert skills array from backend into a comma-separated string for the input field
        setSkills(data.skills ? data.skills.join(', ') : '');
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  // 2. Handle form submission to update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      // Convert comma-separated string back into an array for the backend
      const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '');

      const response = await api.put('/users/profile', {
        name,
        email,
        resumeUrl,
        skills: skillsArray,
        cgpa: Number(cgpa)
      });

      setMessage('✅ Profile updated successfully!');
    } catch (error) {
      setMessage('❌ Failed to update profile.');
      console.error(error);
    }
  };

  if (loading) return <p className="text-center mt-10 text-lg">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">My Profile</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded font-medium text-center ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Email (Read Only)</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
              value={email} 
              readOnly 
            />
          </div>

          {/* CGPA */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">CGPA</label>
            <input 
              type="number" 
              step="0.01"
              max="10"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={cgpa} 
              onChange={(e) => setCgpa(e.target.value)} 
            />
          </div>

          {/* Resume URL */}
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Default Resume Link (Google Drive)</label>
            <input 
              type="url" 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={resumeUrl} 
              onChange={(e) => setResumeUrl(e.target.value)} 
              placeholder="https://drive.google.com/..."
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Skills (Comma Separated)</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={skills} 
            onChange={(e) => setSkills(e.target.value)} 
            placeholder="React, Node.js, Python, MongoDB"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;