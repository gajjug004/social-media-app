import { users } from '../mockData/users';

export const mockProfile = {
  getProfile: (userId) => {
    const user = users.find(u => u.id === userId);
    return Promise.resolve(user);
  },

  getConnections: (userId) => {
    const user = users.find(u => u.id === userId);
    const connections = user.connections.map(id => users.find(u => u.id === id));
    return Promise.resolve(connections);
  },

  getMutualConnections: (userId1, userId2) => {
    const user1 = users.find(u => u.id === userId1);
    const user2 = users.find(u => u.id === userId2);
    const mutualConnections = user1.connections.filter(id => user2.connections.includes(id))
      .map(id => users.find(u => u.id === id));
    return Promise.resolve(mutualConnections);
  },

  addConnection: (userId1, userId2) => {
    const user1 = users.find(u => u.id === userId1);
    const user2 = users.find(u => u.id === userId2);
    if (!user1.connections.includes(userId2)) {
      user1.connections.push(userId2);
      user2.connections.push(userId1);
    }
    return Promise.resolve();
  }
};