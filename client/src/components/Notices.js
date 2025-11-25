import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { supabase } from '../config/supabase';
import './Notices.css';

function Notices({ user }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchNotices();
    // Set default date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setSelectedDate(yesterday.toISOString().split('T')[0]);
  }, []);

  const fetchNotices = async () => {
    try {
      // Get user profile to get user ID
      const token = localStorage.getItem('auth.token');
      const userStr = localStorage.getItem('auth.user');
      
      let url = '/notices';
      if (token && userStr) {
        const user = JSON.parse(userStr);
        // Add userId to filter notices by user criteria
        url = `/notices?userId=${user.id}`;
      }
      
      const response = await api.get(url);
      setNotices(response.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFetch = async () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }
    
    setFetching(true);
    try {
      const response = await api.post('/notices/fetch', { date: selectedDate });
      await fetchNotices();
      alert(`Fetched ${response.data.count} notices for ${selectedDate}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert('Error fetching notices: ' + errorMsg);
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading notices...</div>;
  }

  return (
    <div className="notices-page">
      <div className="notices-header">
        <h1>TED Notices</h1>
        <div className="fetch-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="date-picker"
          />
          <button onClick={triggerFetch} disabled={fetching || !selectedDate} className="fetch-btn">
            {fetching ? 'Fetching...' : 'Fetch Notices'}
          </button>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="empty-state">
          <p>No notices available yet.</p>
          <p>Click "Fetch New Notices" to load tenders from TED.</p>
        </div>
      ) : (
        <div className="notices-grid">
          {notices.map(notice => (
            <div key={notice.id} className="notice-card">
              <h3>{notice.title}</h3>
              <div className="notice-meta">
                <span className="country">{notice.country}</span>
                <span className="type">{notice.contractType}</span>
              </div>
              <p className="description">{notice.description}</p>
              <div className="notice-details">
                {notice.publishDate && (
                  <div>
                    <strong>Published:</strong> {new Date(notice.publishDate).toLocaleDateString()}
                  </div>
                )}
                {notice.deadline && new Date(notice.deadline).getTime() > 0 && (
                  <div>
                    <strong>Deadline:</strong> {new Date(notice.deadline).toLocaleDateString()}
                  </div>
                )}
                {notice.estimatedValue && (
                  <div>
                    <strong>Value:</strong> {notice.estimatedValue.toLocaleString()} {notice.currency}
                  </div>
                )}
              </div>
              {notice.cpvCodes && notice.cpvCodes.length > 0 && (
                <div className="cpv-codes">
                  <strong>CPV:</strong> {notice.cpvCodes.join(', ')}
                </div>
              )}
              {notice.tedUrl && (
                <a href={notice.tedUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                  View on TED →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notices;
