import React, { useState, useRef, useEffect } from 'react';
import { GitCommit, GitMerge, Users, CheckCircle2, XCircle, GitPullRequest, ChevronDown } from 'lucide-react';

export interface ActivePrItem {
  repoName?: string;
  title: string;
  openTime?: string;
  timestamp?: string;
}

interface KpiProps {
  totalCommits: number;
  totalPrsMerged: number;
  totalIssuesClosed: number;
  totalWorkflowFailures: number;
  activePrCount: number;
  activeDeveloperCount: number;
  isLoading?: boolean;
  activePrs?: ActivePrItem[];
}

interface KpiTileData {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  description: string;
  badge?: {
    text: string;
    variant: 'success' | 'danger' | 'warning' | 'neutral';
  };
  clickable?: boolean;
  activePrs?: ActivePrItem[];
  isDropdownOpen?: boolean;
  onToggleDropdown?: () => void;
}

function KpiTile({
  label,
  value,
  icon: Icon,
  accentColor,
  description,
  badge,
  isLoading,
  clickable,
  activePrs,
  isDropdownOpen,
  onToggleDropdown,
}: KpiTileData & { isLoading?: boolean }) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onToggleDropdown?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, onToggleDropdown]);

  return (
    <div className={`relative ${isDropdownOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef}>
      <div
        onClick={clickable ? onToggleDropdown : undefined}
        className={`group relative overflow-hidden rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-200 ${
          clickable 
            ? 'cursor-pointer hover:-translate-y-0.5 hover:border-amber-500/50 select-none ring-1 ring-amber-500/25 shadow-[0_4px_16px_rgba(245,158,11,0.15)]' 
            : 'hover:-translate-y-0.5'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
          border: clickable && isDropdownOpen 
            ? '1px solid rgba(245,158,11,0.6)' 
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        }}
        title={clickable ? "Click to view all active pull requests" : undefined}
      >
        {/* Left accent strip matching card design */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-xl"
          style={{
            background: `linear-gradient(to bottom, ${accentColor}ee, ${accentColor}33)`,
            boxShadow: `2px 0 8px ${accentColor}44`,
          }}
        />

        {/* Subtle hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 0% 40%, ${accentColor}10 0%, transparent 70%)`,
          }}
        />

        {/* Card Content */}
        <div className="pl-1 relative z-10 flex flex-col justify-between">
          {/* Top row: Label + Chevron + Icon */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[9.5px] sm:text-[10.5px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {label}
              </span>
              {clickable && (
                <ChevronDown className={`w-3 h-3 text-amber-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </div>
            <div
              className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md shrink-0 border"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}30`,
              }}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: accentColor }} />
            </div>
          </div>

          {/* Bottom row: Value + Context badge or description */}
          <div className="flex items-baseline justify-between gap-1.5 mt-1 sm:mt-1.5">
            <span
              className={`text-lg sm:text-2xl font-black text-white tracking-tight ${
                isLoading ? 'opacity-30 animate-pulse' : ''
              }`}
            >
              {isLoading ? '--' : value}
            </span>
            {badge ? (
              <span
                className={`inline-flex items-center text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                  badge.variant === 'success'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : badge.variant === 'danger'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                    : badge.variant === 'warning'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    : 'bg-slate-700/40 text-slate-400 border border-slate-600/30'
                }`}
              >
                {badge.text}
              </span>
            ) : (
              <span className="text-[9.5px] sm:text-[10.5px] font-medium text-slate-500 truncate hidden sm:inline">
                {description}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating PR Dropdown */}
      {clickable && isDropdownOpen && activePrs && activePrs.length > 0 && (
        <div 
          className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 z-50 rounded-xl p-1.5 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.75)] bg-slate-900/98 animate-fade-in"
          style={{
            boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 20px rgba(245,158,11,0.15)'
          }}
        >
          <div className="px-2.5 py-1.5 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
              Active Pull Requests ({activePrs.length})
            </span>
            <span className="text-[9.5px] font-semibold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              In Review
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5 py-1">
            {activePrs.map((pr, idx) => (
              <div key={idx} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  {pr.repoName && (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[150px]">
                      {pr.repoName}
                    </span>
                  )}
                  {pr.openTime && (
                    <span className="text-[9px] font-semibold text-amber-400 ml-auto shrink-0">
                      {pr.openTime}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200 font-medium leading-snug line-clamp-2" title={pr.title}>
                  {pr.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function KpiSummaryRow({
  totalCommits,
  totalPrsMerged,
  totalIssuesClosed,
  totalWorkflowFailures,
  activePrCount,
  activeDeveloperCount,
  isLoading,
  activePrs = [],
}: KpiProps) {
  const [isPrDropdownOpen, setIsPrDropdownOpen] = useState(false);

  // If activePrCount > 1 and we have active PR details, make the tile a dropdown button
  const isPrClickable = activePrCount > 1 && activePrs.length > 0;

  const tiles: KpiTileData[] = [
    {
      label: 'Commits',
      value: totalCommits.toLocaleString(),
      icon: GitCommit,
      accentColor: '#3b82f6', // blue
      description: 'Total commits',
    },
    {
      label: 'PRs Merged',
      value: totalPrsMerged.toLocaleString(),
      icon: GitMerge,
      accentColor: '#10b981', // emerald
      description: 'Merged PRs',
      badge: totalPrsMerged > 0 ? { text: 'Shipped', variant: 'success' } : undefined,
    },
    {
      label: 'Active PRs',
      value: activePrCount.toLocaleString(),
      icon: GitPullRequest,
      accentColor: '#f59e0b', // amber
      description: 'Open PRs',
      badge: activePrCount > 0 ? { text: `${activePrCount} In Review`, variant: 'warning' } : undefined,
      clickable: isPrClickable,
      activePrs: activePrs,
      isDropdownOpen: isPrDropdownOpen,
      onToggleDropdown: () => setIsPrDropdownOpen(prev => !prev),
    },
    {
      label: 'Issues Closed',
      value: totalIssuesClosed.toLocaleString(),
      icon: CheckCircle2,
      accentColor: '#14b8a6', // teal
      description: 'Resolved issues',
    },
    {
      label: 'CI/CD Failures',
      value: totalWorkflowFailures.toLocaleString(),
      icon: totalWorkflowFailures > 0 ? XCircle : CheckCircle2,
      accentColor: totalWorkflowFailures > 0 ? '#f43f5e' : '#10b981', // rose or emerald
      description: 'Workflow status',
      badge:
        totalWorkflowFailures === 0
          ? { text: 'Passing ✓', variant: 'success' }
          : { text: `${totalWorkflowFailures} Failed`, variant: 'danger' },
    },
    {
      label: 'Active Devs',
      value: activeDeveloperCount.toLocaleString(),
      icon: Users,
      accentColor: '#818cf8', // indigo
      description: 'Contributors',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-3.5">
      {tiles.map((tile, idx) => (
        <KpiTile key={idx} {...tile} isLoading={isLoading} />
      ))}
    </div>
  );
}
