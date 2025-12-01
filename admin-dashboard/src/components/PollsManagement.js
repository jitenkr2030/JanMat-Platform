import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PollsManagement = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, closed, draft
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchPolls();
  }, [filter]);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/polls?filter=${filter}&search=${searchTerm}`);
      setPolls(response.data.polls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      // Mock data for development
      setPolls([
        {
          _id: '1',
          title: 'Should the government prioritize renewable energy investment?',
          type: 'yes_no',
          status: 'active',
          category: 'Environment',
          totalVotes: 2847,
          endDate: '2025-12-15',
          createdAt: '2025-11-25',
          description: 'A comprehensive poll to understand public opinion on renewable energy investment priorities.'
        },
        {
          _id: '2',
          title: 'Rate the current education system in India',
          type: 'rating',
          status: 'active',
          category: 'Education',
          totalVotes: 1923,
          endDate: '2025-12-20',
          createdAt: '2025-11-28',
          description: 'Citizens rate the effectiveness of the current education system on a scale of 1-10.'
        },
        {
          _id: '3',
          title: 'Which policy should be the government\'s top priority?',
          type: 'multiple_choice',
          status: 'closed',
          category: 'Politics',
          totalVotes: 5421,
          endDate: '2025-11-30',
          createdAt: '2025-11-15',
          description: 'Help prioritize government policy focus areas for the coming year.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (pollId, newStatus) => {
    try {
      await axios.patch(`/api/admin/polls/${pollId}/status`, { status: newStatus });
      setPolls(polls.map(poll => 
        poll._id === pollId ? { ...poll, status: newStatus } : poll
      ));
    } catch (error) {
      console.error('Error updating poll status:', error);
      alert('Failed to update poll status');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/polls/${pollId}`);
      setPolls(polls.filter(poll => poll._id !== pollId));
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('Failed to delete poll');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      closed: '#6b7280',
      draft: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const getTypeLabel = (type) => {
    const types = {
      yes_no: 'Yes/No',
      multiple_choice: 'Multiple Choice',
      rating: 'Rating (1-10)',
      emoji: 'Emoji Reaction'
    };
    return types[type] || type;
  };

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poll.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="polls-management">
      {/* Header Controls */}
      <div className="page-header">
        <div className="header-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search polls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchPolls()}
            />
            <button onClick={fetchPolls}>🔍</button>
          </div>
          
          <div className="filter-tabs">
            {['all', 'active', 'closed', 'draft'].map((filterOption) => (
              <button
                key={filterOption}
                className={`filter-tab ${filter === filterOption ? 'active' : ''}`}
                onClick={() => setFilter(filterOption)}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
          
          <button 
            className="create-button"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Poll
          </button>
        </div>
      </div>

      {/* Polls Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading polls...</p>
        </div>
      ) : (
        <div className="polls-grid">
          {filteredPolls.map((poll) => (
            <div key={poll._id} className="poll-card">
              <div className="poll-header">
                <div className="poll-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(poll.status) }}
                  >
                    {poll.status.toUpperCase()}
                  </span>
                  <span className="poll-type">{getTypeLabel(poll.type)}</span>
                </div>
                <div className="poll-actions">
                  <button 
                    className="action-button"
                    onClick={() => setSelectedPoll(poll)}
                  >
                    👁️
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => setShowEditModal(true)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDeletePoll(poll._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="poll-content">
                <h3 className="poll-title">{poll.title}</h3>
                <p className="poll-description">{poll.description}</p>
                
                <div className="poll-meta">
                  <div className="meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{poll.category}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Votes:</span>
                    <span className="meta-value">{poll.totalVotes?.toLocaleString() || 0}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Ends:</span>
                    <span className="meta-value">
                      {new Date(poll.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="poll-footer">
                <div className="status-controls">
                  {poll.status === 'draft' && (
                    <button 
                      className="status-button activate"
                      onClick={() => handleStatusChange(poll._id, 'active')}
                    >
                      Activate
                    </button>
                  )}
                  {poll.status === 'active' && (
                    <button 
                      className="status-button close"
                      onClick={() => handleStatusChange(poll._id, 'closed')}
                    >
                      Close
                    </button>
                  )}
                </div>
                
                <div className="poll-stats">
                  <span className="created-date">
                    Created {new Date(poll.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPolls.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No polls found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Poll Details Modal */}
      {selectedPoll && (
        <div className="modal-overlay" onClick={() => setSelectedPoll(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Poll Details</h2>
              <button onClick={() => setSelectedPoll(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>{selectedPoll.title}</h3>
                <p>{selectedPoll.description}</p>
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Status:</strong>
                  <span style={{ color: getStatusColor(selectedPoll.status) }}>
                    {selectedPoll.status.toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Type:</strong>
                  <span>{getTypeLabel(selectedPoll.type)}</span>
                </div>
                <div className="detail-item">
                  <strong>Category:</strong>
                  <span>{selectedPoll.category}</span>
                </div>
                <div className="detail-item">
                  <strong>Total Votes:</strong>
                  <span>{selectedPoll.totalVotes?.toLocaleString() || 0}</span>
                </div>
                <div className="detail-item">
                  <strong>End Date:</strong>
                  <span>{new Date(selectedPoll.endDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <strong>Created:</strong>
                  <span>{new Date(selectedPoll.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollsManagement;