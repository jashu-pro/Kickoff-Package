import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Icon } from '../../components/Icon';
import { useToast } from '../../components/Toast';

export const PackageDetails = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [packageRecord, setPackageRecord] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const pkg = await db.packages.get(packageId);
        setPackageRecord(pkg);
        if (pkg && pkg.project_id) {
          const proj = await db.projects.get(pkg.project_id);
          setProjectData(proj);
        }
      } catch (e) {
        console.error("Failed to load package", e);
        addToast('Failed to load package details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId, addToast]);

  const handleDownload = (format, url) => {
    if (!url || url === 'Generated') {
      addToast('File is not available for download.', 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kickoff_Package_${projectData?.project_name?.replace(/\s+/g, '_') || 'Project'}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadJSON = () => {
    if (!packageRecord?.json_url || packageRecord.json_url === 'Generated') {
      addToast('JSON file is not available.', 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = packageRecord.json_url;
    a.download = `project_${packageId}_assets.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard!', 'success');
  };

  // Safe fallback values
  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center h-full">
          <Icon name="sync" size={48} className="animate-spin text-primary/50" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-surface custom-scrollbar pb-24">
        
        {/* Confetti / Success Header Area */}
        <div className="bg-primary/5 border-b border-border-subtle py-12 px-8 text-center animate-in slide-in-from-top-4 duration-500">
          <div className="w-16 h-16 bg-status-success/20 text-status-success rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check_circle" size={32} />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Package Generated Successfully 🎉</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 max-w-2xl mx-auto">
            Your enterprise kickoff artifacts for <strong className="text-on-surface">{projectData?.project_name || 'the project'}</strong> have been finalized and are ready for distribution.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Generated Files */}
            <section className="space-y-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <Icon name="folder_zip" className="text-primary" /> Generated Artifacts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* PDF Card */}
                <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors flex flex-col h-full">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-status-error/10 text-status-error rounded-xl flex items-center justify-center shrink-0">
                      <Icon name="picture_as_pdf" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface text-sm">Kickoff Package.pdf</h3>
                      <p className="text-xs text-on-surface-variant mt-1">Presentation-ready vector PDF for client stakeholders.</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-status-success/10 text-status-success border border-status-success/20 rounded-md text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 bg-status-success rounded-full animate-pulse"></span> Ready
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border-subtle flex gap-2">
                    <button onClick={() => handleDownload('pdf', packageRecord?.pdf_url)} className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">
                      Download PDF
                    </button>
                    {packageRecord?.pdf_url && packageRecord.pdf_url !== 'Generated' && (
                      <a href={packageRecord.pdf_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-surface-container border border-border-subtle text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container-high transition-colors">
                        Preview
                      </a>
                    )}
                  </div>
                </div>

                {/* DOCX Card */}
                <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors flex flex-col h-full">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-info/10 text-info rounded-xl flex items-center justify-center shrink-0">
                      <Icon name="description" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface text-sm">Kickoff Package.docx</h3>
                      <p className="text-xs text-on-surface-variant mt-1">Editable Word Document for internal revisions.</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-status-success/10 text-status-success border border-status-success/20 rounded-md text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 bg-status-success rounded-full animate-pulse"></span> Ready
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border-subtle">
                    <button onClick={() => handleDownload('docx', packageRecord?.docx_url)} className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">
                      Download DOCX
                    </button>
                  </div>
                </div>
                
                {/* JSON Card */}
                <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 shadow-sm hover:border-primary/40 transition-colors flex flex-col h-full md:col-span-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 text-warning rounded-lg flex items-center justify-center shrink-0">
                        <Icon name="data_object" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-sm">project.json</h3>
                        <p className="text-xs text-on-surface-variant">Raw API backup payload.</p>
                      </div>
                    </div>
                    <button onClick={handleDownloadJSON} className="px-4 py-2 border border-border-subtle text-on-surface text-xs font-bold rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2">
                      <Icon name="download" size={16} /> Download
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Package Contents */}
            <section className="space-y-4 pt-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <Icon name="toc" className="text-primary" /> Package Contents
              </h2>
              <div className="bg-surface-base border border-border-subtle rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Executive Summary',
                    'Project Details',
                    'Team Directory',
                    'Communication Plan',
                    'Timeline & Milestones',
                    'Credentials Sheet',
                    'Deliverables Checklist',
                    'Risk Matrix',
                    'Architecture Recommendation (AI)',
                    'Stakeholder Matrix (AI)',
                    'RACI Matrix (AI)'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-border-subtle/50 last:border-0">
                      <div className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center">
                        <Icon name="check" size={12} />
                      </div>
                      <span className="text-sm font-medium text-on-surface">{item}</span>
                      {item.includes('(AI)') && (
                        <span className="px-1.5 py-0.5 bg-accent-vivid/10 text-accent-vivid text-[9px] font-bold rounded uppercase ml-auto">Future</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar / Metadata */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Quick Actions</h3>
              <button onClick={() => navigate('/projects/new')} className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                <Icon name="add" size={18} /> Create New Project
              </button>
              <button onClick={copyLink} className="w-full flex items-center gap-3 px-4 py-2.5 border border-border-subtle bg-surface-base text-on-surface rounded-xl text-sm font-bold hover:bg-surface-container transition-all">
                <Icon name="link" size={18} /> Copy Share Link
              </button>
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-2.5 border border-border-subtle bg-surface-base text-on-surface rounded-xl text-sm font-bold hover:bg-surface-container transition-all">
                <Icon name="dashboard" size={18} /> Go To Dashboard
              </button>
            </div>

            {/* Package Summary */}
            <div className="bg-surface-base border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-surface-container px-5 py-3 border-b border-border-subtle">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <Icon name="info" size={16} className="text-primary" /> Package Summary
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block">Project Name</span>
                  <span className="text-sm font-bold text-on-surface">{projectData?.project_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-outline font-bold uppercase block">Client</span>
                  <span className="text-sm font-bold text-on-surface">{projectData?.client_name || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase block">Package ID</span>
                    <span className="text-xs font-bold text-on-surface">PKG-{new Date().getFullYear()}-{(packageId?.substring(0,4)||'0001').toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase block">Generated At</span>
                    <span className="text-xs font-bold text-on-surface">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border-subtle grid grid-cols-2 gap-4 text-center">
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <div className="text-lg font-bold text-primary">{teamMembers?.length || 0}</div>
                    <div className="text-[10px] font-bold text-outline uppercase mt-0.5">Team</div>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <div className="text-lg font-bold text-primary">{milestones?.length || 0}</div>
                    <div className="text-[10px] font-bold text-outline uppercase mt-0.5">Milestones</div>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <div className="text-lg font-bold text-primary">{channels?.length || 0}</div>
                    <div className="text-[10px] font-bold text-outline uppercase mt-0.5">Channels</div>
                  </div>
                  <div className="bg-surface-container-low p-2 rounded-lg">
                    <div className="text-lg font-bold text-primary">{integrations?.length || 0}</div>
                    <div className="text-[10px] font-bold text-outline uppercase mt-0.5">Credentials</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-surface-base border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-surface-container px-5 py-3 border-b border-border-subtle">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <Icon name="history" size={16} className="text-primary" /> Activity Timeline
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-subtle before:to-transparent">
                  {[
                    { label: 'Project Created', time: 'Just now' },
                    { label: 'Team Assigned', time: 'Just now' },
                    { label: 'Communication Configured', time: 'Just now' },
                    { label: 'Credentials Provisioned', time: 'Just now' },
                    { label: 'Timeline Generated', time: 'Just now' },
                    { label: 'Package Finalized', time: 'Just now' },
                  ].map((activity, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-primary text-white shrink-0 z-10 mx-0 md:mx-auto">
                        <Icon name="check" size={10} />
                      </div>
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-border-subtle bg-surface-container-lowest shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-on-surface">{activity.label}</h4>
                          <span className="text-[10px] text-outline">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};
