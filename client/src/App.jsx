import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ViewApplications from './pages/ViewApplications';
import Profile from './pages/Profile';
import Register from './pages/Register';

function App() {
  return (
    <ThemeProvider> 
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/applications/job/:jobId" element={<ViewApplications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/register" element={<Register/>} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;