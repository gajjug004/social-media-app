import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../services/Profile';
import Connection from '../services/Connections';
import debounce from 'lodash.debounce';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleConnectRequest = async (userId) => {
    try {
      await Connection.sendRequest(userId);
      // Optimistically update UI
      setSearchResults((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, connection_status: 'pending' } : user
        )
      );
    } catch (err) {
      console.error('Connection request failed:', err.message);
    }
  };  

  const fetchSearchResults = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setSuggestions([]);
      return;
    }

    try {
      const users = await UserProfile.searchProfile(value);
      setSearchResults(users);

      // Autocomplete: show connected users from results
      const connectedSuggestions = await Connection.searchConnections(value, 'accepted');
      setSuggestions(connectedSuggestions.connections.slice(0, 5)); // top 5 suggestions
    } catch (err) {
      console.error('Search failed:', err.message);
    }
  };

  const debouncedSearch = debounce(fetchSearchResults, 300);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel(); // cleanup on unmount
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-20">
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search users by name, email, or mobile..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-200 rounded-md w-full mt-1 shadow">
            {suggestions.map((user) => (
              <li key={user.id}>
                <Link
                  to={`/profile/${user.id}`}
                  className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                >
                  {user.name} ({user.email}) ({user.mobile})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {searchResults.map((user) => (
          <div
            key={user.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div>
              <Link
                to={`/profile/${user.id}`}
                className="text-lg font-medium text-gray-900 hover:text-blue-600"
              >
                {user.name}
              </Link>
              <p className="text-sm text-gray-500">{user.mobile}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            {user.connection_status === 'accepted' ? (
              <button
                disabled
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-default"
              >
                Connected
              </button>
            ) : user.connection_status === 'pending' ? (
              <button
                disabled
                className="bg-yellow-300 text-yellow-800 px-4 py-2 rounded-md cursor-default"
              >
                Request Pending
              </button>
            ) : user.connection_status === 'rejected' ? (
              <button
                onClick={() => handleConnectRequest(user.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Reconnect
              </button>
            ) : (
              <button
                onClick={() => handleConnectRequest(user.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Connect
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
