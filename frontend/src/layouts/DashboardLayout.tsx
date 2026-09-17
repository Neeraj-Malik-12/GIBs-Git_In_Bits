import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useDataSource } from '../context/DataSourceContext';
import { AiManagerChat } from '../components/ai/AiManagerChat';

export function DashboardLayout() {
  const { sourceType } = useDataSource();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!sourceType) {
    return <Navigate to="/data-source-selection" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Mobile backdrop — only visible when drawer is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto focus:outline-none p-3 sm:p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <AiManagerChat />
    </div>
  );
}
