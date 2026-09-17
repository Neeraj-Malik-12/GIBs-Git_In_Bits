import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  GitCommit,
  Sparkles,
  GitPullRequest,
  Activity,
  Users,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  CheckSquare
} from 'lucide-react';

interface DashboardLoadingSkeletonProps {
  orgName?: string;
  isBannerOnly?: boolean;
  onShowRawMetrics?: () => void;
}

const LOADING_MESSAGES = [
  { text: "Getting your repos...", icon: FolderGit2, tip: "Discovering repositories across organization" },
  { text: "Traversing your commits...", icon: GitCommit, tip: "Analyzing commit frequency & distribution" },
  { text: "Hmm.. someone is quite consistent ✨", icon: Sparkles, tip: "Evaluating contribution cadence & streak" },
  { text: "Fetching pull requests & code reviews...", icon: GitPullRequest, tip: "Mapping open PRs and reviewer feedback" },
  { text: "Checking CI/CD pipeline health...", icon: Activity, tip: "Analyzing workflow run conclusions & pass rates" },
  { text: "Mapping contributor network...", icon: Users, tip: "Identifying active authors and maintainers" },
  { text: "Synthesizing executive intelligence...", icon: Cpu, tip: "Preparing deterministic briefing models" },
];

export const SyncStatusBanner: React.FC<{ orgName?: string }> = ({ orgName }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setFadeState('in');
      }, 250);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const current = LOADING_MESSAGES[messageIndex];
  const IconComponent = current.icon;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 100%)',
        border: '1px solid rgba(59,130,246,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 24px rgba(59,130,246,0.12)',
      }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left side: Animated Icon + Text */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)',
              borderColor: 'rgba(59,130,246,0.4)',
              boxShadow: '0 0 16px rgba(59,130,246,0.25)'
            }}
          >
            <div className="animate-spin-slow absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <IconComponent className="w-5 h-5 text-blue-400 transition-transform duration-300 transform scale-105" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={`text-sm sm:text-base font-bold text-white tracking-tight transition-all duration-300 ${fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                  }`}
              >
                {current.text}
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              {orgName ? <span className="font-semibold text-blue-400 mr-1">{orgName}:</span> : null}
              {current.tip}
            </p>
          </div>
        </div>

        {/* Right side: Live Syncing Pill */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <span
            className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm"
            style={{
              background: 'rgba(59,130,246,0.12)',
              borderColor: 'rgba(59,130,246,0.3)',
              color: '#93c5fd'
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Sync in progress
          </span>
        </div>
      </div>

      {/* Progress sliding line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-800/80 overflow-hidden">
        <div
          className="h-full w-1/3 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent)',
            animation: 'shimmer-wave 1.8s ease-in-out infinite'
          }}
        />
      </div>
    </div>
  );
};

export function DashboardLoadingSkeleton({ orgName, isBannerOnly, onShowRawMetrics }: DashboardLoadingSkeletonProps) {
  if (isBannerOnly) {
    return <SyncStatusBanner orgName={orgName} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Active Sync Status Banner */}
      <SyncStatusBanner orgName={orgName} />

      {/* KPI Tiles Skeleton (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {[
          { label: 'Commits', color: '#3b82f6' },
          { label: 'PRs Merged', color: '#10b981' },
          { label: 'Active PRs', color: '#f59e0b' },
          { label: 'Issues Closed', color: '#06b6d4' },
          { label: 'CI/CD Failures', color: '#10b981' },
          { label: 'Active Devs', color: '#8b5cf6' },
        ].map((tile, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Accent strip */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-xl opacity-60"
              style={{
                background: `linear-gradient(to bottom, ${tile.color}ee, ${tile.color}33)`,
              }}
            />

            <div className="pl-1 flex flex-col justify-between h-full">
              {/* Top row */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9.5px] sm:text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  {tile.label}
                </span>
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border shrink-0 animate-pulse"
                  style={{
                    backgroundColor: `${tile.color}15`,
                    borderColor: `${tile.color}25`,
                  }}
                />
              </div>

              {/* Bottom row */}
              <div className="flex items-baseline justify-between gap-1.5 mt-2 sm:mt-2.5">
                <div className="h-6 sm:h-7 w-12 bg-slate-700/50 rounded animate-pulse" />
                <div className="h-3 w-10 bg-slate-800/80 rounded animate-pulse hidden sm:block" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Briefing Skeleton */}
      <div
        className="relative rounded-2xl overflow-hidden mt-1 p-3.5 sm:p-5 md:p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.88) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400/60 animate-pulse" />
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-300">
              AI Executive Briefing
            </h2>
          </div>
          <div className="h-8 w-32 bg-slate-800/80 rounded-lg border border-white/5 animate-pulse" />
        </div>

        {/* Briefing text simulated lines */}
        <div className="bg-[#0b1120]/70 p-4 sm:p-5 rounded-xl border border-white/5 space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 bg-blue-500/20 rounded animate-pulse" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 w-11/12 bg-slate-700/40 rounded animate-pulse" />
            <div className="h-3 w-4/5 bg-slate-700/30 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-slate-700/30 rounded animate-pulse" />
          </div>
          <div className="pt-2 flex items-center gap-2">
            <div className="h-4 w-32 bg-emerald-500/20 rounded animate-pulse" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-3 w-5/6 bg-slate-700/40 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-slate-700/30 rounded animate-pulse" />
          </div>
        </div>

        {/* 3 Columns Evidence Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Column 1: Active Work */}
          <div
            className="rounded-xl p-4 sm:p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl bg-blue-500/40" />
            <h3 className="text-[10px] sm:text-xs font-bold text-blue-400/70 uppercase tracking-widest mb-3.5 flex items-center">
              <Briefcase className="w-3.5 h-3.5 mr-2" /> Active Work
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-violet-500/10 border border-violet-500/20 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
                    <div className="h-2.5 w-full bg-slate-700/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Recently Completed */}
          <div
            className="rounded-xl p-4 sm:p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl bg-emerald-500/40" />
            <h3 className="text-[10px] sm:text-xs font-bold text-emerald-400/70 uppercase tracking-widest mb-3.5 flex items-center">
              <CheckSquare className="w-3.5 h-3.5 mr-2" /> Recently Completed
            </h3>
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
                    <div className="h-2.5 w-4/5 bg-slate-700/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Needs Attention */}
          <div
            className="rounded-xl p-4 sm:p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl bg-rose-500/40" />
            <h3 className="text-[10px] sm:text-xs font-bold text-rose-400/70 uppercase tracking-widest mb-3.5 flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Needs Attention
            </h3>
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-rose-500/10 border border-rose-500/20 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
                    <div className="h-2.5 w-3/4 bg-slate-700/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {onShowRawMetrics && (
        <div className="flex justify-center pt-1">
          <button
            onClick={onShowRawMetrics}
            className="text-[11.5px] text-slate-500 hover:text-slate-300 transition-colors underline cursor-pointer py-1 px-3 rounded"
          >
            Organization appears empty? Click to view raw zeroes dashboard anyway
          </button>
        </div>
      )}
    </div>
  );
}
