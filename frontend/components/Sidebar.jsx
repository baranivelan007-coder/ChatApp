import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export default function Sidebar({ activeChat, onSelectChat }) {
  const { user, logout } = useAuth();
  const { onlineUserIds } = useSocket();
  const [contacts, setContacts] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);

  const loadContacts = async () => {
    try {
      const res = await api.get('/users/contacts');
      setContacts(res.data.contacts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchError('');
    if (!searchId.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/users/find/${searchId.trim()}`);
      const foundUser = res.data.user;
      onSelectChat(foundUser);
      setSearchId('');
      setContacts((prev) =>
        prev.find((c) => c.uniqueId === foundUser.uniqueId) ? prev : [foundUser, ...prev]
      );
    } catch (err) {
      setSearchError(err.response?.data?.message || 'User not found');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold leading-tight">{user?.name}</p>
            <p className="text-xs opacity-80 font-mono">{user?.uniqueId}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-xs font-medium bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSearch} className="p-3 border-b border-gray-100 bg-chat-bg/40">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Chat ID e.g. U7X9K2A"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-4 rounded-xl text-sm font-semibold shadow shadow-brand-500/30 disabled:opacity-50 transition"
          >
            Find
          </button>
        </div>
        {searchError && <p className="text-red-500 text-xs mt-1.5 ml-1">{searchError}</p>}
      </form>

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-8 px-6">
            No chats yet. Search someone's Chat ID above to start.
          </p>
        )}
        {contacts.map((c) => (
          <button
            key={c.uniqueId}
            onClick={() => onSelectChat(c)}
            className={`w-full flex items-center gap-3 p-3 hover:bg-brand-50 text-left border-b border-gray-50 transition ${
              activeChat?.uniqueId === c.uniqueId ? 'bg-brand-50' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-semibold shadow-sm">
                {c.name?.[0]?.toUpperCase()}
              </div>
              {onlineUserIds.has(c._id || c.id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate">{c.name}</p>
              <p className="text-xs text-gray-400 font-mono">{c.uniqueId}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}