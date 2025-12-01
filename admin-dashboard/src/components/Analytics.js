import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    userDemographics: {},
    geographicData: [],
    sentimentTrends: [],
    participationRates: {},
    topCategories: [],
    timeSeriesData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState('participation');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/analytics?timeRange=${timeRange}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data for development
      setAnalyticsData({
        userDemographics: {
          ageGroups: {
            '18-25': 2847,
            '26-35': 3421,
            '36-45': 2109,
            '46-55': 1456,
            '55+': 1234
          },
          gender: {
            'Male': 6234,
            'Female': 4789,
            'Other': 144,
            'Prefer not to say': 900
          }
        },
        geographicData: [
          { state: 'Maharashtra', users: 2847, polls: 23, petitions: 8, sentiment: 72 },
          { state: 'Karnataka', users: 2109, polls: 18, petitions: 5, sentiment: 68 },
          { state: 'Delhi', users: 1923, polls: 15, petitions: 12, sentiment: 75 },
          { state: 'Tamil Nadu', users: 1654, polls: 12, petitions: 6, sentiment: 70 },
          { state: 'Uttar Pradesh', users: 1432, polls: 10, petitions: 4, sentiment: 65 }
        ],
        sentimentTrends: [
          { date: '2025-11-24', trust: 68, support: 72, concern: 45, satisfaction: 58, optimism: 62 },
          { date: '2025-11-25', trust: 70, support: 75, concern: 42, satisfaction: 61, optimism: 65 },
          { date: '2025-11-26', trust: 72, support: 78, concern: 38, satisfaction: 64, optimism: 68 },
          { date: '2025-11-27', trust: 74, support: 80, concern: 35, satisfaction: 67, optimism: 70 },
          { date: '2025-11-28', trust: 73, support: 79, concern: 37, satisfaction: 66, optimism: 69 },
          { date: '2025-11-29', trust: 75, support: 82, concern: 33, satisfaction: 69, optimism: 72 },
          { date: '2025-11-30', trust: 76, support: 83, concern: 31, satisfaction: 71, optimism: 74 }
        ],
        participationRates: {
          polls: 68.5,
          petitions: 45.2,
          communities: 32.8
        },
        topCategories: [
          { category: 'Politics', count: 45, engagement: 78.5 },
          { category: 'Healthcare', count: 38, engagement: 72.1 },
          { category: 'Education', count: 32, engagement: 68.9 },
          { category: 'Environment', count: 28, engagement: 75.3 },
          { category: 'Technology', count: 25, engagement: 82.7 }
        ],
        timeSeriesData: [
          { date: '2025-11-24', users: 11800, votes: 1240, petitions: 89 },
          { date: '2025-11-25', users: 11950, votes: 1380, petitions: 95 },
          { date: '2025-11-26', users: 12100, votes: 1520, petitions: 102 },
          { date: '2025-11-27', users: 12250, votes: 1450, petitions: 98 },
          { date: '2025-11-28', users: 12400, votes: 1680, petitions: 105 },
          { date: '2025-11-29', users: 12550, votes: 1720, petitions: 112 },
          { date: '2025-11-30', users: 12700, votes: 1850, petitions: 118 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDemographicsChart = () => {
    const totalAge = Object.values(analyticsData.userDemographics.ageGroups || {}).reduce((a, b) => a + b, 0);
    const totalGender = Object.values(analyticsData.userDemographics.gender || {}).reduce((a, b) => a + b, 0);

    return (
      <div className="demographics-grid">
        <div className="demo-chart">
          <h4>Age Distribution</h4>
          <div className="bar-chart">
            {Object.entries(analyticsData.userDemographics.ageGroups || {}).map(([age, count]) => (
              <div key={age} className="bar-item">
                <div className="bar-label">{age}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ width: `${(count / totalAge) * 100}%` }}
                  ></div>
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="demo-chart">
          <h4>Gender Distribution</h4>
          <div className="pie-chart">
            {Object.entries(analyticsData.userDemographics.gender || {}).map(([gender, count], index) => (
              <div key={gender} className="pie-item">
                <div 
                  className="pie-color"
                  style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index] }}
                ></div>
                <div className="pie-label">
                  {gender}: {count} ({(count / totalGender * 100).toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGeographicChart = () => {
    return (
      <div className="geographic-chart">
        <h4>State-wise Activity</h4>
        <div className="geo-list">
          {analyticsData.geographicData.map((state, index) => (
            <div key={state.state} className="geo-item">
              <div className="geo-rank">#{index + 1}</div>
              <div className="geo-info">
                <div className="geo-name">{state.state}</div>
                <div className="geo-stats">
                  Users: {state.users} | Polls: {state.polls} | Petitions: {state.petitions}
                </div>
              </div>
              <div className="geo-sentiment">
                <div 
                  className="sentiment-indicator"
                  style={{ backgroundColor: state.sentiment >= 70 ? '#10b981' : state.sentiment >= 50 ? '#f59e0b' : '#ef4444' }}
                >
                  {state.sentiment}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSentimentTrends = () => {
    const latest = analyticsData.sentimentTrends[analyticsData.sentimentTrends.length - 1];
    
    return (
      <div className="sentiment-section">
        <h4>Current Sentiment Index</h4>
        <div className="sentiment-indicators">
          {[
            { key: 'trust', label: 'Trust', icon: '🤝', color: '#10b981' },
            { key: 'support', label: 'Support', icon: '👍', color: '#3b82f6' },
            { key: 'concern', label: 'Concern', icon: '⚠️', color: '#f59e0b' },
            { key: 'satisfaction', label: 'Satisfaction', icon: '😊', color: '#8b5cf6' },
            { key: 'optimism', label: 'Optimism', icon: '🌟', color: '#06b6d4' }
          ].map(({ key, label, icon, color }) => (
            <div key={key} className="sentiment-card">
              <div className="sentiment-icon">{icon}</div>
              <div className="sentiment-label">{label}</div>
              <div 
                className="sentiment-score"
                style={{ color }}
              >
                {latest?.[key] || 0}
              </div>
              <div className="sentiment-bar">
                <div 
                  className="sentiment-fill"
                  style={{ 
                    width: `${latest?.[key] || 0}%`,
                    backgroundColor: color
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeSeriesChart = () => {
    const maxValue = Math.max(
      ...analyticsData.timeSeriesData.flatMap(d => [d.users, d.votes * 10, d.petitions * 50])
    );

    return (
      <div className="time-series-chart">
        <h4>Activity Trends ({timeRange})</h4>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Users</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
            <span>Votes (×10)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Petitions (×50)</span>
          </div>
        </div>
        <div className="chart-container">
          {analyticsData.timeSeriesData.map((data, index) => (
            <div key={index} className="chart-column">
              <div className="chart-bars">
                <div 
                  className="chart-bar users"
                  style={{ height: `${(data.users / maxValue) * 200}px` }}
                  title={`Users: ${data.users}`}
                ></div>
                <div 
                  className="chart-bar votes"
                  style={{ height: `${(data.votes * 10 / maxValue) * 200}px` }}
                  title={`Votes: ${data.votes}`}
                ></div>
                <div 
                  className="chart-bar petitions"
                  style={{ height: `${(data.petitions * 50 / maxValue) * 200}px` }}
                  title={`Petitions: ${data.petitions}`}
                ></div>
              </div>
              <div className="chart-label">
                {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Header Controls */}
      <div className="analytics-header">
        <div className="time-range-selector">
          {[
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: '90d', label: 'Last 90 Days' },
            { value: '1y', label: 'Last Year' }
          ].map((range) => (
            <button
              key={range.value}
              className={`range-button ${timeRange === range.value ? 'active' : ''}`}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
        
        <div className="metric-selector">
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="participation">Participation Rates</option>
            <option value="engagement">Engagement Metrics</option>
            <option value="growth">User Growth</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card">
          <h3>Average Participation Rate</h3>
          <div className="metric-value">{analyticsData.participationRates.polls}%</div>
          <div className="metric-change positive">+5.2% from last period</div>
        </div>
        
        <div className="metric-card">
          <h3>Peak Daily Activity</h3>
          <div className="metric-value">
            {Math.max(...analyticsData.timeSeriesData.map(d => d.votes))}
          </div>
          <div className="metric-change neutral">Votes in one day</div>
        </div>
        
        <div className="metric-card">
          <h3>Geographic Coverage</h3>
          <div className="metric-value">{analyticsData.geographicData.length}</div>
          <div className="metric-change positive">States active</div>
        </div>
        
        <div className="metric-card">
          <h3>Top Category</h3>
          <div className="metric-value">{analyticsData.topCategories[0]?.category}</div>
          <div className="metric-change neutral">{analyticsData.topCategories[0]?.engagement}% engagement</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-section">
          {renderTimeSeriesChart()}
        </div>
        
        <div className="chart-section">
          {renderSentimentTrends()}
        </div>
        
        <div className="chart-section full-width">
          {renderDemographicsChart()}
        </div>
        
        <div className="chart-section full-width">
          {renderGeographicChart()}
        </div>
        
        <div className="chart-section">
          <h4>Top Categories by Engagement</h4>
          <div className="category-chart">
            {analyticsData.topCategories.map((category, index) => (
              <div key={category.category} className="category-item">
                <div className="category-rank">#{index + 1}</div>
                <div className="category-info">
                  <div className="category-name">{category.category}</div>
                  <div className="category-stats">
                    {category.count} polls | {category.engagement}% engagement
                  </div>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ width: `${category.engagement}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;