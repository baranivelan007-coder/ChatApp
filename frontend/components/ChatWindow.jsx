import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export default function ChatWindow({ activeChat, onBack }) {
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const bottomRef = useRef(null);

  const otherUserId = activeChat?._id || activeChat?.id;

  useEffect(() => {
    if (!otherUserId) return;
    setMessages([]);
    api.get(`/messages/${otherUserId}`).then((res) => setMessages(res.data.messages));
  }, [otherUserId]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      if (msg.sender === otherUserId || msg.receiver === otherUserId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const handleSent = (msg) => {
      if (msg.receiver === otherUserId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const handleTyping = ({ userId }) => {
      if (userId === otherUserId) setOtherTyping(true);
    };
    const handleStopTyping = ({ userId }) => {
      if (userId === otherUserId) setOtherTyping(false);
    };

    socket.on('receiveMessage', handleReceive);
    socket.on('messageSent', handleSent);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('messageSent', handleSent);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !otherUserId) return;
    socket.emit('sendMessage', { receiverId: otherUserId, text: text.trim() });
    socket.emit('stopTyping', { receiverId: otherUserId });
    setText('');
  };

  const handleChange = (e) => {
    setText(e.target.value);
    if (!socket || !otherUserId) return;
    socket.emit('typing', { receiverId: otherUserId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: otherUserId });
    }, 1500);
  };

  const isOnline = onlineUserIds.has(otherUserId);

  if (!activeChat) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center gap-3 bg-chat-bg text-center px-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-4xl">
          💬
        </div>
        <p className="text-gray-500 font-medium">Select a chat to start messaging</p>
        <p className="text-gray-400 text-sm max-w-xs">
          Pick a contact on the left, or search someone's Chat ID to say hi.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-chat-bg">
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white p-4 flex items-center gap-3 shadow-md">
        <button onClick={onBack} className="md:hidden text-white text-2xl leading-none mr-1">
          ←
        </button>
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-semibold">
          {activeChat?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{activeChat?.name}</p>
          <p className="text-xs opacity-80">
            {otherTyping ? 'typing...' : isOnline ? 'online' : 'offline'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => {
          const mine = (m.sender?.toString() || m.sender) === user?.id;
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 text-sm shadow-sm ${
                  mine
                    ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm'
                }`}
              >
                <p>{m.text}</p>
                <p className={`text-[10px] text-right mt-1 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type a message"
          className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-6 rounded-full text-sm font-semibold shadow shadow-brand-500/30 hover:shadow-brand-500/50 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}