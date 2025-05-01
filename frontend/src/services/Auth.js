import api from '../config/axiosConfig';

const Auth = {
  getUser: async () => {
    try {
      const response = await api.get('users/me/');
      return { user: response.data };
    } catch (error) {
      throw new Error('Unable to fetch user');
    }
  },

  login: async (mobile, password) => {
    try {
      const response = await api.post('users/login/', { mobile, password });
      const { access, refresh } = response.data;
  
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
  
      const userResponse = await Auth.getUser();
      localStorage.setItem('user', JSON.stringify(userResponse.user));
      return userResponse;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  },  

  register: async (userData) => {
    try {
      const response = await api.post('users/register/', userData);
      return response.data;
    } catch (error) {
      if (error.response?.data && typeof error.response.data === 'object') {
        throw { fieldErrors: error.response.data };
      }
      throw new Error('Registration failed');
    }
  },  

  logout: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
};

export default Auth;
