import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';

export const Step5Milestones = ({ formState }) => {
  const {
    formData, milestones, showAddMilestoneInline, setShowAddMilestoneInline, msTitle, setMsTitle, msDesc, setMsDesc, msStart, setMsStart, msEnd, setMsEnd, handleAddMilestoneSubmit, handleDeleteMilestone, risks, setRisks, setDbError
  } = formState;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 5: Timeline & Milestones</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Plot scheduled deliverables for the project</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddMilestoneInline(!showAddMilestoneInline)
            setDbError(null)
          }}
          className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Icon name="add" size={16} /> Add Milestone
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-border-subtle shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="play_arrow" size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant">Project Start</p>
            <p className="font-bold text-on-surface">{formData.startDate || 'Not Set'}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-border-subtle shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center text-status-success">
            <Icon name="flag" size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-on-surface-variant">Project End</p>
            <p className="font-bold text-on-surface">{formData.endDate || 'Not Set'}</p>
          </div>
        </div>
      </div>

      {/* Milestones list */}
      <div className="space-y-3">
        {milestones.length === 0 && !showAddMilestoneInline && (
          <div className="py-8 text-center border border-dashed border-border-subtle rounded-xl text-on-surface-variant">
            <Icon name="calendar_month" size={32} className="opacity-50 mx-auto mb-2" />
            <p className="text-sm font-medium">No custom milestones added</p>
            <p className="text-xs opacity-70">Click 'Add Milestone' to map out delivery phases.</p>
          </div>
        )}
        
        {milestones.map((m, idx) => (
          <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 shadow-sm relative">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-on-surface text-sm">{m.title}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">{m.description || 'No description provided.'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteMilestone(m.id, idx)}
                className="text-outline hover:bg-status-error/10 hover:text-status-error p-1.5 rounded-md transition-all"
              >
                <Icon name="delete" size={16} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border-subtle text-xs text-on-surface-variant font-medium">
              <span className="flex items-center gap-1"><Icon name="calendar_today" size={14} /> Start: {m.start_date || 'Project Start'}</span>
              <span className="flex items-center gap-1"><Icon name="event" size={14} /> End: {m.end_date || 'Project Start'}</span>
              <span className="flex items-center gap-1 capitalize">
                <span className={`w-2 h-2 rounded-full ${m.status === 'in_progress' ? 'bg-primary' : m.status === 'completed' ? 'bg-status-success' : 'bg-outline-variant'}`} />
                Status: {m.status || 'pending'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showAddMilestoneInline && (
        <div className="p-5 bg-surface-container-lowest border border-border-subtle rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-300">
          <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <Icon name="schedule" size={18} className="text-primary" /> New Milestone
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Milestone Title (e.g. Architecture Approval)"
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
            />
            <textarea
              placeholder="Milestone Description"
              rows={2}
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              value={msDesc}
              onChange={(e) => setMsDesc(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-on-surface-variant">Start Date</label>
                <input
                  type="date"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none"
                  value={msStart}
                  onChange={(e) => setMsStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-on-surface-variant">End Date</label>
                <input
                  type="date"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none"
                  value={msEnd}
                  onChange={(e) => setMsEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={() => setShowAddMilestoneInline(false)}
              className="px-4 py-2 border border-border-subtle rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddMilestoneSubmit}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              Schedule Milestone
            </button>
          </div>
        </div>
      )}

      {/* ADVANCED SETTINGS TOGGLE */}
      <div className="flex items-center gap-4 pt-4">
        <div className="flex-1 h-px bg-border-subtle"></div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors outline-none"
        >
          <Icon name={showAdvanced ? "expand_less" : "expand_more"} size={16} />
          {showAdvanced ? "Hide Advanced Timeline Data" : "Show Advanced Timeline Data"}
        </button>
        <div className="flex-1 h-px bg-border-subtle"></div>
      </div>

      {/* Risks Assessment Section (Advanced) */}
      {showAdvanced && (
        <div className="space-y-4 pt-2 animate-in fade-in duration-300">
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="warning" size={16} className="text-status-warning" /> Risk Assessment Matrix
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.keys(risks).map((riskKey) => (
              <div key={riskKey} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-3 shadow-sm text-center">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-2">{riskKey} Risk</span>
                <div className="flex flex-col gap-1.5">
                  {['low', 'medium', 'high'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setRisks({ ...risks, [riskKey]: lvl })}
                      className={`py-1 rounded text-[10px] font-bold transition-all border capitalize ${
                        risks[riskKey] === lvl
                          ? lvl === 'high' ? 'bg-status-error/15 border-status-error text-status-error'
                            : lvl === 'medium' ? 'bg-status-warning/15 border-status-warning text-status-warning'
                            : 'bg-status-success/15 border-status-success text-status-success'
                          : 'border-border-subtle text-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
