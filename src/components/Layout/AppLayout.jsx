import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content animate-fade"><Outlet /></div>
      </div>
    </div>
  );
}
