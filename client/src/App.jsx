import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      {/* 2. Place Navbar here so it persists across all pages */}
      <Navbar /> 
      
      {/* 3. Wrap routes in a main tag with a background color */}
      <main className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;