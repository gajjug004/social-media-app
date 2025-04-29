import { useState } from 'react';
import { Link } from 'react-router-dom';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Implement search logic here
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search users by name, email, or mobile..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            {!user.isConnected && (
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
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