import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './Dashboard.css';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalNotices: 0,
    matchingNotices: 0,
    notifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth.token');
      
      // Fetch user notifications
      const notificationsRes = await api.get('/users/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats({
        totalNotices: 1573798, // From TED API
        matchingNotices: notificationsRes.data.length,
        notifications: notificationsRes.data.filter(n => !n.read).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalNotices: 1573798,
        matchingNotices: 0,
        notifications: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total TED Notices</h3>
          <p className="stat-number">{stats.totalNotices.toLocaleString()}</p>
        </div>
        
        <div className="stat-card">
          <h3>Matching Your Criteria</h3>
          <p className="stat-number">{stats.matchingNotices}</p>
        </div>
        
        <div className="stat-card">
          <h3>New Notifications</h3>
          <p className="stat-number">{stats.notifications}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/criteria" className="action-btn">Set Filter Criteria</a>
          <a href="/notices" className="action-btn">View Notices</a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
