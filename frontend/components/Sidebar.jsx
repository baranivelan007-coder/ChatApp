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
      // Add to local contact list immediately so it shows in sidebar
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
    <div className="w-full md:w-80 bg-white border-r flex flex-col h-full">
      <div className="bg-whatsapp-green text-white p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-xs opacity-80 font-mono">{user?.uniqueId}</p>
        </div>
        <button onClick={logout} className="text-sm underline opacity-90">
          Logout
        </button>
      </div>

      <form onSubmit={handleSearch} className="p-3 border-b">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Chat ID e.g. U7X9K2A"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-whatsapp-green text-white px-3 rounded text-sm disabled:opacity-50"
          >
            Find
          </button>
        </div>
        {searchError && <p className="text-red-500 text-xs mt-1">{searchError}</p>}
      </form>

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-6 px-4">
            No chats yet. Search someone's Chat ID above to start.
          </p>
        )}
        {contacts.map((c) => (
          <button
            key={c.uniqueId}
            onClick={() => onSelectChat(c)}
            className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b ${
              activeChat?.uniqueId === c.uniqueId ? 'bg-gray-100' : ''
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-whatsapp-green text-white flex items-center justify-center font-semibold">
                {c.name?.[0]?.toUpperCase()}
              </div>
              {onlineUserIds.has(c._id || c.id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-gray-400 font-mono">{c.uniqueId}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
