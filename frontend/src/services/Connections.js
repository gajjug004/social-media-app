import api from '../config/axiosConfig';

const Connection = {
  // Get all user connections (optionally filtered by status and user)
  getConnections: async (status = null, user = null) => {
    try {
      const params = {};
      if (status) params.status = status;
      if (user) params.user = user;

      const response = await api.get('users/connections/', { params });
      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch connections');
    }
  },

  // Send connection request to a user by ID
  sendRequest: async (userId) => {
    try {
      const response = await api.post(`users/${userId}/send_connection_request/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to send request');
    }
  },

  // Accept a connection request from a user by ID
  acceptRequest: async (userId) => {
    try {
      const response = await api.post(`users/${userId}/accept_connection_request/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to accept request');
    }
  },

  // Reject a connection request from a user by ID
  rejectRequest: async (userId) => {
    try {
      const response = await api.post(`users/${userId}/reject_connection_request/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to reject request');
    }
  },

  // Get mutual connections between the logged-in user and a specific user
  getMutualConnections: async (userId) => {
    try {
      const response = await api.get(`users/${userId}/mutual_connections/`);
      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch mutual connections');
    }
  },

  searchConnections: async (search = null, status = null) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
  
      const response = await api.get('users/connections/', { params });
      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch user');
    }
  },

  pendingConnections: async () => {
    try {
      const response = await api.get('users/pending_connections/');
      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch user');
    }
  }
};

export default Connection;
