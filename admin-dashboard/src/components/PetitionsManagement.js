import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PetitionsManagement = () => {
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, submitted, resolved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPetition, setSelectedPetition] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPetitions();
  }, [filter]);

  const fetchPetitions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/petitions?filter=${filter}&search=${searchTerm}`);
      setPetitions(response.data.petitions);
    } catch (error) {
      console.error('Error fetching petitions:', error);
      // Mock data for development
      setPetitions([
        {
          _id: '1',
          title: 'Digital Payment System Reform',
          description: 'Request for improved digital payment infrastructure and security measures across all platforms.',
          category: 'Technology',
          status: 'active',
          targetAuthority: 'Ministry of Digital India',
          signatures: 1247,
          signatureGoal: 5000,
          createdAt: '2025-11-20',
          updatedAt: '2025-12-01',
          creator: { name: 'Anonymous User', state: 'Maharashtra' }
        },
        {
          _id: '2',
          title: 'Healthcare Infrastructure Improvement',
          description: 'Petition for increased healthcare funding and infrastructure development in rural areas.',
          category: 'Healthcare',
          status: 'submitted',
          targetAuthority: 'Ministry of Health and Family Welfare',
          signatures: 3421,
          signatureGoal: 10000,
          createdAt: '2025-11-15',
          updatedAt: '2025-11-28',
          creator: { name: 'Anonymous User', state: 'Karnataka' }
        },
        {
          _id: '3',
          title: 'Environmental Protection Act Amendment',
          description: 'Request for stricter environmental protection laws and enforcement mechanisms.',
          category: 'Environment',
          status: 'resolved',
          targetAuthority: 'Ministry of Environment, Forest and Climate Change',
          signatures: 5672,
          signatureGoal: 15000,
          createdAt: '2025-10-10',
          updatedAt: '2025-11-30',
          creator: { name: 'Anonymous User', state: 'Delhi' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (petitionId, newStatus) => {
    try {
      await axios.patch(`/api/admin/petitions/${petitionId}/status`, { status: newStatus });
      setPetitions(petitions.map(petition => 
        petition._id === petitionId ? { ...petition, status: newStatus } : petition
      ));
    } catch (error) {
      console.error('Error updating petition status:', error);
      alert('Failed to update petition status');
    }
  };

  const handleDeletePetition = async (petitionId) => {
    if (!window.confirm('Are you sure you want to delete this petition? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/petitions/${petitionId}`);
      setPetitions(petitions.filter(petition => petition._id !== petitionId));
    } catch (error) {
      console.error('Error deleting petition:', error);
      alert('Failed to delete petition');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      submitted: '#3b82f6',
      resolved: '#8b5cf6',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getProgressPercentage = (signatures, goal) => {
    return Math.min((signatures / goal) * 100, 100);
  };

  const getMilestones = (signatures) => {
    const milestones = [100, 500, 1000, 5000, 10000, 50000];
    return milestones.filter(m => signatures >= m).length;
  };

  const filteredPetitions = petitions.filter(petition => {
    const matchesSearch = petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         petition.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
 petition.targetAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="petitions-management">
      {/* Header Controls */}
      <div className="page-header">
        <div className="header-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search petitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchPetitions()}
            />
            <button onClick={fetchPetitions}>🔍</button>
          </div>
          
          <div className="filter-tabs">
            {['all', 'active', 'submitted', 'resolved', 'rejected'].map((filterOption) => (
              <button
                key={filterOption}
                className={`filter-tab ${filter === filterOption ? 'active' : ''}`}
                onClick={() => setFilter(filterOption)}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Petitions Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading petitions...</p>
        </div>
      ) : (
        <div className="petitions-grid">
          {filteredPetitions.map((petition) => (
            <div key={petition._id} className="petition-card">
              <div className="petition-header">
                <div className="petition-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(petition.status) }}
                  >
                    {petition.status.toUpperCase()}
                  </span>
                  <div className="petition-milestones">
                    🏆 {getMilestones(petition.signatures)} milestones
                  </div>
                </div>
                <div className="petition-actions">
                  <button 
                    className="action-button"
                    onClick={() => {
                      setSelectedPetition(petition);
                      setShowDetailsModal(true);
                    }}
                  >
                    👁️
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDeletePetition(petition._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="petition-content">
                <h3 className="petition-title">{petition.title}</h3>
                <p className="petition-description">{petition.description}</p>
                
                <div className="petition-meta">
                  <div className="meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{petition.category}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Target:</span>
                    <span className="meta-value">{petition.targetAuthority}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Creator:</span>
                    <span className="meta-value">{petition.creator?.state || 'Unknown'}</span>
                  </div>
                </div>
              </div>
              
              <div className="petition-progress">
                <div className="progress-header">
                  <span className="progress-stats">
                    {petition.signatures.toLocaleString()} / {petition.signatureGoal.toLocaleString()} signatures
                  </span>
                  <span className="progress-percentage">
                    {getProgressPercentage(petition.signatures, petition.signatureGoal).toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(petition.signatures, petition.signatureGoal)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="petition-footer">
                <div className="status-controls">
                  {petition.status === 'active' && (
                    <>
                      <button 
                        className="status-button submit"
                        onClick={() => handleStatusChange(petition._id, 'submitted')}
                      >
                        Mark as Submitted
                      </button>
                      <button 
                        className="status-button reject"
                        onClick={() => handleStatusChange(petition._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {petition.status === 'submitted' && (
                    <>
                      <button 
                        className="status-button resolve"
                        onClick={() => handleStatusChange(petition._id, 'resolved')}
                      >
                        Mark as Resolved
                      </button>
                      <button 
                        className="status-button reject"
                        onClick={() => handleStatusChange(petition._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
                
                <div className="petition-stats">
                  <span className="updated-date">
                    Updated {new Date(petition.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredPetitions.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No petitions found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Petition Details Modal */}
      {showDetailsModal && selectedPetition && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Petition Details</h2>
              <button onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>{selectedPetition.title}</h3>
                <p>{selectedPetition.description}</p>
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Status:</strong>
                  <span style={{ color: getStatusColor(selectedPetition.status) }}>
                    {selectedPetition.status.toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Category:</strong>
                  <span>{selectedPetition.category}</span>
                </div>
                <div className="detail-item">
                  <strong>Target Authority:</strong>
                  <span>{selectedPetition.targetAuthority}</span>
                </div>
                <div className="detail-item">
                  <strong>Creator Location:</strong>
                  <span>{selectedPetition.creator?.state || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <strong>Signatures:</strong>
                  <span>{selectedPetition.signatures?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <strong>Goal:</strong>
                  <span>{selectedPetition.signatureGoal?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <strong>Progress:</strong>
                  <span>{getProgressPercentage(selectedPetition.signatures, selectedPetition.signatureGoal).toFixed(1)}%</span>
                </div>
                <div className="detail-item">
                  <strong>Created:</strong>
                  <span>{new Date(selectedPetition.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <strong>Last Updated:</strong>
                  <span>{new Date(selectedPetition.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="milestones-section">
                <h4>Milestones Reached</h4>
                <div className="milestones-list">
                  {[100, 500, 1000, 5000, 10000, 50000].map((milestone) => (
                    <div 
                      key={milestone} 
                      className={`milestone ${selectedPetition.signatures >= milestone ? 'reached' : ''}`}
                    >
                      {milestone.toLocaleString()} signatures
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetitionsManagement;