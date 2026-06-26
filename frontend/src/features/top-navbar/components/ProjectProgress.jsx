import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/Icon';
import { useProject } from '../../../context/ProjectContext';
import { useAuth } from '../../../context/AuthContext';



export const ProjectProgress = ({ activeProjectStats }) => {
  const { project } = useProject();

  return (
    <>
        {/* Active Project stats display replacing the clock */}
        {project ? (
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-slate-550/20 dark:bg-slate-800/30 rounded-xl border border-border-subtle dark:border-slate-800 mr-2 shrink-0">
            <div className="flex flex-col min-w-0 max-w-[180px]">
              <span className="text-xs font-bold text-on-surface truncate">
                {project.project_name}
              </span>
              <span className="text-[10px] text-outline truncate">
                Client: {project.client_name}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 select-none">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-outline font-medium">
                  {activeProjectStats.remaining} task{activeProjectStats.remaining !== 1 ? 's' : ''} left
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  {activeProjectStats.progress}%
                </span>
              </div>
              <div className="w-24 bg-slate-200 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${activeProjectStats.progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-border-subtle dark:border-slate-800 mr-2 shrink-0 text-[11px] text-outline font-medium">
            <Icon name="folder_open" size={14} />
            No active project selected
          </div>
        )}

    </>
  );
};
