import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, GitBranch, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Repositories', href: '/repositories', icon: BookOpen },
  { name: 'Developers', href: '/developers', icon: Users },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* ─── MOBILE: fixed drawer (slides in/out) ─── */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col w-64 transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'linear-gradient(180deg, #0d1117 0%, #0f172a 60%, #0d1b2a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent onNavClick={onClose} showCloseButton onClose={onClose} />
      </div>

      {/* ─── TABLET (md–lg): icon-only rail ─── */}
      <div
        className="hidden md:flex lg:hidden flex-col w-16 shrink-0"
        style={{
          background: 'linear-gradient(180deg, #0d1117 0%, #0f172a 60%, #0d1b2a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent iconOnly />
      </div>

      {/* ─── DESKTOP (lg+): full sidebar ─── */}
      <div
        className="hidden lg:flex flex-col w-64 shrink-0"
        style={{
          background: 'linear-gradient(180deg, #0d1117 0%, #0f172a 60%, #0d1b2a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent({
  iconOnly = false,
  showCloseButton = false,
  onClose,
  onNavClick,
}: {
  iconOnly?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex flex-col h-full relative">
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }}
      />

      {/* Logo */}
      <div
        className={cn('flex h-16 shrink-0 items-center', iconOnly ? 'justify-center px-2' : 'px-5')}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          className="relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 20px rgba(99,102,241,0.45), 0 0 40px rgba(99,102,241,0.15)',
          }}
        >
          <GitBranch className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        {!iconOnly && (
          <div className="ml-3 flex-1 min-w-0">
            <div className="text-base font-bold text-white tracking-tight leading-none">Git in Bits</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: 'rgba(129,140,248,0.7)' }}>
              Analytics
            </div>
          </div>
        )}
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className={cn('flex flex-1 flex-col overflow-y-auto pt-6 pb-4', iconOnly ? 'px-2' : 'px-3')}>
        {!iconOnly && (
          <div
            className="text-[10px] font-bold tracking-widest uppercase px-3 mb-3"
            style={{ color: 'rgba(148,163,184,0.35)' }}
          >
            Exploration
          </div>
        )}

        <nav className="space-y-0.5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              title={iconOnly ? item.name : undefined}
              onClick={onNavClick}
            >
              {({ isActive }) => (
                <div
                  className={cn(
                    'group relative flex items-center transition-all duration-200 cursor-pointer rounded-xl',
                    iconOnly ? 'justify-center p-3' : 'px-3 py-2.5',
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  )}
                >
                  {/* Active background */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.08))',
                        border: '1px solid rgba(99,102,241,0.22)',
                      }}
                    />
                  )}
                  {/* Hover background (inactive) */}
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    />
                  )}
                  {/* Left accent bar (active, full sidebar only) */}
                  {isActive && !iconOnly && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 0 8px rgba(99,102,241,0.9)',
                      }}
                    />
                  )}

                  <item.icon
                    className={cn(
                      'shrink-0 relative z-10 transition-colors duration-200',
                      iconOnly ? 'h-5 w-5' : 'h-4 w-4 mr-3',
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  {!iconOnly && (
                    <span className="relative z-10 text-sm font-medium">{item.name}</span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
