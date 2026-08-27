import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Brand / Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          PlacementHub
        </Link>

        {/* Desktop Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
            Home
          </Link>
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Login
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;