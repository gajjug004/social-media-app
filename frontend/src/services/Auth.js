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
      const response = await api.post('users/login/', {
        mobile,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      const userResponse = await Auth.getUser();
      return userResponse;
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('users/register/', userData);
      const user = response.data;

      // Auto-login (optional)
      const loginResponse = await Auth.login(user.mobile, userData.password);
      return loginResponse;
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Registration failed';
      throw new Error(errMsg);
    }
  },

  logout: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return Promise.resolve();
  },
};

export default Auth;
