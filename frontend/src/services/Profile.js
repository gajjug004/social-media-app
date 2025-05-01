import api from '../config/axiosConfig';

const UserProfile = {
  getProfile: async (userId) => {
    try {
      const response = await api.get(`users/${userId}/`);
      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch user');
    }
  },

  searchProfile: async (search = null) => {
    try {
      const params = search ? { search } : {};
      const response = await api.get('users/', { params });
      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch user');
    }
  }
  
};

export default UserProfile;