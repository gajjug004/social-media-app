import { posts } from '../mockData/posts';
import { users } from '../mockData/users';

export const mockPosts = {
  getAllPosts: () => {
    const enrichedPosts = posts.map(post => ({
      ...post,
      author: users.find(u => u.id === post.userId),
      likes: post.likes.map(userId => users.find(u => u.id === userId)),
      comments: post.comments.map(comment => ({
        ...comment,
        author: users.find(u => u.id === comment.userId)
      }))
    }));
    return Promise.resolve(enrichedPosts);
  },

  getUserPosts: (userId) => {
    const userPosts = posts
      .filter(post => post.userId === userId)
      .map(post => ({
        ...post,
        author: users.find(u => u.id === post.userId),
        likes: post.likes.map(userId => users.find(u => u.id === userId)),
        comments: post.comments.map(comment => ({
          ...comment,
          author: users.find(u => u.id === comment.userId)
        }))
      }));
    return Promise.resolve(userPosts);
  },

  createPost: (userId, content, visibility, image = null) => {
    const newPost = {
      id: String(posts.length + 1),
      userId,
      content,
      image,
      visibility,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };
    posts.push(newPost);
    return Promise.resolve(newPost);
  },

  likePost: (postId, userId) => {
    const post = posts.find(p => p.id === postId);
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    }
    return Promise.resolve(post);
  },

  unlikePost: (postId, userId) => {
    const post = posts.find(p => p.id === postId);
    post.likes = post.likes.filter(id => id !== userId);
    return Promise.resolve(post);
  },

  addComment: (postId, userId, content) => {
    const post = posts.find(p => p.id === postId);
    const newComment = {
      id: String(post.comments.length + 1),
      userId,
      content,
      createdAt: new Date().toISOString()
    };
    post.comments.push(newComment);
    return Promise.resolve(newComment);
  }
};