import React from 'react'
import { Layout } from '../../components/Layout'
import { Icon } from '../../components/Icon'
import { useProjectForm } from './hooks/useProjectForm'
import { Step1Details } from './components/Step1Details'
import { Step2Team } from './components/Step2Team'
import { Step3Communication } from './components/Step3Communication'
import { Step4Credentials } from './components/Step4Credentials'
import { Step5Milestones } from './components/Step5Milestones'
import { Step6Review } from './components/Step6Review'
import { GenerationModal } from './components/GenerationModal'

export const ProjectCreation = () => {
  const formState = useProjectForm()
  
  const {
    currentStep, setCurrentStep,
    localProjectId, projectSavedInDb,
    hasDraft, discardDraft, loadDraft, saveDraft,
    loading, success, dbError,
    completenessScore, completenessChecks,
    addedRecommendationsHistory, handleRestoreRecommendation,
    aiRecs, handleAddSuggestedRole, handleApplySuggestedFreq, handleAddSuggestedMilestone,
    handleSubmit, handleExportJSON, handleSharePackage
  } = formState

  const steps = [
    { step: 1, label: 'Details', desc: 'Project & Client basics' },
    { step: 2, label: 'Team', desc: 'Roster & roles' },
    { step: 3, label: 'Communication', desc: 'Channels & Contacts' },
    { step: 4, label: 'Credentials', desc: 'Tools & Integrations' },
    { step: 5, label: 'Timeline', desc: 'Milestones & Risks' },
    { step: 6, label: 'Review', desc: 'Finalize package' }
  ]

  if (success) {
    return (
      <Layout hideSidebar>
        <div className="flex-1 flex items-center justify-center bg-surface p-6 animate-in fade-in zoom-in duration-300">
          <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check_circle" size={40} className="text-status-success" />
            </div>
            <h2 className="text-display-sm font-display-sm font-bold text-on-surface tracking-tight">Package Generated!</h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed">
              Your Kickoff package is complete and saved securely.
            </p>
            <div className="space-y-3 pt-4">
              <button onClick={() => window.location.href = '/dashboard'} className="w-full bg-primary text-white py-3 rounded-xl font-label-lg font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all">
                Go to Dashboard
              </button>
              <button onClick={() => window.location.reload()} className="w-full bg-surface-container-low text-on-surface py-3 rounded-xl font-label-lg font-bold hover:bg-surface-container transition-all">
                Create Another Project
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <GenerationModal isOpen={formState.isGenerating} />
      <div className="flex-1 bg-surface flex flex-col h-full overflow-hidden">
        {/* Header & Controls */}
        <div className="flex-none px-8 py-6 border-b border-border-subtle bg-surface/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight">Project Creation Wizard</h1>
              <p className="text-body-md text-on-surface-variant flex items-center gap-2 mt-1">
                Drafting Local Workspace ID: <span className="font-mono text-xs bg-surface-container-low px-2 py-0.5 rounded text-outline">{localProjectId}</span>
                {projectSavedInDb && (
                  <span className="flex items-center gap-1 text-[10px] bg-status-success/10 text-status-success px-2 py-0.5 rounded-full font-bold">
                    <Icon name="cloud_done" size={12} /> Live Sync Active
                  </span>
                )}
              </p>
              {dbError && (
                <p className="text-xs text-status-error font-medium flex items-center gap-1 mt-1 bg-status-error/10 px-2 py-1 rounded w-fit">
                  <Icon name="error" size={14} /> {dbError}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {hasDraft && (
                <>
                  <button onClick={discardDraft} className="px-4 py-2 text-status-error font-semibold text-xs hover:bg-error-container/10 rounded-xl transition-all flex items-center gap-1.5">
                    <Icon name="delete_sweep" size={16} /> Discard Draft
                  </button>
                  <button onClick={loadDraft} className="px-4 py-2 border border-primary text-primary font-semibold text-xs hover:bg-primary/5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                    <Icon name="restore" size={16} /> Restore Draft
                  </button>
                </>
              )}
              <button onClick={saveDraft} className="px-4 py-2 bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container rounded-xl transition-all flex items-center gap-1.5 border border-border-subtle shadow-sm">
                <Icon name="save" size={16} /> Save Draft
              </button>
              <button onClick={() => window.history.back()} className="px-4 py-2 border border-border-subtle rounded-xl text-on-surface hover:bg-surface-container-low transition-all font-semibold text-xs">
                Cancel
              </button>
            </div>
          </div>

          {/* Stepper Navbar */}
          <div className="flex items-center gap-2 overflow-x-auto scroll-hide pb-2">
            {steps.map((s, i) => (
              <React.Fragment key={s.step}>
                <button
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex items-center gap-1.5 shrink-0 transition-all ${currentStep === s.step ? 'text-primary font-bold' : currentStep > s.step ? 'text-on-surface' : 'text-outline-variant'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${currentStep === s.step ? 'bg-primary text-white ring-4 ring-primary/20' : currentStep > s.step ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-low border border-border-subtle text-outline'}`}>
                    {currentStep > s.step ? <Icon name="check" size={16} /> : s.step}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs uppercase tracking-wider">{s.label}</div>
                  </div>
                </button>
                {i < steps.length - 1 && <div className={`w-8 h-px ${currentStep > s.step ? 'bg-primary' : 'bg-border-subtle'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="px-8 py-6 pb-32 animate-in slide-in-from-right-4 fade-in duration-300">
              {currentStep === 1 && <Step1Details formState={formState} />}
              {currentStep === 2 && <Step2Team formState={formState} />}
              {currentStep === 3 && <Step3Communication formState={formState} />}
              {currentStep === 4 && <Step4Credentials formState={formState} />}
              {currentStep === 5 && <Step5Milestones formState={formState} />}
              {currentStep === 6 && <Step6Review formState={formState} />}
            </div>
          </div>

          {/* Right AI Sidebar */}
          <div className="hidden xl:flex w-80 flex-col bg-slate-50 dark:bg-slate-800/20 border-l border-border-subtle overflow-y-auto">
            <div className="p-4 border-b border-border-subtle bg-primary/5">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Icon name="auto_awesome" size={20} />
                <h3 className="font-bold text-body-md">AI Architecture Copilot</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {aiRecs.advice}
              </p>
            </div>

            <div className="p-4 space-y-6">
              {/* Completeness Widget */}
              <div>
                <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Project Readiness</h4>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-border-subtle shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-display-sm font-bold text-on-surface">{completenessScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                    <div className="bg-status-success h-full transition-all duration-500" style={{ width: `${completenessScore}%` }} />
                  </div>
                  <div className="space-y-1.5 mt-4">
                    {Object.entries(completenessChecks).map(([key, isDone]) => {
                      const labels = {
                        client: 'Client Name',
                        projectName: 'Project Name',
                        industry: 'Industry & Type',
                        dates: 'Project Dates',
                        contractValue: 'Contract Value',
                        projectManager: 'Project Manager',
                        priority: 'Priority'
                      }
                      return (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <Icon name={isDone ? "check_circle" : "radio_button_unchecked"} size={14} className={isDone ? "text-status-success" : "text-outline"} />
                          <span className={isDone ? "text-on-surface font-medium" : "text-on-surface-variant"}>{labels[key] || key}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic AI Enterprise Summary */}
              {aiRecs.recommendedArchitecture && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-primary/20 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Project Summary</h4>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {aiRecs.aiConfidenceScore}% Match
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-outline uppercase tracking-wider block mb-0.5">Architecture</span>
                      <p className="text-xs font-bold text-on-surface">{aiRecs.recommendedArchitecture}</p>
                    </div>
                    
                    <div>
                      <span className="text-[10px] text-outline uppercase tracking-wider block mb-1">Tech Stack</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiRecs.recommendedTechStack?.map(tech => (
                          <span key={tech} className="text-[10px] bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded border border-border-subtle">{tech}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-outline uppercase tracking-wider block mb-1">Core Integrations</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiRecs.recommendedIntegrations?.map(inte => (
                          <span key={inte} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">{inte}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Role Suggestions */}
              {aiRecs.recommendedRoles.length > 0 && currentStep <= 2 && (
                <div>
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Suggested Roles</h4>
                  <div className="space-y-2">
                    {aiRecs.recommendedRoles.map((r, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-primary/20 flex gap-3 relative group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon name="person_add" size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-on-surface">{r.role}</div>
                          <div className="text-[10px] text-outline mt-0.5">{r.skills.join(', ')}</div>
                        </div>
                        <button onClick={() => handleAddSuggestedRole(r)} className="text-primary p-1 rounded-lg hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 absolute right-2 top-2">
                          <Icon name="add" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Milestone Suggestions */}
              {aiRecs.recommendedMilestones.length > 0 && currentStep <= 5 && (
                <div>
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Suggested Milestones</h4>
                  <div className="space-y-2">
                    {aiRecs.recommendedMilestones.map((m, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-accent-vivid/20 flex gap-3 relative group">
                        <div className="w-8 h-8 rounded-full bg-accent-vivid/10 flex items-center justify-center shrink-0">
                          <Icon name="flag" size={16} className="text-accent-vivid" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-on-surface leading-tight">{m.title}</div>
                          <div className="text-[10px] text-outline mt-1 leading-snug">{m.description}</div>
                        </div>
                        <button onClick={() => handleAddSuggestedMilestone(m)} className="text-accent-vivid p-1 rounded-lg hover:bg-accent-vivid/10 transition-colors opacity-0 group-hover:opacity-100 absolute right-2 top-2">
                          <Icon name="add" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Cadence Suggestions */}
              {currentStep === 3 && (
                <div>
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Recommended Cadence</h4>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-status-warning/20 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <Icon name="event_repeat" size={16} className="text-status-warning" />
                      <span className="text-xs font-bold text-on-surface">{aiRecs.recommendedFreq}</span>
                    </div>
                    <button onClick={() => handleApplySuggestedFreq(aiRecs.recommendedFreq)} className="text-status-warning p-1 rounded-lg hover:bg-status-warning/10 transition-colors opacity-0 group-hover:opacity-100">
                      <Icon name="add" size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* History Ledger */}
              {addedRecommendationsHistory.length > 0 && (
                <div className="pt-4 border-t border-border-subtle">
                  <h4 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Icon name="history" size={12} /> Recommendation History
                  </h4>
                  <div className="space-y-2">
                    {addedRecommendationsHistory.slice(0, 5).map(item => (
                      <div key={item.id} className="text-[10px] flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-border-subtle">
                        <Icon name={item.status === 'deleted' ? "delete" : "add_circle"} size={12} className={item.status === 'deleted' ? "text-status-error" : "text-status-success"} />
                        <div className="flex-1">
                          <span className="font-semibold text-on-surface">{item.addedBy}</span> {item.status === 'deleted' ? 'removed' : 'added'} {item.type} <span className="font-semibold">"{item.name}"</span>
                          <div className="text-outline-variant mt-0.5">{item.addedDate}</div>
                        </div>
                        {item.status === 'deleted' && (
                          <button onClick={() => handleRestoreRecommendation(item)} className="text-primary hover:underline font-semibold ml-1">Restore</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex-none px-8 py-4 border-t border-border-subtle bg-surface flex justify-between items-center z-20">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2 border rounded-xl font-semibold text-xs flex items-center gap-1 transition-all ${currentStep === 1 ? 'border-border-subtle text-outline-variant bg-surface-container-low cursor-not-allowed' : 'border-border-subtle text-on-surface hover:bg-surface-container-low active:scale-95'}`}
          >
            <Icon name="arrow_back" size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 border border-border-subtle rounded-xl text-on-surface hover:bg-surface-container-low font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Icon name="download" size={16} /> Export JSON
            </button>
            <button
              onClick={handleSharePackage}
              className="px-4 py-2 border border-border-subtle rounded-xl text-on-surface hover:bg-surface-container-low font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Icon name="share" size={16} /> Share Preview Link
            </button>
            
            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                className="px-6 py-2 bg-primary text-white rounded-xl font-semibold text-xs flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                Next <Icon name="arrow_forward" size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-status-success text-white rounded-xl font-semibold text-xs flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              >
                {loading ? <Icon name="sync" size={16} className="animate-spin" /> : <Icon name="rocket_launch" size={16} />}
                Generate Package
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
