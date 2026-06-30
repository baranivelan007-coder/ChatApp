import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import Chat from '../pages/Chat.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { SocketProvider } from '../context/SocketContext.jsx';

function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 auth-bg">
      <div className="flex gap-2">
        <span className="w-3 h-3 rounded-full bg-white pulse-dot" style={{ animationDelay: '0s' }} />
        <span className="w-3 h-3 rounded-full bg-white pulse-dot" style={{ animationDelay: '0.15s' }} />
        <span className="w-3 h-3 rounded-full bg-white pulse-dot" style={{ animationDelay: '0.3s' }} />
      </div>
      <p className="text-white/80 text-sm font-medium tracking-wide">Loading your chats...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <SocketProvider>{children}</SocketProvider>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}