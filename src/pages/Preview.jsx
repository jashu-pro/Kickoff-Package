import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export const Preview = () => {
  const navigate = useNavigate()
  const { projectId, project } = useProject()
  const { showToast } = useToast()

  const [teamMembers, setTeamMembers] = useState([])
  const [milestones, setMilestones] = useState([])
  const [channels, setChannels] = useState([])
  const [stakeholders, setStakeholders] = useState([])
  const [loading, setLoading] = useState(true)

  // Send Email Modal
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const tData = await db.team_members.list(projectId)
      const mData = await db.milestones.list(projectId)
      const cData = await db.channels.list(projectId)
      const sData = await db.stakeholders.list(projectId)

      setTeamMembers(tData)
      setMilestones(mData)
      setChannels(cData)
      setStakeholders(sData)
    } catch (e) {
      console.error(e)
      showToast('Error loading project preview details', 'error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Setup email draft
  useEffect(() => {
    if (project) {
      const shList = stakeholders.map(s => s.email).filter(Boolean).join(', ')
      setEmailTo(shList || 'stakeholders@client.com')
      setEmailSubject(`Project Kickoff: ${project.project_name} Strategy Alignment`)
      
      const teamList = teamMembers.map(t => `- ${t.name} (${t.role})`).join('\n')
      const msList = milestones.map(m => `- ${m.title} (${m.status.toUpperCase()})`).join('\n')
      
      setEmailBody(
        `Dear Stakeholders,\n\n` +
        `We are excited to share the Kickoff Strategy recap for "${project.project_name}".\n\n` +
        `Primary Objective:\n${project.notes || 'Modernize system infrastructure and deliver consultant alignment.'}\n\n` +
        `Core Project Team:\n${teamList || '- Sarah Jenkins (Project Manager)'}\n\n` +
        `Timeline Milestones:\n${msList || '- Discovery & Audit phase'}\n\n` +
        `Regards,\nKickoffGen Automation`
      )
    }
  }, [project, stakeholders, teamMembers, milestones])

  const handleSendEmail = async (e) => {
    e.preventDefault()
    console.log("Clicked: Submit Send Email Form")
    setEmailSending(true)
    try {
      await new Promise(r => setTimeout(r, 1000))
      showToast('Kickoff report email sent successfully!', 'success')
      setShowEmailModal(false)
    } catch (err) {
      showToast('Failed to send email summary', 'error')
    } finally {
      setEmailSending(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[400px] flex items-center justify-center">
          <Icon name="sync" size={36} className="animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Icon name="folder_off" size={48} className="mx-auto text-outline mb-2" />
          <h3 className="font-headline-sm">No Active Project</h3>
          <p className="text-on-surface-variant text-body-md">Create or select a project from the top nav dropdown.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header toolbar */}
      <div className="sticky top-16 z-30 bg-surface/80 backdrop-blur-md border-b border-border-subtle px-container-padding-desktop py-4 flex justify-between items-center no-print -mx-margin-md -mt-margin-md mb-margin-md">
        <div className="flex items-center gap-base">
          <button
            onClick={() => {
              console.log("Clicked: Back to Dashboard Button")
              navigate('/dashboard')
            }}
            className="p-2 hover:bg-surface-container rounded-full"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <h1 className="font-headline-md text-headline-md text-on-surface">Preview: {project.project_name}</h1>
        </div>
        <div className="flex gap-margin-sm">
          <button
            onClick={() => {
              console.log("Clicked: Edit Project Kickoff Button")
              navigate('/projects/new')
            }}
            className="flex items-center gap-2 px-4 py-2 border border-border-subtle bg-surface hover:bg-surface-container rounded-lg font-label-md text-label-md transition-all bg-white"
          >
            <Icon name="edit" size={18} />
            Edit
          </button>
          <button
            onClick={() => {
              console.log("Clicked: Open Send Email Modal Button")
              setShowEmailModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 border border-border-subtle bg-surface hover:bg-surface-container rounded-lg font-label-md text-label-md transition-all bg-white"
          >
            <Icon name="mail" size={18} />
            Send Email
          </button>
          <button
            onClick={() => {
              console.log("Clicked: Export PDF Button")
              window.print()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary hover:opacity-90 active:scale-95 rounded-lg font-label-md text-label-md transition-all shadow-sm"
          >
            <Icon name="file_download" size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Slide Deck preview layout */}
        <div className="bg-white rounded-xl shadow-sm border border-border-subtle overflow-hidden">
          <div className="p-12 bg-surface-container-low border-b border-border-subtle relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    alt="Company Logo"
                    className="w-12 h-12"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuChGI1pbBezhfOQJDDWH_Oueqx6nhqg6lCz7LERoi6H7MP2c0TiojnAiHPSeW5BoTXPzfjJa5ZuIRVVvToX56ubBhODpjxLBSkMY-38QgePuIgOUBaBb9d8nYF-gDG2fphNHBYElvmtE1TltoKueztM_GZOv_cbexU4IptMEZWRcKMvf_RLL7ao3WhqOTi6r8fP_HvrtSbowxqfbcRWc7DsHYDDr9N5R2atZxO1CYT14Tf0KGCgtgaj6tbaO25lkA5SbwSYXdtywb8"
                  />
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary">{project.client_name}</h3>
                    <p className="text-label-md text-on-surface-variant uppercase tracking-widest">
                      IT Consultancy Excellence
                    </p>
                  </div>
                </div>
                <div className="pt-8">
                  <h1 className="text-display-lg font-display-lg text-on-surface leading-tight">
                    Project Kickoff Strategy
                  </h1>
                  <p className="text-body-lg text-on-surface-variant max-w-xl">
                    A comprehensive guide to our partnership, technical roadmap, and shared vision for {project.project_name}.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-status-success/10 text-status-success rounded-full font-label-sm text-label-sm mb-4">
                  CONFIDENTIAL
                </div>
                <p className="text-label-md text-outline">
                  Date: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                </p>
                <p className="text-label-md text-outline">ID: PK-{project.id?.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="p-12 space-y-16">
            {/* Welcome message section */}
            <section className="max-w-3xl">
              <h2 className="flex items-center gap-3 text-headline-md font-headline-md text-on-surface mb-6">
                <Icon name="waving_hand" size={28} className="text-primary" /> Welcome Message
              </h2>
              <div className="space-y-4 text-body-lg text-on-surface-variant leading-relaxed">
                <p>Dear Stakeholders,</p>
                <p>
                  We are thrilled to embark on this journey with you. Our mission is to transform your digital landscape
                  through innovative engineering, cloud architecture optimization, and refined resource management. This kickoff document serves
                  as our shared foundation—the blueprint that ensures we remain aligned, efficient, and focused on our
                  common goals.
                </p>
                <p>
                  Warm regards,
                  <br />
                  <strong className="text-on-surface">{teamMembers[0]?.name || 'Elena Rodriguez'}, Principal Consultant</strong>
                </p>
              </div>
            </section>

            {/* Objectives overview */}
            <section>
              <h2 className="flex items-center gap-3 text-headline-md font-headline-md text-on-surface mb-8">
                <Icon name="info" size={28} className="text-primary" /> Project Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                <div className="p-margin-md bg-surface-container-low rounded-xl border border-border-subtle">
                  <Icon name="target" size={28} className="text-primary mb-4" />
                  <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">
                    Primary Objective
                  </h4>
                  <p className="text-body-md text-on-surface">
                    {project.notes || 'Deliver high quality system migration and stakeholder coordination baseline.'}
                  </p>
                </div>
                <div className="p-margin-md bg-surface-container-low rounded-xl border border-border-subtle">
                  <Icon name="groups_3" size={28} className="text-primary mb-4" />
                  <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">Scope</h4>
                  <p className="text-body-md text-on-surface">
                    Consultant coordination, database integration mapping, and real-time status reporting hooks.
                  </p>
                </div>
                <div className="p-margin-md bg-surface-container-low rounded-xl border border-border-subtle">
                  <Icon name="security" size={28} className="text-primary mb-4" />
                  <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">
                    Priority Level
                  </h4>
                  <p className="text-body-md text-on-surface capitalize">
                    {project.priority || 'medium'} priority execution schedule.
                  </p>
                </div>
              </div>
            </section>

            {/* Team introduction */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <h2 className="flex items-center gap-3 text-headline-md font-headline-md text-on-surface">
                  <Icon name="groups" size={28} className="text-primary" /> Team Introduction
                </h2>
                <span className="text-label-md text-outline">Total: {teamMembers.length} Core Members</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {teamMembers.map((member, idx) => (
                  <div key={member.id || idx} className="text-center group">
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 group-hover:border-primary flex items-center justify-center transition-colors mx-auto">
                        <Icon name="account_circle" size={40} className="text-primary" />
                      </div>
                      <div className="absolute bottom-0 right-3 w-5 h-5 rounded-full border-2 border-white bg-status-success" />
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface truncate px-2">{member.name}</h4>
                    <p className="text-label-md text-on-surface-variant truncate px-2">{member.role}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline Summary & Milestones checklist split */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="flex items-center gap-3 text-headline-md font-headline-md text-on-surface mb-8">
                  <Icon name="timeline" size={28} className="text-primary" /> Timeline Summary
                </h2>
                <div className="space-y-6 relative border-l-2 border-surface-container ml-3 pl-8">
                  {milestones.map((item, idx) => (
                    <div key={item.id || idx} className="relative">
                      <span
                        className={`absolute -left-10 top-0 w-4 h-4 rounded-full ${
                          item.status === 'in_progress' ? 'bg-primary ring-4 ring-primary/10' : 'bg-surface-container ring-4 ring-transparent'
                        }`}
                      />
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">{item.title}</h4>
                      <p className="text-label-md text-on-surface-variant mb-2">{item.dates || 'Ongoing'}</p>
                      <p className="text-body-md text-on-surface-variant line-clamp-2">{item.description}</p>
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <p className="text-label-md text-outline">No timeline milestones defined yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-3 text-headline-md font-headline-md text-on-surface mb-8">
                  <Icon name="checklist" size={28} className="text-primary" /> Milestone Checklist
                </h2>
                <div className="space-y-3">
                  {milestones.map((milestone, idx) => (
                    <div
                      key={milestone.id || idx}
                      className={`flex items-center justify-between p-4 bg-surface rounded-lg border border-border-subtle ${
                        milestone.status === 'scheduled' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          name={
                            milestone.status === 'completed'
                              ? 'check_circle'
                              : milestone.status === 'in_progress'
                                ? 'radio_button_checked'
                                : 'radio_button_unchecked'
                          }
                          size={24}
                          filled={milestone.status === 'completed'}
                          className={
                            milestone.status === 'completed'
                              ? 'text-status-success'
                              : milestone.status === 'in_progress'
                                ? 'text-primary'
                                : 'text-outline'
                          }
                        />
                        <span className="text-body-md font-medium text-on-surface truncate">{milestone.title}</span>
                      </div>
                      <span
                        className={`text-label-sm px-2 py-1 rounded shrink-0 ${
                          milestone.status === 'completed'
                            ? 'bg-status-success/10 text-status-success'
                            : milestone.status === 'in_progress'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {milestone.status === 'completed' ? 'Done' : milestone.status === 'in_progress' ? 'Next' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Comm rules summary */}
            <section className="bg-surface-container p-margin-md rounded-xl">
              <h2 className="flex items-center gap-3 text-headline-md font-headline-md text-on-surface mb-6">
                <Icon name="chat_bubble" size={28} className="text-primary" /> Communication Rules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {channels.map((chan, idx) => (
                  <div key={chan.id || idx} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-primary shrink-0">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase">{chan.name}</h4>
                      <p className="text-body-md text-on-surface-variant">{chan.description || 'Primary communications channel url: ' + chan.channel_url}</p>
                    </div>
                  </div>
                ))}
                {channels.length === 0 && (
                  <p className="text-label-md text-outline">No communication rules synced.</p>
                )}
              </div>
            </section>
          </div>

          <div className="p-8 border-t border-border-subtle bg-surface-container-lowest flex justify-between items-center">
            <p className="text-label-md text-outline">Generated via KickoffGen SaaS Platform</p>
            <div className="flex gap-margin-sm items-center">
              <img
                alt="Doc Type"
                className="opacity-50 h-6"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpnsCR296JZsAXq-7tJsqDAQwS8rKlYLS92ltJ30fsrqESquYnRThiYawzoOV3Wuvx3yEKwSKehKUmscggxzxKd9HaItE0kyY0py2JFGS82U0pRdZgqIDNqKVY1lit2bciG6WR4f2tckOOHDJa3aZ3s07UQmW_pCNUjdHddjyhMvEjEWGV_tp_dM7NWCz_Pxncck7krtvoS14oNQrHZoojvJRNLq-lndRxMhvVxcN2p2xUaeSV-Ka4hOvEIbc36bFsi8YZfK3L78s"
              />
              <span className="text-label-md text-outline">Page 1 of 1</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-4 no-print">
          <Icon name="lightbulb" size={24} className="text-primary" />
          <div>
            <h5 className="text-label-md font-bold text-primary uppercase mb-1">Preview Suggestion</h5>
            <p className="text-body-md text-on-surface-variant">
              This document uses dynamic typography. For best results when exporting to PDF, ensure "Print Background
              Graphics" is enabled in your browser settings.
            </p>
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm no-print">
          <div className="bg-white rounded-xl shadow-xl border border-border-subtle w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted/50">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Email Kickoff Package Recap</h3>
              <button
                onClick={() => {
                  console.log("Clicked: Close Send Email Modal Button")
                  setShowEmailModal(false)
                }}
                className="text-outline hover:text-on-surface p-1"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Recipients (To)</label>
                <input
                  type="text"
                  required
                  placeholder="stakeholders@client.com, leads@consultancy.com"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Message Body</label>
                <textarea
                  rows={8}
                  required
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-body-md font-mono text-xs"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Clicked: Cancel Send Email Modal Button")
                    setShowEmailModal(false)
                  }}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-on-surface-variant"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 shadow-md flex items-center gap-2"
                >
                  {emailSending ? (
                    <>
                      <Icon name="progress_activity" size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icon name="send" size={18} />
                      Send Recap
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
