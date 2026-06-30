import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signup(name, email, password);
      setCreatedUser(user); // show their new uniqueId before continuing
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (createdUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-whatsapp-chat">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
          <h1 className="text-xl font-bold text-whatsapp-green mb-2">Account created!</h1>
          <p className="text-gray-600 mb-4">Your unique Chat ID is:</p>
          <div className="bg-whatsapp-chat rounded-lg py-3 px-4 font-mono text-2xl tracking-wider text-whatsapp-green mb-4">
            {createdUser.uniqueId}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Share this ID with others so they can start a chat with you. You can find it again
            anytime in your profile.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-whatsapp-green text-white py-2 rounded font-medium hover:bg-opacity-90"
          >
            Continue to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-whatsapp-chat">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-whatsapp-green mb-6 text-center">
          Create Account
        </h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-whatsapp-green text-white py-2 rounded font-medium hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-whatsapp-green font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
