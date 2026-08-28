import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext'; 

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();         // Clears local storage and context
    navigate('/');    // Instantly redirects to the public home page
  };

  return (
  // Add dark mode classes to the nav container
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">PlacementHub</Link>

        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors">Home</Link>
          
          {/* The Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors text-xl"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? (
            <>
              {user.role === 'recruiter' && (
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Dashboard
                </Link>
              )}
              <span className="text-sm font-semibold text-gray-700">Hi, {user.name}</span>
              <button 
                onClick={handleLogout} 
                className="bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;