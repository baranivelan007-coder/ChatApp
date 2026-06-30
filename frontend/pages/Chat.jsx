import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

export default function Chat() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 h-full`}>
        <Sidebar activeChat={activeChat} onSelectChat={setActiveChat} />
      </div>
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 h-full`}>
        <ChatWindow activeChat={activeChat} onBack={() => setActiveChat(null)} />
      </div>
    </div>
  );
}