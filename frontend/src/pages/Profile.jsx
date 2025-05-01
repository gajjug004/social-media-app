import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Auth from '../services/Auth';
import Connections from '../services/Connections';
import UserProfile from '../services/Profile';

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [mutualConnections, setMutualConnections] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          navigate('/login');
          return;
        }

        setLoggedInUser(user);
        const ownProfileCheck = id === String(user.id);
        setIsOwnProfile(ownProfileCheck);

        const profileData = await UserProfile.getProfile(id);
        if (!profileData) throw new Error('Profile not found');
        setProfile(profileData);

        if (ownProfileCheck) {
          const connectionsData = await Connections.getConnections('accepted');
          setConnections(connectionsData.connections);

          const pendingData = await Connections.pendingConnections();
          setPendingRequests(pendingData.connections || []);
        } else {
          const userConnections = await Connections.getConnections('accepted', id);
          setConnections(userConnections.connections);
          setConnectionStatus(profileData.connection_status);
          const mutualData = await Connections.getMutualConnections(id);
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
      await Connections.sendRequest(profile.id);
      setConnectionStatus('pending');
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await Connections.acceptRequest(requestId);
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      const updatedConnections = await Connections.getConnections('accepted');
      setConnections(updatedConnections.connections);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await Connections.rejectRequest(requestId);
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
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
              <span className="text-3xl text-gray-600">{profile.name?.[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-gray-600">{profile.mobile}</p>
            </div>
          </div>

          {!isOwnProfile && (
            <div>
              {connectionStatus === 'accepted' ? (
                <span className="text-green-600 font-semibold">Connected</span>
              ) : connectionStatus === 'pending' ? (
                <span className="text-yellow-600 font-semibold">Request Pending</span>
              ) : connectionStatus === 'rejected' ? (
                <button
                  onClick={handleConnect}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Reconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isOwnProfile && pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Requests ({pendingRequests.length})</h2>
          <div className="bg-white rounded-lg shadow-md p-4">
            {pendingRequests.map((request) => (
              <div
                key={request.user_from.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg text-gray-600">{request.user_from.name?.[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium">{request.user_from.name}</p>
                    <p className="text-sm text-gray-500">{request.user_from.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(request.user_from.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.user_from.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer"
                  onClick={() => navigate(`/profile/${connection.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg text-gray-600">{connection.name?.[0]}</span>
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
                    className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${connection.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg text-gray-600">{connection.name?.[0]}</span>
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
