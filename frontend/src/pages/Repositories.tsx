import { useNavigate } from 'react-router-dom';
import { useRepos } from '../api/queries';
import { Badge } from '../components/ui/Badge';
import { LanguageBadge, getLanguageColor } from '../components/common/LanguageBadge';
import { Spinner } from '../components/ui/Spinner';
import { BookOpen, Star, ChevronRight, Search, FolderGit2 } from 'lucide-react';
import { useState } from 'react';
import type { Repo } from '../types';

export function Repositories() {
  const { data: repos, isLoading } = useRepos();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRepos = repos?.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Page Header — matches Dashboard style */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        <div className="flex items-center space-x-2">
          <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">
            Repositories
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          A complete list of repositories for the current organization.
        </p>
      </div>

      {/* Search + Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div
          className="flex-1 rounded-xl overflow-hidden max-w-md"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.85) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center px-3 py-2.5">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-2.5 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none w-full"
            />
          </div>
        </div>
        {repos && (
          <span className="text-[10px] text-slate-500 font-medium">
            {filteredRepos?.length ?? 0} of {repos.length} repositories
          </span>
        )}
      </div>

      {/* Repository Cards Grid — unified card layout for all breakpoints */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : filteredRepos && filteredRepos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredRepos.map((repo) => {
            const accentColor = getLanguageColor(repo.language);
            return (
              <div
                key={repo.name}
                onClick={() => navigate(`/repositories/${repo.name}`)}
                className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.88) 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.40), 0 1px 4px rgba(0,0,0,0.25)',
                }}
              >
                {/* Language-colored left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                  style={{
                    background: `linear-gradient(to bottom, ${accentColor}dd, ${accentColor}44)`,
                    boxShadow: `3px 0 14px ${accentColor}55`,
                  }}
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 0% 40%, ${accentColor}12 0%, transparent 70%)`,
                  }}
                />

                {/* Card content */}
                <div className="pl-4 pr-3.5 pt-3.5 pb-3 relative z-10">
                  {/* Top row: name + visibility badge + arrow */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        style={{ color: accentColor }}
                      />
                      <span className="font-semibold text-white text-[13px] leading-snug truncate">
                        {repo.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={repo.visibility === 'public' ? 'success' : 'secondary'}
                        className="text-[10px] px-1.5 py-0.5"
                      >
                        {repo.visibility}
                      </Badge>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </div>

                  {/* Description */}
                  {repo.description && (
                    <p className="text-[11.5px] text-slate-400 line-clamp-2 leading-relaxed mt-2 pr-1">
                      {repo.description}
                    </p>
                  )}

                  {/* Footer: language + stars + date */}
                  <div
                    className="flex items-center gap-3 mt-3 pt-2.5"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {repo.language ? (
                      <LanguageBadge language={repo.language} />
                    ) : (
                      <span className="text-[11px] text-slate-600 italic">
                        No language
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Star className="w-3 h-3 text-amber-400" />
                      {repo.stargazersCount ?? 0}
                    </span>

                    <span className="ml-auto text-[11px] text-slate-500 tabular-nums">
                      {new Date(repo.updatedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-2xl flex flex-col items-center justify-center p-8 text-center"
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
            <FolderGit2 className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Repositories Found</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            {searchQuery ? 'No repositories match your search. Try a different query.' : 'No repositories available for this organization.'}
          </p>
        </div>
      )}
    </div>
  );
}
