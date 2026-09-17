import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDataSource } from '../context/DataSourceContext';
import { LogOut, RefreshCw, X, AlertTriangle, Menu } from 'lucide-react';

// Reusable confirmation modal
function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmStyle,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmStyle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      />
      {/* Modal */}
      <div
        className="relative w-full max-w-sm mx-4 p-6 rounded-2xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>

        <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${confirmStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const { sourceValue, clearDataSource } = useDataSource();

  const [showSourceConfirm, setShowSourceConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmSwitch = () => {
    clearDataSource();
    window.location.href = '/data-source-selection';
  };

  const handleConfirmLogout = () => {
    logout();
  };

  return (
    <>
      <header
        className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between px-3 sm:px-6"
        style={{
          background: 'rgba(13,17,23,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Left: hamburger (mobile) + Org selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-200 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {sourceValue && (
            <button
              onClick={() => setShowSourceConfirm(true)}
              title="Click to switch organization or data source"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-200 group hover:border-indigo-500/40 min-w-0 shrink"
              style={{
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.18)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: '#6366f1',
                  boxShadow: '0 0 6px rgba(99,102,241,0.8)',
                }}
              />
              <span className="font-semibold text-slate-200 truncate max-w-[100px] sm:max-w-[180px] md:max-w-xs">{sourceValue}</span>
              <span className="text-slate-500 text-xs border-l border-slate-700/60 pl-1.5 sm:pl-2 group-hover:text-indigo-400 transition-colors flex items-center gap-1 shrink-0">
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Change Source</span>
              </span>
            </button>
          )}
        </div>

        {/* Right: User + logout */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
            <span className="text-sm text-slate-400 hidden md:block">{user.name || user.login}</span>
            <img
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
              style={{ boxShadow: '0 0 0 2px rgba(99,102,241,0.4)' }}
              src={user.avatarUrl}
              alt={user.name || user.login}
            />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Log out"
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      {/* Change Source Confirm */}
      {showSourceConfirm && (
        <ConfirmModal
          title="Switch Data Source?"
          message={`You're currently viewing "${sourceValue}". Switching will take you back to the source selection screen. Your saved data won't be lost.`}
          confirmLabel="Yes, Switch Source"
          confirmStyle="bg-indigo-600 hover:bg-indigo-500"
          onConfirm={handleConfirmSwitch}
          onCancel={() => setShowSourceConfirm(false)}
        />
      )}

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <ConfirmModal
          title="Log Out?"
          message="You'll be signed out of your GitHub session and taken back to the login screen."
          confirmLabel="Yes, Log Out"
          confirmStyle="bg-red-600 hover:bg-red-500"
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
