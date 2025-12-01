/**
 * API Service for JanMat Mobile App
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'
  : 'https://your-production-api.com/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `JanMat/${DeviceInfo.getVersion()} (${Platform.OS})`
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('Response Error:', error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      const errorMap = {
        400: 'Bad Request - Please check your input',
        401: 'Unauthorized - Please login again',
        403: 'Forbidden - You do not have permission',
        404: 'Not Found - The requested resource was not found',
        429: 'Too Many Requests - Please try again later',
        500: 'Internal Server Error - Please try again later',
        503: 'Service Unavailable - Please try again later'
      };

      return {
        status,
        message: data?.message || errorMap[status] || 'An error occurred',
        data: data?.data || null,
        errors: data?.errors || null
      };
    } else if (error.request) {
      // Network error
      return {
        status: 0,
        message: 'Network Error - Please check your connection',
        data: null,
        errors: null
      };
    } else {
      // Something else happened
      return {
        status: -1,
        message: error.message || 'An unexpected error occurred',
        data: null,
        errors: null
      };
    }
  }

  // Generic request method
  async request(method, endpoint, data = null, params = null) {
    try {
      const config = {
        method,
        url: endpoint,
        ...(data && { data }),
        ...(params && { params })
      };

      const response = await this.client(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Poll API methods
  async getPolls(params = {}) {
    return this.request('GET', '/polls', null, params);
  }

  async getActivePolls() {
    return this.request('GET', '/polls/active');
  }

  async getPollById(id) {
    return this.request('GET', `/polls/${id}`);
  }

  async getPollResults(id, filters = {}) {
    return this.request('GET', `/polls/${id}/results`, null, filters);
  }

  async createPoll(pollData, userId) {
    return this.request('POST', '/polls', { ...pollData, userId });
  }

  async updatePoll(id, updates) {
    return this.request('PUT', `/polls/${id}`, updates);
  }

  async deletePoll(id) {
    return this.request('DELETE', `/polls/${id}`);
  }

  // Vote API methods
  async castVote(voteData) {
    return this.request('POST', '/votes', voteData);
  }

  async getUserVotes(userId, params = {}) {
    return this.request('GET', `/votes/user/${userId}`, null, params);
  }

  async getPollVotes(pollId, params = {}) {
    return this.request('GET', `/votes/poll/${pollId}`, null, params);
  }

  async updateVote(voteId, updates) {
    return this.request('PUT', `/votes/${voteId}`, updates);
  }

  async deleteVote(voteId) {
    return this.request('DELETE', `/votes/${voteId}`);
  }

  async getVoteAnalytics(pollId) {
    return this.request('GET', `/votes/poll/${pollId}/analytics`);
  }

  async submitVote(voteData) {
    return this.request('POST', '/votes/submit', voteData);
  }

  async getUserVote(pollId) {
    return this.request('GET', `/votes/my-vote/${pollId}`);
  }

  // Petition API methods
  async getPetitions(params = {}) {
    return this.request('GET', '/petitions', null, params);
  }

  async getPetitionById(id) {
    return this.request('GET', `/petitions/${id}`);
  }

  async createPetition(petitionData) {
    return this.request('POST', '/petitions', petitionData);
  }

  async signPetition(petitionId, userId, message = '') {
    return this.request('POST', `/petitions/${petitionId}/sign`, {
      userId,
      message
    });
  }

  async getUrgentPetitions() {
    return this.request('GET', '/petitions/urgent');
  }

  async searchPetitions(query, params = {}) {
    return this.request('GET', '/petitions/search', null, { q: query, ...params });
  }

  async getAllPolls(params = {}) {
    return this.request('GET', '/polls/all', null, params);
  }

  async getAllPetitions(params = {}) {
    return this.request('GET', '/petitions/all', null, params);
  }

  async getPetitionResults(petitionId) {
    return this.request('GET', `/petitions/${petitionId}/results`);
  }

  async checkPetitionSignature(petitionId) {
    return this.request('GET', `/petitions/${petitionId}/check-signature`);
  }

  // Results API methods
  async getSentimentData(filters = {}) {
    return this.request('GET', '/results/sentiment', null, filters);
  }

  async getSentimentIndex(params = {}) {
    return this.request('GET', '/results/sentiment-index', null, params);
  }

  async getStateResults(params = {}) {
    return this.request('GET', '/results/state', null, params);
  }

  async getTrendingTopics(params = {}) {
    return this.request('GET', '/results/trending-topics', null, params);
  }

  async getDemographicResults(params = {}) {
    return this.request('GET', '/results/demographics', null, params);
  }

  async getPollDetailedResults(pollId, filters = {}) {
    return this.request('GET', `/results/polls/${pollId}`, null, filters);
  }

  // Admin API methods (for admin users only)
  async getDashboardStats() {
    return this.request('GET', '/admin/dashboard');
  }

  async getAnalytics(timeframe = '7d', category = null) {
    const params = { timeframe };
    if (category) params.category = category;
    return this.request('GET', '/admin/analytics', null, params);
  }

  async updatePetitionStatus(petitionId, status, adminNotes = '') {
    return this.request('PATCH', `/admin/petitions/${petitionId}/status`, {
      status,
      adminNotes
    });
  }

  async getSystemHealth() {
    return this.request('GET', '/admin/health');
  }

  // User profile API methods
  async getUserProfile() {
    return this.request('GET', '/users/profile');
  }

  async updateUserProfile(updates) {
    return this.request('PATCH', '/users/profile', updates);
  }

  async getUserVotingHistory() {
    return this.request('GET', '/users/voting-history');
  }

  async getUserCreatedPetitions() {
    return this.request('GET', '/users/created-petitions');
  }

  // Utility methods
  async healthCheck() {
    return this.request('GET', '/health');
  }

  // Helper method to handle retry logic
  async withRetry(requestFn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Only retry for network errors or 5xx server errors
        if (error.status === 0 || (error.status >= 500 && error.status < 600)) {
          console.log(`Retrying request... (${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        } else {
          throw error;
        }
      }
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;