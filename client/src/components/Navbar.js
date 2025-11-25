import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setUser(null);
    localStorage.removeItem('auth.token');
    localStorage.removeItem('auth.user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">TED Notice Filter</Link>
      </div>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/criteria">My Criteria</Link>
        <Link to="/notices">Notices</Link>
      </div>
      <div className="nav-user">
        <span>{user?.email}</span>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </nav>
  );
}

export default Navbar;
