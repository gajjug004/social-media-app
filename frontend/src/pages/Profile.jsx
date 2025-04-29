import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockAuth } from '../services/mockAuth';
import { mockProfile } from '../services/mockProfile';

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [mutualConnections, setMutualConnections] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { user } = await mockAuth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        setIsOwnProfile(id === 'me' || id === user.id);
        const profileId = id === 'me' ? user.id : id;

        // Fetch profile data
        const profileData = await mockProfile.getProfile(profileId);
        if (!profileData) throw new Error('Profile not found');
        setProfile(profileData);

        // Fetch connections
        const connectionsData = await mockProfile.getConnections(profileId);
        setConnections(connectionsData);

        // Check if viewing user is connected to profile and get mutual connections
        if (!isOwnProfile) {
          const isUserConnected = user.connections.includes(profileId);
          setIsConnected(isUserConnected);

          const mutualData = await mockProfile.getMutualConnections(user.id, profileId);
          setMutualConnections(mutualData);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate]);

  const handleConnect = async () => {
    try {
      const { user } = await mockAuth.getUser();
      await mockProfile.addConnection(user.id, id);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-700">Profile not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-3xl text-gray-600">{profile.name[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-gray-600">{profile.mobile}</p>
            </div>
          </div>
          {!isOwnProfile && !isConnected && (
            <button
              onClick={handleConnect}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Connections ({connections.length})</h2>
          <div className="bg-white rounded-lg shadow-md p-4">
            {connections.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No connections yet</p>
            ) : (
              connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                  onClick={() => navigate(`/profile/${connection.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg text-gray-600">{connection.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{connection.name}</p>
                      <p className="text-sm text-gray-500">{connection.email}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {!isOwnProfile && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Mutual Connections ({mutualConnections.length})
            </h2>
            <div className="bg-white rounded-lg shadow-md p-4">
              {mutualConnections.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No mutual connections</p>
              ) : (
                mutualConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    onClick={() => navigate(`/profile/${connection.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg text-gray-600">{connection.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{connection.name}</p>
                        <p className="text-sm text-gray-500">{connection.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;