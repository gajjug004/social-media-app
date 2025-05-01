import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Auth from '../services/Auth'; // adjust path if needed

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    setLoading(true);
    try {
      await Auth.register(userData);
      navigate('/login');
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (hasError) =>
    `mt-1 block w-full px-4 py-1 rounded-lg border shadow-sm transition duration-150 focus:outline-none ${
      hasError
        ? 'border-red-500 focus:ring-2 focus:ring-red-400'
        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400'
    }`;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['name', 'mobile', 'email'].map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium text-gray-700 capitalize">
              {field === 'mobile' ? 'Mobile Number' : field}
            </label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              id={field}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className={getInputClass(!!fieldErrors[field])}
              required
            />
            {fieldErrors[field] && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors[field][0]}</p>
            )}
          </div>
        ))}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={getInputClass(!!fieldErrors.password || !!error)}
            required
          />
          {fieldErrors.password && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.password[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={getInputClass(!!error)}
            required
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}

export default Register;
