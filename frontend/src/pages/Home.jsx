import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAuth } from '../services/mockAuth';
import { mockPosts } from '../services/mockPosts';

function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [newPost, setNewPost] = useState({
    content: '',
    visibility: 'public',
    image: ''
  });
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { user } = await mockAuth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setCurrentUser(user);
        const fetchedPosts = await mockPosts.getAllPosts();
        setPosts(fetchedPosts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const post = await mockPosts.createPost(
        currentUser.id,
        newPost.content,
        newPost.visibility,
        newPost.image || null
      );
      const enrichedPost = {
        ...post,
        author: currentUser,
        likes: [],
        comments: []
      };
      setPosts([enrichedPost, ...posts]);
      setNewPost({ content: '', visibility: 'public', image: '' });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const updatedPost = await mockPosts.likePost(postId, currentUser.id);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: [...post.likes, currentUser] }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const updatedPost = await mockPosts.unlikePost(postId, currentUser.id);
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes.filter(user => user.id !== currentUser.id) }
          : post
      ));
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            placeholder="What's on your mind?"
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
          <div className="mt-4">
            <input
              type="url"
              value={newPost.image}
              onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
              placeholder="Add image URL (optional)"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          </div>
          <div className="mt-4 flex justify-between items-center">
            <select
              value={newPost.visibility}
              onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="connections">Connections Only</option>
              <option value="private">Private</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              disabled={!newPost.content.trim()}
            >
              Post
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg text-gray-600">{post.author.name[0]}</span>
              </div>
              <div className="ml-4">
                <p 
                  className="font-medium hover:text-blue-500 cursor-pointer"
                  onClick={() => navigate(`/profile/${post.author.id}`)}
                >
                  {post.author.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <p className="text-gray-800 mb-4">{post.content}</p>
            {post.image && (
              <div className="mb-4">
                <img
                  src={post.image}
                  alt="Post content"
                  className="rounded-lg w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => 
                    post.likes.some(user => user.id === currentUser.id)
                      ? handleUnlike(post.id)
                      : handleLike(post.id)
                  }
                  className={`flex items-center space-x-1 ${
                    post.likes.some(user => user.id === currentUser.id)
                      ? 'text-blue-500'
                      : 'text-gray-500'
                  }`}
                >
                  <span>{post.likes.length} Likes</span>
                </button>
                <span>{post.comments.length} Comments</span>
              </div>
              <span className="capitalize">{post.visibility}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;