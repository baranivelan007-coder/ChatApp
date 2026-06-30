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
      setCreatedUser(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (createdUser) {
    return (
      <div className="min-h-screen flex items-center justify-center auth-bg px-4">
        <div className="glass-card p-8 rounded-3xl w-full max-w-sm text-center animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/40">
            ✓
          </div>
          <h1 className="text-xl font-extrabold text-gray-800 mb-2">Account created!</h1>
          <p className="text-gray-500 text-sm mb-4">Your unique Chat ID is:</p>
          <div className="bg-brand-50 border border-brand-100 rounded-xl py-3 px-4 font-mono text-2xl tracking-wider text-brand-700 mb-4">
            {createdUser.uniqueId}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Share this ID with others so they can start a chat with you. You can find it again
            anytime in your profile.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition"
          >
            Continue to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-bg px-4">
      <div className="glass-card p-8 rounded-3xl w-full max-w-sm animate-fade-in-up">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/40">
            💬
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-1 text-center">
          Create account
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">Join and start chatting in seconds</p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}