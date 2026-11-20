import { useState, useEffect } from 'react';
import { useDataSource } from '../context/DataSourceContext';
import { CheckCircle2, Sparkles, RefreshCw, Briefcase, CheckSquare, AlertTriangle, GitPullRequest, GitCommit } from 'lucide-react';

import { useOrganizationSummary, useGenerateOrgSummary, useOrganizationEvidence, useTopDevelopers, type EvidenceItem } from '../api/dashboardService';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from '../components/ui/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { AIReportMarkdown } from '../components/ai/AIReportMarkdown';
import { KpiSummaryRow } from '../components/dashboard/KpiSummaryRow';
import { TimeframeDropdown } from '../components/dashboard/TimeframeDropdown';
import { DashboardLoadingSkeleton, SyncStatusBanner } from '../components/dashboard/DashboardLoadingSkeleton';

const RepoMessageContent = ({ item }: { item: EvidenceItem | string }) => {
  const content = typeof item === 'string' ? item : item.text;
  const timestamp = typeof item === 'string' ? null : item.timestamp;
  
  const match = content.match(/^([^:]+):\s(.*)$/);
  
  const timeDisplay = timestamp ? (
    <span className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5 md:mt-0 ml-0 md:ml-auto shrink-0 pt-0.5">
      {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
    </span>
  ) : null;

  if (match) {
    const repo = match[1];
    const message = match[2];
    return (
      <div className="flex flex-col md:flex-row md:items-start md:justify-between w-full min-w-0 overflow-hidden gap-1 md:gap-4 flex-1">
        <div className="flex flex-col items-start gap-1 w-full min-w-0 overflow-hidden">
          <span className="text-xs text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded leading-none mt-0.5 border border-slate-700/50">
            {repo}
          </span>
          <span className="text-slate-200 text-xs sm:text-sm leading-snug break-words">{message}</span>
        </div>
        {timeDisplay}
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between w-full min-w-0 overflow-hidden gap-1 md:gap-4 flex-1">
      <span className="pt-0.5 text-slate-200 text-xs sm:text-sm break-words">{content}</span>
      {timeDisplay}
    </div>
  );
};

export function Dashboard() {
  const { sourceValue } = useDataSource();
  const [timeframe, setTimeframe] = useState('30_days');
  const [showZeroesOverride, setShowZeroesOverride] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: orgSummary, isLoading: summaryLoading, refetch: refetchSummary } = useOrganizationSummary(sourceValue || '', timeframe);
  const { data: orgEvidence, isLoading: evidenceLoading } = useOrganizationEvidence(sourceValue || '', timeframe);
  const { data: developers } = useTopDevelopers(sourceValue || '');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const { mutate: generateSummary, isPending: generating } = useGenerateOrgSummary();

  // Reset override whenever source org or timeframe changes
  useEffect(() => {
    setShowZeroesOverride(false);
  }, [sourceValue, timeframe]);

  const isSyncing = orgEvidence?.isSyncing ?? false;

  // An organization has zero data if all primary metrics are 0 (indicates it has not finished/started syncing)
  const hasZeroData = orgEvidence !== undefined && 
    orgEvidence.totalCommits === 0 && 
    orgEvidence.activePrCount === 0 && 
    orgEvidence.totalPrsMerged === 0 &&
    orgEvidence.totalIssuesClosed === 0;

  // Show skeleton if:
  // 1) Initial HTTP request is loading
  // 2) Backend reports sync is in progress AND no metrics have been saved yet
  const isInitialSync = !showZeroesOverride && (evidenceLoading || (isSyncing && hasZeroData));

  const handleGenerate = () => {
    if (isSyncing) return;
    setGenerateError(null);
    generateSummary({ owner: sourceValue || '', timeframe }, {
      onSuccess: () => {
        refetchSummary();
        queryClient.invalidateQueries({ queryKey: ['orgEvidence'] });
        queryClient.invalidateQueries({ queryKey: ['topDevelopers'] });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.error || err?.message || 'Failed to generate briefing';
        setGenerateError(message);
      }
    });
  };

  // Extract open PRs list for the Active PRs dropdown button in KPI row
  const activePrsList = (orgEvidence?.activeWorkstreams || [])
    .filter(item => {
      const text = typeof item === 'string' ? item : item.text;
      return text.startsWith('[PR]');
    })
    .map(item => {
      const text = typeof item === 'string' ? item : item.text;
      const timestamp = typeof item === 'string' ? undefined : item.timestamp;
      const clean = text.replace(/^\[PR\]\s*/i, '');
      const match = clean.match(/^([^:]+):\s*(.*)$/);
      let openTime = '';
      if (timestamp) {
        try {
          openTime = formatDistanceToNow(new Date(timestamp), { addSuffix: false });
        } catch (e) {}
      }
      return {
        repoName: match ? match[1] : undefined,
        title: match ? match[2] : clean,
        openTime: openTime ? `${openTime} open` : undefined,
        timestamp
      };
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
            Organization Overview
          </span>
        </div>

        {/* Name and Timeframe Dropdown */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate min-w-0">
            {sourceValue}
          </h1>
          <TimeframeDropdown 
            value={timeframe}
            onChange={setTimeframe}
          />
        </div>
      </div>

      {isInitialSync ? (
        <DashboardLoadingSkeleton 
          orgName={sourceValue || ''} 
          onShowRawMetrics={() => setShowZeroesOverride(true)}
        />
      ) : (
        <>
          {/* Active Background Sync Banner if data exists but sync is still underway */}
          {isSyncing && (
            <SyncStatusBanner orgName={sourceValue || ''} />
          )}

          {/* KPI Hero Section */}
          <section>
            <KpiSummaryRow 
              totalCommits={orgEvidence?.totalCommits ?? 0}
              totalPrsMerged={orgEvidence?.totalPrsMerged ?? 0}
              totalIssuesClosed={orgEvidence?.totalIssuesClosed ?? 0}
              totalWorkflowFailures={orgEvidence?.totalWorkflowFailures ?? 0}
              activePrCount={orgEvidence?.activePrCount ?? 0}
              activeDeveloperCount={developers?.length ?? 0}
              isLoading={evidenceLoading}
              activePrs={activePrsList}
            />
          </section>

          {/* Level 1: AI Organization Dashboard */}
          <section>
            <div 
              className="relative rounded-2xl overflow-hidden mt-1"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.88) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.25)',
              }}
            >
              <div className="p-3.5 sm:p-5 md:p-6 relative z-10">
                {/* Briefing Header & Action */}
                <div className="flex items-center justify-between mb-4 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
                        AI Executive Briefing
                      </h2>
                    </div>
                    {orgSummary?.generatedAt && (
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 pl-6">
                        Generated: {new Date(orgSummary.generatedAt).toLocaleDateString()} {new Date(orgSummary.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={generating || isSyncing}
                    title={isSyncing ? "Syncing data from GitHub in background... Briefing can be generated once sync completes." : undefined}
                    className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center transition-all duration-300 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-[0.5px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    {generating ? (
                      <>
                        <Spinner className="w-3.5 h-3.5 mr-1.5" />
                        <span>Generating...</span>
                      </>
                    ) : isSyncing ? (
                      <>
                        <Spinner className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
                        <span>Syncing Repos...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        <span>Generate Briefing</span>
                      </>
                    )}
                  </button>
                </div>

            {generateError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-xs sm:text-sm flex items-center justify-between">
                <span>{generateError}</span>
                <button onClick={() => setGenerateError(null)} className="text-red-400 hover:text-red-200 font-bold ml-2 cursor-pointer">✕</button>
              </div>
            )}

            {/* Briefing Text Container */}
            <div className="bg-[#0b1120]/70 p-3 sm:p-4 rounded-xl border border-white/5 min-h-[70px] flex items-start mb-4 shadow-inner backdrop-blur-sm transition-all duration-300">
              {summaryLoading ? (
                <div className="w-full text-center text-blue-400 flex flex-col items-center justify-center py-5 animate-pulse">
                  <Spinner className="w-6 h-6 mb-2.5" /> 
                  <span className="text-xs sm:text-sm font-medium tracking-wide">Analyzing organization data...</span>
                </div>
              ) : orgSummary ? (
                <div className="w-full text-slate-300 animate-fade-in">
                  <AIReportMarkdown content={orgSummary.summaryText} />
                </div>
              ) : hasZeroData ? (
                <p className="text-slate-400 text-xs sm:text-sm text-center w-full py-1.5 leading-relaxed">
                  No activity detected for {timeframe.replace('_', ' ')}. Switch timeframe in the top-right (e.g. <strong>"Lifetime"</strong>) to view your all-time commits and analytics.
                </p>
              ) : (
                <p className="text-slate-400 text-xs sm:text-sm italic text-center w-full py-1.5">
                  No briefing generated yet for this timeframe. Click "Generate Briefing" to run the AI summary task.
                </p>
              )}
            </div>

            {/* Deterministic Organization Evidence */}
            {evidenceLoading ? (
               <div className="flex justify-center py-4"><Spinner className="w-6 h-6 text-blue-500" /></div>
            ) : orgEvidence ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                
                {/* Active Work */}
                <div 
                  className="group relative rounded-xl p-4 sm:p-5 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                    style={{
                      background: 'linear-gradient(to bottom, #3b82f6dd, #3b82f644)',
                      boxShadow: '3px 0 14px rgba(59,130,246,0.3)',
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 40%, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center">
                        <Briefcase className="w-3.5 h-3.5 mr-2" /> Active Work
                      </h3>
                      <span className="text-[9px] font-semibold text-blue-400/90 bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.5 rounded">
                        Open PRs & Commits
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mb-3">Work currently underway or awaiting review</p>
                    <ul className="space-y-2.5">
                      {orgEvidence.activeWorkstreams.length > 0 ? orgEvidence.activeWorkstreams.map((item, i) => {
                        const text = typeof item === 'string' ? item : item.text;
                        const isPR = text.startsWith('[PR]');
                        const isCommit = text.startsWith('[Commit]');
                        const contentStr = text.replace(/^\[(?:PR|Commit)\]\s*/i, '');
                        const itemProp = typeof item === 'string' ? contentStr : { text: contentStr, timestamp: item.timestamp };
                        return (
                          <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2 w-full">
                            {isPR ? (
                              <div 
                                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-violet-500/15 text-violet-400 shrink-0 mt-0.5 cursor-help" 
                                style={{ border: '1px solid rgba(139,92,246,0.2)' }}
                                title="Open Pull Request in progress"
                              >
                                <GitPullRequest className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </div>
                            ) : isCommit ? (
                              <div 
                                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-blue-500/15 text-blue-400 shrink-0 mt-0.5 cursor-help" 
                                style={{ border: '1px solid rgba(59,130,246,0.2)' }}
                                title="Recent Commit"
                              >
                                <GitCommit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </div>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            )}
                            <RepoMessageContent item={itemProp} />
                          </li>
                        );
                      }) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}>
                            <Briefcase className="w-4 h-4 text-blue-400/50" />
                          </div>
                          <p className="text-slate-500 text-[11px]">No active workstreams detected.</p>
                        </div>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Recently Completed */}
                <div 
                  className="group relative rounded-xl p-4 sm:p-5 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                    style={{
                      background: 'linear-gradient(to bottom, #10b981dd, #10b98144)',
                      boxShadow: '3px 0 14px rgba(16,185,129,0.3)',
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 0% 40%, rgba(16,185,129,0.08) 0%, transparent 70%)' }}
                  />
                  <div className="relative z-10">
                    <h3 className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3.5 flex items-center">
                      <CheckSquare className="w-3.5 h-3.5 mr-2" /> Recently Completed
                    </h3>
                    <ul className="space-y-2.5">
                      {orgEvidence.recentlyCompleted.length > 0 ? orgEvidence.recentlyCompleted.map((rc, i) => (
                        <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2 w-full">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <RepoMessageContent item={rc} />
                        </li>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)' }}>
                            <CheckSquare className="w-4 h-4 text-emerald-400/50" />
                          </div>
                          <p className="text-slate-500 text-[11px]">No PRs merged in this period.</p>
                        </div>
                      )}
                    </ul>
                  </div>
                  <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex justify-between text-[10px] text-slate-400">
                    <span>PRs Merged: <strong className="text-emerald-400">{orgEvidence.totalPrsMerged}</strong></span>
                    <span>Issues Closed: <strong className="text-teal-400">{orgEvidence.totalIssuesClosed}</strong></span>
                  </div>
                </div>

                {/* Needs Attention */}
                <div 
                  className="group relative rounded-xl p-4 sm:p-5 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
                    border: `1px solid ${orgEvidence.totalWorkflowFailures > 0 ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                    style={{
                      background: orgEvidence.totalWorkflowFailures > 0
                        ? 'linear-gradient(to bottom, #f43f5edd, #f43f5e44)'
                        : 'linear-gradient(to bottom, #10b981dd, #10b98144)',
                      boxShadow: orgEvidence.totalWorkflowFailures > 0
                        ? '3px 0 14px rgba(244,63,94,0.3)'
                        : '3px 0 14px rgba(16,185,129,0.3)',
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"
                    style={{
                      background: orgEvidence.totalWorkflowFailures > 0
                        ? 'radial-gradient(ellipse 80% 60% at 0% 40%, rgba(244,63,94,0.08) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse 80% 60% at 0% 40%, rgba(16,185,129,0.08) 0%, transparent 70%)',
                    }}
                  />
                  <div className="relative z-10">
                    <h3 className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3.5 flex items-center ${orgEvidence.totalWorkflowFailures > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Needs Attention
                    </h3>
                    <ul className="space-y-2.5">
                      {orgEvidence.needsAttention.length > 0 ? orgEvidence.needsAttention.map((na, i) => (
                        <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2 w-full">
                          <div className="w-5 h-5 flex items-center justify-center rounded bg-rose-500/15 text-rose-400 shrink-0 mt-0.5" style={{ border: '1px solid rgba(244,63,94,0.2)' }}>
                            <AlertTriangle className="w-3 h-3" />
                          </div>
                          <RepoMessageContent item={na} />
                        </li>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)' }}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400/50" />
                          </div>
                          <p className="text-emerald-400/60 text-[11px] font-medium">All clear! No issues detected.</p>
                        </div>
                      )}
                    </ul>
                  </div>
                  <div className="relative z-10 mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-400">
                    CI/CD Failures: <strong className={orgEvidence.totalWorkflowFailures > 0 ? 'text-rose-400' : 'text-emerald-400'}>{orgEvidence.totalWorkflowFailures}</strong>
                  </div>
                </div>

              </div>
            ) : null}

          </div>
        </div>
      </section>
    </>
  )}
</div>
  );
}
