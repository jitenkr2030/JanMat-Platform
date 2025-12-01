import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePolls: 0,
    totalVotes: 0,
    totalPetitions: 0,
    avgParticipationRate: 0,
    sentimentScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse, trendsResponse] = await Promise.all([
        axios.get('/api/admin/dashboard/stats'),
        axios.get('/api/admin/dashboard/recent-activity'),
        axios.get('/api/admin/dashboard/trending-topics')
      ]);

      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
      setTrendingTopics(trendsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Mock data for development
      setStats({
        totalUsers: 12547,
        activePolls: 47,
        totalVotes: 89543,
        totalPetitions: 23,
        avgParticipationRate: 68.5,
        sentimentScore: 72.3
      });
      setRecentActivity([
        { id: 1, type: 'poll', title: 'New poll created: Climate Action Priority', time: '2 minutes ago' },
        { id: 2, type: 'petition', title: 'Petition reached 1000 signatures: Digital Payment Reform', time: '15 minutes ago' },
        { id: 3, type: 'user', title: '156 new users registered today', time: '1 hour ago' },
        { id: 4, type: 'vote', title: 'Healthcare Policy poll reached 5000 votes', time: '2 hours ago' }
      ]);
      setTrendingTopics([
        { topic: 'Digital India', mentions: 1247, trend: 'up' },
        { topic: 'Healthcare Reform', mentions: 892, trend: 'up' },
        { topic: 'Education Policy', mentions: 743, trend: 'down' },
        { topic: 'Environmental Protection', mentions: 621, trend: 'up' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score) => {
    if (score >= 70) return '#10b981'; // green
    if (score >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? '📈' : '📉';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-change positive">+12%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.activePolls}</h3>
            <p>Active Polls</p>
          </div>
          <div className="stat-change positive">+5</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🗳️</div>
          <div className="stat-content">
            <h3>{stats.totalVotes.toLocaleString()}</h3>
            <p>Total Votes</p>
          </div>
          <div className="stat-change positive">+18%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalPetitions}</h3>
            <p>Open Petitions</p>
          </div>
          <div className="stat-change neutral">0</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Participation Rate</h3>
          <div className="circular-progress">
            <svg width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - stats.avgParticipationRate / 100)}`}
                strokeLinecap="round"
                className="progress-circle"
              />
            </svg>
            <div className="progress-text">
              <span className="progress-value">{stats.avgParticipationRate}%</span>
              <span className="progress-label">Avg Rate</span>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Public Sentiment</h3>
          <div className="sentiment-gauge">
            <div className="sentiment-score" style={{ color: getSentimentColor(stats.sentimentScore) }}>
              {stats.sentimentScore}
            </div>
            <div className="sentiment-label">
              {stats.sentimentScore >= 70 ? 'Positive' : stats.sentimentScore >= 50 ? 'Neutral' : 'Concerning'}
            </div>
            <div className="sentiment-bar">
              <div 
                className="sentiment-fill" 
                style={{ 
                  width: `${stats.sentimentScore}%`,
                  backgroundColor: getSentimentColor(stats.sentimentScore)
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity and Trends */}
      <div className="content-row">
        <div className="activity-card">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'poll' && '📝'}
                  {activity.type === 'petition' && '📋'}
                  {activity.type === 'user' && '👥'}
                  {activity.type === 'vote' && '🗳️'}
                </div>
                <div className="activity-content">
                  <p className="activity-title">{activity.title}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="trends-card">
          <h3>Trending Topics</h3>
          <div className="trends-list">
            {trendingTopics.map((topic, index) => (
              <div key={index} className="trend-item">
                <div className="trend-content">
                  <span className="trend-topic">{topic.topic}</span>
                  <span className="trend-mentions">{topic.mentions} mentions</span>
                </div>
                <div className="trend-icon">{getTrendIcon(topic.trend)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;