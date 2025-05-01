import api from '../config/axiosConfig';

const Posts = {
  // Fetch all posts
  getAllPosts: async () => {
    try {
      const response = await api.get('/post/');
      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch posts');
    }
  },

  // Fetch posts for a specific user
  getUserPosts: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/post/`);
      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch user posts');
    }
  },

  // Create a new post
  createPost: async (formData) => {
    try {
      const response = await api.post('/post/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create post');
    }
  },

  // Like a post
  likePost: async (postId) => {
    try {
      const response = await api.post(`/post/${postId}/like/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to like post');
    }
  },

  // Unlike a post
  unlikePost: async (postId) => {
    try {
      const response = await api.post(`/post/${postId}/unlike/`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to unlike post');
    }
  },

  // Add a comment to a post
  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/post/${postId}/comments/`, { content });
      return response.data;
    } catch (error) {
      throw new Error('Failed to add comment');
    }
  }
};

export default Posts;
