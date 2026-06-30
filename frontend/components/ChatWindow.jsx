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
      <div className="flex-1 hidden md:flex items-center justify-center text-grey-400 bg-whatsapp-chat">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-whatsapp-chat">
      <div className="bg-whatsapp-green text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="md:hidden text-white text-2xl leading-none mr-1">
          ←
        </button>
        <div className="w-10 h-10 rounded-full bg-white text-whatsapp-green flex items-center justify-center font-semibold">
          {activeChat.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium">{activeChat.name}</p>
          <p className="text-xs opacity-80">
            {otherTyping ? 'typing...' : isOnline ? 'online' : 'offline'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => {
          const mine = (m.sender?.toString() || m.sender) === user.id;
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md px-3 py-2 rounded-lg text-sm shadow ${
                  mine ? 'bg-whatsapp-bubble' : 'bg-white'
                }`}
              >
                <p>{m.text}</p>
                <p className="text-[10px] text-gray-400 text-right mt-1">
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

      <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Type a message"
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
        />
        <button
          type="submit"
          className="bg-whatsapp-green text-white px-5 rounded-full text-sm font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}