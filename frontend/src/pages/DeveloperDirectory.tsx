import { useState, useRef, useEffect } from 'react';
import { useDataSource } from '../context/DataSourceContext';
import { useTopDevelopers, useDeveloperAiReport, useDeveloperEvidence } from '../api/dashboardService';
import { Spinner } from '../components/ui/Spinner';
import { Sparkles, Activity, GitMerge, AlertTriangle, Users, GitCommit, Clock, Search, ArrowLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { AIReportMarkdown } from '../components/ai/AIReportMarkdown';
import { TimeframeDropdown } from '../components/dashboard/TimeframeDropdown';

export function DeveloperDirectory() {
  const { sourceValue } = useDataSource();
  const { data: developers, isLoading: devsLoading } = useTopDevelopers(sourceValue || '');
  
  const [selectedDev, setSelectedDev] = useState<string | null>(null);
  const [isPrDropdownOpen, setIsPrDropdownOpen] = useState(false);
  const [aiTimeframe, setAiTimeframe] = useState<string>('30_days');
  const [searchQuery, setSearchQuery] = useState('');
  const prDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when changing developer
  useEffect(() => {
    setIsPrDropdownOpen(false);
  }, [selectedDev]);

  // Outside click listener for PR dropdown
  useEffect(() => {
    if (!isPrDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (prDropdownRef.current && !prDropdownRef.current.contains(e.target as Node)) {
        setIsPrDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPrDropdownOpen]);

  const { data: evidence, isLoading: evidenceLoading } = useDeveloperEvidence(
    sourceValue || '', 
    selectedDev || '',
    'lifetime'
  );

  const { data: aiReport, isLoading: reportLoading } = useDeveloperAiReport(
    sourceValue || '', 
    selectedDev || '',
    aiTimeframe
  );

  const filteredDevs = developers?.filter(dev =>
    dev.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statTiles = evidence ? [
    {
      label: 'Pull Requests',
      value: `${evidence.prsMerged}`,
      subValue: `/ ${evidence.prsOpened}`,
      icon: GitMerge,
      accentColor: '#3b82f6',
    },
    {
      label: 'Merge Time',
      value: evidence.avgMergeTime || 'N/A',
      icon: Clock,
      accentColor: '#10b981',
    },
    {
      label: 'CI/CD Health',
      value: `${evidence.workflowSuccesses}`,
      subValue: ` pass / ${evidence.workflowFailures} fail`,
      icon: Activity,
      accentColor: '#818cf8',
    },
    {
      label: 'Opened PRs',
      value: `${evidence.activePrs.length}`,
      subValue: ' active',
      icon: AlertTriangle,
      accentColor: '#f59e0b',
      clickable: evidence.activePrs && evidence.activePrs.length > 0,
      activePrs: evidence.activePrs,
    },
  ] : [];

  // On mobile: show list OR profile, not both
  const showListOnMobile = !selectedDev;

  return (
    <div className="space-y-5">
      {/* Page Header — compact */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
            Developer Directory
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Organization-wide developer activity and AI efficiency insights.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:h-[calc(100vh-180px)]">

        {/* ─── Left Sidebar: Developer List ─── */}
        <div className={`w-full lg:w-[320px] xl:w-[340px] flex flex-col gap-3 shrink-0 ${
          showListOnMobile ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Search */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center px-3 py-2.5">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search contributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2.5 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
              />
            </div>
          </div>

          {/* Sub-header */}
          <div className="flex flex-col gap-1 px-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Users className="w-3 h-3 mr-1.5" />
                Top Contributors
              </span>
              {developers && (
                <span className="text-[10px] text-slate-600 font-medium">{developers.length}</span>
              )}
            </div>
            {!selectedDev && developers && developers.length > 0 && (
              <p className="text-[10px] text-blue-400/70 flex items-center gap-1 animate-pulse">
                <ChevronRight className="w-2.5 h-2.5" />
                Tap a developer to view AI insights
              </p>
            )}
          </div>

          {/* Dev Cards */}
          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-0.5">
            {devsLoading ? (
              <div className="flex justify-center py-10"><Spinner className="w-7 h-7" /></div>
            ) : filteredDevs?.map((dev, devIdx) => (
              <div 
                key={dev.id}
                onClick={() => setSelectedDev(dev.id)}
                className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                  !selectedDev && devIdx === 0 ? 'ring-1 ring-blue-500/20 animate-pulse' : ''
                }`}
                style={{
                  background: selectedDev === dev.id
                    ? 'linear-gradient(135deg, rgba(30,58,138,0.4) 0%, rgba(15,23,42,0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
                  border: selectedDev === dev.id
                    ? '1px solid rgba(59,130,246,0.35)'
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: selectedDev === dev.id
                    ? '0 4px 16px rgba(59,130,246,0.1)'
                    : '0 1px 4px rgba(0,0,0,0.2)',
                }}
              >
                {/* Accent strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl"
                  style={{
                    background: selectedDev === dev.id 
                      ? 'linear-gradient(to bottom, #3b82f6cc, #3b82f622)' 
                      : 'transparent',
                  }}
                />

                <div className="relative z-10 p-3 flex items-center space-x-3">
                  <img 
                    src={`https://github.com/${dev.githubLogin || dev.id}.png`} 
                    alt={dev.id} 
                    className="w-9 h-9 rounded-full bg-slate-800 shrink-0"
                    style={{
                      border: selectedDev === dev.id ? '2px solid rgba(59,130,246,0.4)' : '1.5px solid rgba(255,255,255,0.08)',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.id)}&background=0D8ABC&color=fff`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-white truncate">{dev.id}</h3>
                    <div className="flex items-center text-[10px] text-slate-500 mt-0.5 space-x-2.5">
                      <span className="flex items-center">
                        <GitCommit className="w-2.5 h-2.5 mr-0.5" />
                        {dev.commitCount}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-2.5 h-2.5 mr-0.5" />
                        {new Date(dev.latestCommitDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-all duration-200 ${
                    selectedDev === dev.id ? 'text-blue-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5'
                  }`} />
                </div>
              </div>
            ))}
            {filteredDevs?.length === 0 && (
              <div className="text-slate-500 text-xs text-center py-6">No contributors found.</div>
            )}
          </div>
        </div>

        {/* ─── Right Area: Developer Profile ─── */}
        <div className={`w-full lg:flex-1 flex flex-col min-w-0 ${
          selectedDev ? 'flex' : 'hidden lg:flex'
        }`}>
          {selectedDev ? (
            <div
              className="flex-1 overflow-hidden flex flex-col rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.88) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.25)',
              }}
            >
              {/* Profile Header */}
              {(() => {
                const devInfo = developers?.find(d => d.id === selectedDev);
                return (
                  <div className="p-4 sm:p-5 border-b border-white/5"
                    style={{ background: 'rgba(15,23,42,0.5)' }}
                  >
                    {/* Mobile back button */}
                    <button
                      onClick={() => setSelectedDev(null)}
                      className="lg:hidden flex items-center text-xs text-slate-400 hover:text-white mb-3 cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      Back to contributors
                    </button>

                    <div className="flex items-center space-x-3.5">
                      <img 
                        src={`https://github.com/${devInfo?.githubLogin || selectedDev}.png`} 
                        alt={selectedDev} 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-800 shrink-0"
                        style={{
                          border: '2px solid rgba(59,130,246,0.35)',
                          boxShadow: '0 0 16px rgba(59,130,246,0.1)',
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDev)}&background=0D8ABC&color=fff`;
                        }}
                      />
                      <div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{selectedDev}</h2>
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Developer Profile & Efficiency Analysis</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
                
                {/* KPI Stat Tiles */}
                {evidenceLoading ? (
                   <div className="flex justify-center py-4"><Spinner className="w-6 h-6 text-blue-500" /></div>
                ) : evidence ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {statTiles.map((tile, idx) => {
                      const isOpenedPrTile = !!tile.clickable;
                      const isOpen = isOpenedPrTile && isPrDropdownOpen;

                      return (
                        <div
                          key={idx}
                          ref={isOpenedPrTile ? prDropdownRef : undefined}
                          className={`relative ${isOpen ? 'z-50' : 'z-10'}`}
                        >
                          <div
                            role={isOpenedPrTile ? 'button' : undefined}
                            tabIndex={isOpenedPrTile ? 0 : undefined}
                            aria-expanded={isOpenedPrTile ? isPrDropdownOpen : undefined}
                            aria-label={isOpenedPrTile ? `View ${tile.value} opened pull requests` : undefined}
                            title={isOpenedPrTile ? 'Click to view active pull requests' : undefined}
                            className={`group relative overflow-hidden rounded-xl p-3 flex flex-col justify-between transition-all duration-200 ${
                              isOpenedPrTile
                                ? `cursor-pointer select-none hover:-translate-y-0.5 ${
                                    isOpen
                                      ? 'ring-2 ring-amber-400/90 shadow-[0_4px_24px_rgba(245,158,11,0.3)] bg-slate-900/95'
                                      : 'ring-1 ring-amber-500/35 hover:ring-amber-500/70 shadow-[0_2px_14px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_22px_rgba(245,158,11,0.28)]'
                                  }`
                                : 'hover:-translate-y-0.5'
                            }`}
                            style={{
                              background: isOpenedPrTile && isOpen
                                ? 'linear-gradient(135deg, rgba(20,27,45,0.98) 0%, rgba(30,41,59,0.95) 100%)'
                                : 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
                              border: isOpenedPrTile
                                ? (isOpen ? '1px solid rgba(245,158,11,0.8)' : '1px solid rgba(245,158,11,0.35)')
                                : '1px solid rgba(255,255,255,0.08)',
                              boxShadow: isOpenedPrTile ? undefined : '0 2px 8px rgba(0,0,0,0.25)',
                            }}
                            onClick={() => {
                              if (isOpenedPrTile) {
                                setIsPrDropdownOpen(!isPrDropdownOpen);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (isOpenedPrTile && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                setIsPrDropdownOpen(!isPrDropdownOpen);
                              }
                            }}
                          >
                            {/* Left accent */}
                            <div
                              className="absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-xl pointer-events-none"
                              style={{
                                background: `linear-gradient(to bottom, ${tile.accentColor}dd, ${tile.accentColor}22)`,
                                boxShadow: `2px 0 6px ${tile.accentColor}33`,
                              }}
                            />

                            {/* Subtle hover glow */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"
                              style={{
                                background: `radial-gradient(ellipse 80% 60% at 0% 40%, ${tile.accentColor}12 0%, transparent 70%)`,
                              }}
                            />

                            <div className="pl-1.5 relative z-10">
                              {/* Top row: Label + optional button badge + icon */}
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                    {tile.label}
                                  </span>
                                  {isOpenedPrTile && (
                                    <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded shadow-sm group-hover:bg-amber-500/30 group-hover:border-amber-400/60 transition-colors">
                                      <span>View PRs</span>
                                      <ChevronDown
                                        className={`w-2.5 h-2.5 text-amber-400 transition-transform duration-200 ${
                                          isOpen ? 'rotate-180' : ''
                                        }`}
                                      />
                                    </span>
                                  )}
                                </div>
                                <div
                                  className="flex items-center justify-center w-5 h-5 rounded-md shrink-0"
                                  style={{
                                    backgroundColor: `${tile.accentColor}15`,
                                    border: `1px solid ${tile.accentColor}30`,
                                  }}
                                >
                                  <tile.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: tile.accentColor }} />
                                </div>
                              </div>

                              {/* Bottom row: Value + Subvalue/CTA cue */}
                              <div className="flex items-baseline justify-between gap-1">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-base sm:text-lg font-black text-white tracking-tight">
                                    {tile.value}
                                  </span>
                                  {tile.subValue && (
                                    <span
                                      className={`text-[9px] sm:text-[10px] font-semibold ${
                                        isOpenedPrTile ? 'text-amber-400/90' : 'text-slate-500'
                                      }`}
                                    >
                                      {tile.subValue}
                                    </span>
                                  )}
                                </div>
                                {isOpenedPrTile && (
                                  <span className="text-[9px] font-semibold text-amber-400/90 group-hover:text-amber-300 transition-colors hidden sm:inline-flex items-center gap-0.5">
                                    <span>Browse</span>
                                    <span className="text-[10px] leading-none">▾</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Floating PR Dropdown */}
                          {isOpenedPrTile && isOpen && tile.activePrs && tile.activePrs.length > 0 && (
                            <div
                              className="absolute top-full right-0 mt-1.5 w-72 sm:w-80 z-50 rounded-xl p-1.5 backdrop-blur-xl border border-amber-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.15)] bg-slate-900/98 animate-fade-in"
                            >
                              <div className="px-2.5 py-1.5 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
                                  Active Pull Requests ({tile.activePrs.length})
                                </span>
                                <span className="text-[9.5px] font-semibold text-amber-400/90 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                                  In Review
                                </span>
                              </div>
                              <div className="max-h-60 overflow-y-auto divide-y divide-white/5 py-1 custom-scrollbar">
                                {tile.activePrs.map((pr: any, prIdx: number) => (
                                  <div
                                    key={prIdx}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors group/item"
                                  >
                                    <div className="flex items-center justify-between gap-1.5 mb-1">
                                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                        PR #{prIdx + 1}
                                      </span>
                                      {pr.openTime && (
                                        <span className="text-[9px] font-semibold text-amber-400/90 ml-auto shrink-0">
                                          Opened {pr.openTime}
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className="text-xs text-slate-200 font-medium leading-snug line-clamp-2 group-hover/item:text-white"
                                      title={pr.title}
                                    >
                                      {pr.title}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* AI Efficiency Brief */}
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(15,23,42,0.65)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2.5px] rounded-l-xl"
                    style={{
                      background: 'linear-gradient(to bottom, #818cf8cc, #818cf822)',
                    }}
                  />

                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
                        <h3 className="text-[10px] sm:text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                          Efficiency Brief
                        </h3>
                      </div>
                      <TimeframeDropdown
                        value={aiTimeframe}
                        onChange={setAiTimeframe}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="bg-[#0b1120]/70 p-3 sm:p-4 rounded-xl border border-white/5 min-h-[60px] flex items-start shadow-inner backdrop-blur-sm">
                      {reportLoading ? (
                        <div className="w-full text-center text-blue-400 flex flex-col items-center justify-center py-4 animate-pulse">
                          <Spinner className="w-5 h-5 mb-2" />
                          <span className="text-[11px] sm:text-xs font-medium tracking-wide">Analyzing cross-repo evidence...</span>
                        </div>
                      ) : aiReport ? (
                        <div className="w-full text-slate-300 animate-fade-in">
                          <AIReportMarkdown content={aiReport.report} />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-rose-400">
                          <AlertTriangle className="w-4 h-4" />
                          <p className="text-xs">Failed to generate AI report.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Lifetime Footer */}
                  {(() => {
                    const devInfo = developers?.find(d => d.id === selectedDev);
                    if (!devInfo) return null;
                    return (
                      <div className="px-4 sm:px-5 pb-3.5 pt-0">
                        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:justify-between gap-1.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <GitCommit className="w-3 h-3 text-slate-500" />
                            Lifetime: <strong className="text-white">{devInfo.commitCount}</strong> commits
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Last active: <strong className="text-white">{new Date(devInfo.latestCommitDate).toLocaleDateString()}</strong>
                          </span>
                        </div>
                        {devInfo.latestCommitMessage && (
                          <div
                            className="mt-2 rounded-lg p-2 italic text-[10px] text-slate-400 truncate"
                            style={{
                              background: 'rgba(15,23,42,0.5)',
                              border: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            "{devInfo.latestCommitMessage}"
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State — only visible on desktop */
            <div
              className="flex-1 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.88) 100%)',
                border: '2px dashed rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}
              >
                <Users className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Select a Developer</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Click on any contributor to generate a deep-dive AI efficiency report across all their repositories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
