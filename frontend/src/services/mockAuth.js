import { users } from '../mockData/users';

let currentUser = users[0]; // Default logged in user for demo

export const mockAuth = {
  getUser: () => Promise.resolve({ user: currentUser }),
  login: (mobile, password) => {
    const user = users.find(u => u.mobile === mobile);
    if (user) {
      currentUser = user;
      return Promise.resolve({ user });
    }
    return Promise.reject(new Error('Invalid credentials'));
  },
  register: (userData) => {
    const newUser = {
      id: String(users.length + 1),
      ...userData,
      connections: []
    };
    users.push(newUser);
    currentUser = newUser;
    return Promise.resolve({ user: newUser });
  },
  logout: () => {
    currentUser = null;
    return Promise.resolve();
  }
};