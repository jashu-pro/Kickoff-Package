import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/Icon';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';

import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/Toast';

export const GlobalSearch = ({ searchState }) => {
  const { searchQuery, setSearchQuery, isSearchFocused, setIsSearchFocused, searchResults, setSearchResults, searchRef } = searchState;
  const { setProjectId, projects } = useProject();
  const navigate = useNavigate();
  const { showToast } = useToast();
  return (
    <>
      {/* Centered Search Bar */}
      <div className="flex-1 flex justify-center px-4 max-w-2xl mx-auto">
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <Icon name="search" size={20} />
            </span>
            <input
              type="text"
              placeholder="Search projects, tasks, team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-slate-100 dark:bg-slate-850 text-on-surface placeholder:text-outline/70 pl-10 pr-9 py-2 rounded-full border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-body-md text-body-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
              {!searchQuery ? (
                <div className="p-3">
                  <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-2">Recent Projects</div>
                  {projects.length > 0 ? (
                    <div className="space-y-1">
                      {projects.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setProjectId(p.id)
                            showToast(`Switched to project: ${p.project_name}`, 'success')
                            setIsSearchFocused(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                        >
                          <Icon name="folder" size={18} className="text-primary" />
                          <div className="truncate">
                            <div className="text-body-md font-medium text-on-surface truncate">{p.project_name}</div>
                            <div className="text-[11px] text-outline truncate">{p.client_name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-body-md text-outline px-3 py-1">No projects found.</div>
                  )}
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {searchResults.projects.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Projects</div>
                      <div className="space-y-0.5">
                        {searchResults.projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setProjectId(p.id)
                              showToast(`Switched to project: ${p.project_name}`, 'success')
                              setIsSearchFocused(false)
                              setSearchQuery('')
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                          >
                            <Icon name="folder" size={18} className="text-primary" />
                            <div className="truncate">
                              <div className="text-body-md font-medium text-on-surface truncate">{p.project_name}</div>
                              <div className="text-[11px] text-outline truncate">{p.client_name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Tasks</div>
                      <div className="space-y-0.5">
                        {searchResults.tasks.map((t) => {
                          const p = projects.find((proj) => proj.id === t.project_id)
                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                if (t.project_id) setProjectId(t.project_id)
                                navigate('/milestones')
                                setIsSearchFocused(false)
                                setSearchQuery('')
                                showToast(`Navigated to task: ${t.title}`, 'success')
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                            >
                              <Icon name="check_circle" size={18} className={t.completed ? "text-status-success" : "text-outline"} />
                              <div className="truncate">
                                <div className="text-body-md font-medium text-on-surface truncate">{t.title}</div>
                                <div className="text-[11px] text-outline truncate">{p ? p.project_name : 'General'}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {searchResults.members.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Team Members</div>
                      <div className="space-y-0.5">
                        {searchResults.members.map((m) => {
                          const p = projects.find((proj) => proj.id === m.project_id)
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                if (m.project_id) setProjectId(m.project_id)
                                navigate('/team')
                                setIsSearchFocused(false)
                                setSearchQuery('')
                                showToast(`Navigated to member: ${m.name}`, 'success')
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                            >
                              <Icon name="person" size={18} className="text-accent-vivid" />
                              <div className="truncate">
                                <div className="text-body-md font-medium text-on-surface truncate">{m.name}</div>
                                <div className="text-[11px] text-outline truncate">{m.role} {p ? `• ${p.project_name}` : ''}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {searchResults.projects.length === 0 &&
                    searchResults.tasks.length === 0 &&
                    searchResults.members.length === 0 && (
                      <div className="p-4 text-center text-outline text-body-md">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </>
  );
};
