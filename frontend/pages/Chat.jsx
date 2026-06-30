import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

export default function Chat() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="h-screen flex">
      <Sidebar activeChat={activeChat} onSelectChat={setActiveChat} />
      <ChatWindow activeChat={activeChat} />
    </div>
  );
}
