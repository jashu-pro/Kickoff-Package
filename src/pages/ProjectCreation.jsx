import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db, generateUUID } from '../lib/db'

export const ProjectCreation = () => {
  const navigate = useNavigate()
  const { setProjectId, refreshProjects, userProfile } = useProject()
  const { showToast } = useToast()

  const [localProjectId] = useState(() => generateUUID())
  const [projectSavedInDb, setProjectSavedInDb] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [hasDraft, setHasDraft] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [dbError, setDbError] = useState(null)

  // STEP 1: Project Details State
  const [priority, setPriority] = useState('medium')
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    industry: 'Financial Services',
    projectType: 'Cloud Transformation',
    contractValue: '',
    startDate: '',
    endDate: '',
    projectManager: 'Sarah Jenkins',
    notes: '',
  })

  // STEP 2: Team Members State
  const [teamMembers, setTeamMembers] = useState([
    { name: 'James R.', role: 'Senior Consultant', department: 'Delivery', skills: ['Agile', 'Scrum'] },
    { name: 'Elena M.', role: 'Lead Architect', department: 'Consulting', skills: ['Cloud Architecture', 'AWS'] },
  ])
  const [showAddMemberInline, setShowAddMemberInline] = useState(false)
  const [inlineName, setInlineName] = useState('')
  const [inlineRole, setInlineRole] = useState('')
  const [inlineDept, setInlineDept] = useState('')
  const [inlineSkills, setInlineSkills] = useState('')

  // STEP 3: Communication State
  const [channels, setChannels] = useState([
    { type: 'slack', name: 'Slack Channel', description: 'Primary async communications channel', channel_url: '', is_active: true }
  ])
  const [meetings, setMeetings] = useState([
    { name: 'Weekly Status Sync', frequency: 'Weekly', day_of_week: 'Tuesday', time: '10:00 AM', duration: '30 mins', attendees: 'James R., Elena M., Sarah Jenkins' }
  ])
  const [clientContacts, setClientContacts] = useState([
    { name: 'Alice Smith', role: 'Product Owner', organization: '', email: 'alice@acme.com', phone: '+1 (555) 0123' }
  ])
  
  const [showAddContactInline, setShowAddContactInline] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactRole, setContactRole] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const [showAddMeetingInline, setShowAddMeetingInline] = useState(false)
  const [meetName, setMeetName] = useState('')
  const [meetFreq, setMeetFreq] = useState('Weekly')
  const [meetDay, setMeetDay] = useState('Tuesday')
  const [meetTime, setMeetTime] = useState('10:00 AM')
  const [meetDuration, setMeetDuration] = useState('30 mins')

  // STEP 4: Credentials State
  const [integrations, setIntegrations] = useState([
    { service: 'Jira', description: 'Project management and issue tracking', required: true, status: 'pending' },
    { service: 'Confluence', description: 'Central documentation repository', required: true, status: 'pending' },
    { service: 'AWS Cloud Account', description: 'Client deployment cloud landing zone', required: false, status: 'pending' },
    { service: 'GitHub Organization', description: 'Source code repository for client developers', required: true, status: 'pending' }
  ])

  // STEP 5: Milestones State
  const [milestones, setMilestones] = useState([
    { title: 'Project Kickoff & Alignment', description: 'Stakeholder interviews, requirements gathering, and initial baseline definitions.', start_date: '', end_date: '', status: 'scheduled', progress: 0 }
  ])
  const [showAddMilestoneInline, setShowAddMilestoneInline] = useState(false)
  const [msTitle, setMsTitle] = useState('')
  const [msDesc, setMsDesc] = useState('')
  const [msStart, setMsStart] = useState('')
  const [msEnd, setMsEnd] = useState('')

  // Risks Assessment Ratings
  const [risks, setRisks] = useState({
    timeline: 'medium',
    resource: 'low',
    budget: 'low',
    communication: 'medium'
  })

  // STEP 6: Deliverables Checklist Selections
  const [deliverables, setDeliverables] = useState({
    kickoffDocument: true,
    projectCharter: true,
    teamDirectory: true,
    communicationMatrix: true,
    timelinePlan: true,
    credentialsSheet: true
  })

  // Recommendation History Ledger State
  const [addedRecommendationsHistory, setAddedRecommendationsHistory] = useState([])

  // Load Draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('ko_project_creation_draft')
    if (savedDraft) {
      setHasDraft(true)
    }
  }, [])

  // Auto-Save Project Details helper
  const saveProjectDetails = async (updatedFields = {}) => {
    try {
      const mergedData = {
        clientName: formData.clientName,
        projectName: formData.projectName,
        industry: formData.industry,
        projectType: formData.projectType,
        contractValue: formData.contractValue,
        startDate: formData.startDate,
        endDate: formData.endDate,
        projectManager: formData.projectManager,
        notes: formData.notes,
        ...updatedFields
      }

      await db.projects.save({
        id: localProjectId,
        client_name: mergedData.clientName || 'Draft Client',
        project_name: mergedData.projectName || 'Draft Project',
        industry: mergedData.industry,
        project_type: mergedData.projectType,
        contract_value: parseFloat(mergedData.contractValue) || 0,
        start_date: mergedData.startDate || null,
        end_date: mergedData.endDate || null,
        priority: updatedFields.priority || priority,
        notes: mergedData.notes,
        status: 'active'
      })

      setProjectSavedInDb(true)
      setProjectId(localProjectId)
      await refreshProjects()
    } catch (err) {
      console.error("Database save project failed:", err)
      setDbError("Database sync failed: " + err.message)
    }
  }

  const handleInputChange = (field, value) => {
    setDbError(null)
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleInputBlur = async () => {
    await saveProjectDetails()
  }

  const handleChannelChange = (index, field, value) => {
    setDbError(null)
    setChannels(prev =>
      prev.map((channel, channelIndex) =>
        channelIndex === index ? { ...channel, [field]: value } : channel
      )
    )
  }

  // Load Draft from LocalStorage and write immediately to Supabase
  const loadDraft = async () => {
    try {
      const draft = JSON.parse(localStorage.getItem('ko_project_creation_draft'))
      if (draft) {
        if (draft.formData) setFormData(draft.formData)
        if (draft.priority) setPriority(draft.priority)
        
        await db.projects.save({
          id: localProjectId,
          client_name: draft.formData?.clientName || 'Draft Client',
          project_name: draft.formData?.projectName || 'Draft Project',
          industry: draft.formData?.industry,
          project_type: draft.formData?.projectType,
          contract_value: parseFloat(draft.formData?.contractValue) || 0,
          start_date: draft.formData?.startDate || null,
          end_date: draft.formData?.endDate || null,
          priority: draft.priority || 'medium',
          notes: draft.formData?.notes,
          status: 'active'
        })
        setProjectSavedInDb(true)

        if (draft.milestones) {
          for (const ms of draft.milestones) {
            await db.milestones.save({
              project_id: localProjectId,
              title: ms.title,
              description: ms.description,
              start_date: ms.start_date,
              end_date: ms.end_date,
              status: ms.status,
              progress: ms.progress
            })
          }
          setMilestones(draft.milestones)
        }

        if (draft.teamMembers) {
          for (const tm of draft.teamMembers) {
            await db.team_members.save({
              project_id: localProjectId,
              name: tm.name,
              role: tm.role,
              email: tm.email || `${tm.name.toLowerCase().replace(/[^a-z]/g, '')}@consulting.com`,
              avatar_url: tm.avatar_url || '',
              capacity: tm.capacity || 100,
              status: tm.status || 'available',
              department: tm.department,
              skills: tm.skills
            })
          }
          setTeamMembers(draft.teamMembers)
        }

        if (draft.channels) {
          for (const ch of draft.channels) {
            await db.channels.save({
              project_id: localProjectId,
              type: ch.type,
              name: ch.name,
              description: ch.description,
              channel_url: ch.channel_url,
              is_active: ch.is_active
            })
          }
          setChannels(draft.channels)
        }

        if (draft.meetings) {
          for (const meet of draft.meetings) {
            await db.meetings.save({
              project_id: localProjectId,
              name: meet.name,
              frequency: meet.frequency,
              day_of_week: meet.day_of_week,
              time: meet.time,
              duration: meet.duration,
              attendees: Array.isArray(meet.attendees) ? meet.attendees : (meet.attendees || '').split(',').map(s => s.trim())
            })
          }
          setMeetings(draft.meetings)
        }

        if (draft.clientContacts) {
          for (const cc of draft.clientContacts) {
            await db.stakeholders.save({
              project_id: localProjectId,
              name: cc.name,
              role: cc.role,
              organization: cc.organization || draft.formData?.clientName || 'Draft Client',
              email: cc.email,
              phone: cc.phone
            })
          }
          setClientContacts(draft.clientContacts)
        }

        if (draft.integrations) {
          for (const inte of draft.integrations) {
            await db.integrations.save({
              project_id: localProjectId,
              service: inte.service,
              description: inte.description,
              status: inte.status,
              required: inte.required
            })
          }
          setIntegrations(draft.integrations)
        }

        if (draft.risks) setRisks(draft.risks)
        if (draft.deliverables) setDeliverables(draft.deliverables)
        if (draft.currentStep) setCurrentStep(draft.currentStep)
        
        await refreshProjects()
        showToast('Draft restored and synchronized with database!', 'success')
      }
    } catch (e) {
      console.error("Failed to restore draft:", e)
      showToast('Failed to load draft and write to DB', 'error')
    }
    setHasDraft(false)
  }

  const discardDraft = () => {
    localStorage.removeItem('ko_project_creation_draft')
    setHasDraft(false)
    showToast('Draft workspace cleared', 'info')
  }

  const saveDraft = () => {
    const draft = {
      formData,
      priority,
      teamMembers,
      channels,
      meetings,
      clientContacts,
      integrations,
      milestones,
      risks,
      deliverables,
      currentStep
    }
    localStorage.setItem('ko_project_creation_draft', JSON.stringify(draft))
    showToast('Draft saved successfully!', 'success')
  }

  // Calculate completeness percentage (Dynamically)
  const getCompleteness = () => {
    let score = 0
    const checks = {
      details: false,
      team: false,
      milestones: false,
      communication: false,
      credentials: false
    }

    if (formData.projectName && formData.clientName) {
      score += 20
      checks.details = true
    }
    if (teamMembers.length > 0) {
      score += 20
      checks.team = true
    }
    if (milestones.length > 0) {
      score += 20
      checks.milestones = true
    }
    if (clientContacts.length > 0 || meetings.length > 0) {
      score += 20
      checks.communication = true
    }
    if (integrations.some(i => i.required)) {
      score += 20
      checks.credentials = true
    }

    return { score, checks }
  }

  const { score: completenessScore, checks: completenessChecks } = getCompleteness()

  // Dynamic AI Suggestions Builder
  const getAIRecommendations = () => {
    const type = (formData.projectType || '').toLowerCase()
    const ind = (formData.industry || 'Financial Services').toLowerCase()
    const budget = parseFloat(formData.contractValue) || 0
    const teamSize = teamMembers.length

    let recommendedMilestones = []
    let recommendedRoles = []
    let recommendedFreq = 'Weekly Sync'
    let riskWarnings = []
    let advice = 'Establish clean collaboration spaces and communication cadences early.'

    if (ind.includes('financial') || ind.includes('finance') || ind.includes('bank')) {
      advice = 'Financial Services project: Prioritize PCI DSS guidelines, security audits, and data governance.'
      recommendedMilestones.push(
        { title: 'PCI DSS Review', description: 'Evaluate cardholder data environment compliance.', durationDays: 5 },
        { title: 'Security Audit', description: 'System security verification and network scans.', durationDays: 6 },
        { title: 'Encryption Validation', description: 'Confirm SSL/TLS protocols and databases encryption.', durationDays: 4 }
      )
      recommendedRoles.push({ name: 'SecOps Architect', role: 'Security Specialist', department: 'Security', skills: ['PCI DSS', 'IAM', 'TLS'] })
    } else if (ind.includes('health') || ind.includes('medical')) {
      advice = 'Healthcare project: Ensure HIPAA compliance and secure patient data encryption audits.'
      recommendedMilestones.push(
        { title: 'HIPAA Compliance Audit', description: 'Validate patient record security and audit logging.', durationDays: 6 },
        { title: 'Data Protection Review', description: 'Verify transport security and access logging.', durationDays: 5 }
      )
      recommendedRoles.push({ name: 'Compliance Officer', role: 'HIPAA Auditor', department: 'Auditing', skills: ['HIPAA', 'Encryption'] })
    } else if (ind.includes('retail') || ind.includes('e-commerce') || ind.includes('commerce')) {
      advice = 'E-Commerce project: Load testing and payment integrations are critical.'
      recommendedMilestones.push(
        { title: 'Payment Gateway Setup', description: 'Configure Stripe/Paypal API keys and sandbox checks.', durationDays: 4 },
        { title: 'Load Testing', description: 'Verify application performance under peak checkout loads.', durationDays: 5 }
      )
      recommendedRoles.push({ name: 'Payment Integrations Dev', role: 'Payment Specialist', department: 'Delivery', skills: ['Stripe', 'Sandbox', 'Performance'] })
    } else {
      recommendedMilestones.push(
        { title: 'Detailed Architecture Review', description: 'Examine design scalability and tech stack choice.', durationDays: 5 }
      )
    }

    if (type.includes('cloud') || type.includes('migration') || type.includes('infra')) {
      recommendedMilestones.push(
        { title: 'Cloud Landing Zone Setup', description: 'Configure IAM policies, VPC subnetting, and logging.', durationDays: 7 }
      )
      recommendedRoles.push({ name: 'Alex K.', role: 'Cloud Solutions Architect', department: 'Cloud Ops', skills: ['Terraform', 'AWS', 'IAM'] })
    } else if (type.includes('devops') || type.includes('pipeline') || type.includes('ci')) {
      recommendedMilestones.push(
        { title: 'Pipeline CI/CD Automation', description: 'Establish main build and deployment pipelines.', durationDays: 6 }
      )
      recommendedRoles.push({ name: 'DevOps Lead', role: 'DevOps Engineer', department: 'Ops', skills: ['Docker', 'CI/CD'] })
    } else if (type.includes('saas') || type.includes('app') || type.includes('develop')) {
      recommendedMilestones.push(
        { title: 'Figma Mockup Design Signoff', description: 'Acquire user experience design signoff.', durationDays: 5 },
        { title: 'Client Acceptance Test (UAT)', description: 'Ensure all functional requirements are validated.', durationDays: 6 }
      )
      recommendedRoles.push({ name: 'Lead Dev', role: 'Senior React Developer', department: 'Delivery', skills: ['React', 'Node.js'] })
    }

    // Budget-based suggestions
    if (budget > 100000) {
      advice += ' High-budget project: Setup regular Steering Committee reviews and quality gates.'
      recommendedRoles.push({ name: 'Delivery Director', role: 'PMO Lead', department: 'Leadership', skills: ['PMO', 'Governance'] })
    }

    // Timeline-based suggestions
    if (formData.startDate && formData.endDate) {
      const diffDays = Math.round((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))
      if (diffDays < 30) {
        riskWarnings.push('Timeline Risk: Active project span is under 30 days. Risk of schedule compression.')
      }
    }

    // Team Size-based suggestions
    if (teamSize < 2) {
      riskWarnings.push('Resource Risk: Only 1 team member assigned. Single point of failure risk.')
    }

    return { recommendedMilestones, recommendedRoles, recommendedFreq, riskWarnings, advice }
  }

  const aiRecs = getAIRecommendations()

  // Real-time addition of suggested milestone recommendation
  const handleAddSuggestedMilestone = async (rec) => {
    // Duplicate Prevention Check
    const exists = milestones.some(m => m.title.toLowerCase() === rec.title.toLowerCase())
    if (exists) {
      setDbError(`Milestone "${rec.title}" already exists in the timeline.`)
      return
    }

    try {
      setDbError(null)
      await saveProjectDetails()

      const baseDate = formData.startDate ? new Date(formData.startDate) : new Date()
      let msStart = new Date(baseDate)
      if (milestones.length > 0) {
        const dates = milestones.map(m => m.end_date ? new Date(m.end_date) : baseDate)
        msStart = new Date(Math.max(...dates))
      }
      const msEnd = new Date(msStart)
      msEnd.setDate(msEnd.getDate() + (rec.durationDays || 5))

      const payload = {
        project_id: localProjectId,
        title: rec.title,
        description: rec.description,
        start_date: msStart.toISOString().split('T')[0],
        end_date: msEnd.toISOString().split('T')[0],
        status: 'scheduled',
        progress: 0
      }

      const savedMs = await db.milestones.save(payload)
      setMilestones(prev => [...prev, { ...payload, id: savedMs.id }])

      // Add to Ledger History
      const historyItem = {
        id: generateUUID(),
        name: rec.title,
        type: 'milestone',
        data: { ...payload, id: savedMs.id },
        addedBy: userProfile?.fullName || 'Alex Morgan',
        addedDate: new Date().toLocaleString(),
        status: 'active'
      }
      setAddedRecommendationsHistory(prev => [historyItem, ...prev])
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to add milestone recommendation: " + err.message)
    }
  }

  // Real-time addition of suggested team role recommendation
  const handleAddSuggestedRole = async (roleRec) => {
    // Duplicate Prevention Check
    const exists = teamMembers.some(tm => tm.role.toLowerCase() === roleRec.role.toLowerCase())
    if (exists) {
      setDbError(`Role "${roleRec.role}" already exists in the team roster.`)
      return
    }

    try {
      setDbError(null)
      await saveProjectDetails()

      const payload = {
        project_id: localProjectId,
        name: roleRec.name,
        role: roleRec.role,
        email: `${roleRec.name.toLowerCase().replace(/[^a-z]/g, '')}@consulting.com`,
        avatar_url: '',
        capacity: 100,
        status: 'available',
        department: roleRec.department,
        skills: roleRec.skills
      }

      const savedMember = await db.team_members.save(payload)
      setTeamMembers(prev => [...prev, { ...payload, id: savedMember.id }])

      // Add to Ledger History
      const historyItem = {
        id: generateUUID(),
        name: roleRec.role,
        type: 'role',
        data: { ...payload, id: savedMember.id },
        addedBy: userProfile?.fullName || 'Alex Morgan',
        addedDate: new Date().toLocaleString(),
        status: 'active'
      }
      setAddedRecommendationsHistory(prev => [historyItem, ...prev])
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to add team member recommendation: " + err.message)
    }
  }

  // Apply cadence template recommendation
  const handleApplySuggestedFreq = async (freq) => {
    try {
      setDbError(null)
      await saveProjectDetails()

      const payload = {
        project_id: localProjectId,
        name: `Project Sync (${freq})`,
        frequency: freq.includes('Bi-weekly') ? 'Bi-weekly' : 'Weekly',
        day_of_week: 'Tuesday',
        time: '11:00 AM',
        duration: '30 mins',
        attendees: teamMembers.map(t => t.name).join(', ')
      }

      const savedMeet = await db.meetings.save(payload)
      setMeetings(prev => [...prev, { ...payload, id: savedMeet.id }])
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to apply cadence: " + err.message)
    }
  }

  // Restore deleted recommendation from History panel
  const handleRestoreRecommendation = async (historyItem) => {
    try {
      setDbError(null)
      await saveProjectDetails()

      if (historyItem.type === 'milestone') {
        const ms = historyItem.data
        // Duplicate check
        const exists = milestones.some(m => m.title.toLowerCase() === ms.title.toLowerCase())
        if (exists) {
          setDbError(`Milestone "${ms.title}" already exists in the timeline.`)
          return
        }

        const savedMs = await db.milestones.save({
          project_id: localProjectId,
          title: ms.title,
          description: ms.description || '',
          start_date: ms.start_date || formData.startDate || new Date().toISOString().split('T')[0],
          end_date: ms.end_date || formData.startDate || new Date().toISOString().split('T')[0],
          status: ms.status || 'scheduled',
          progress: ms.progress || 0
        })
        setMilestones(prev => [...prev, { ...ms, id: savedMs.id }])
      } else if (historyItem.type === 'role') {
        const roleRec = historyItem.data
        // Duplicate check
        const exists = teamMembers.some(tm => tm.role.toLowerCase() === roleRec.role.toLowerCase())
        if (exists) {
          setDbError(`Role "${roleRec.role}" already exists in the team roster.`)
          return
        }

        const savedMember = await db.team_members.save({
          project_id: localProjectId,
          name: roleRec.name,
          role: roleRec.role,
          email: `${roleRec.name.toLowerCase().replace(/[^a-z]/g, '')}@consulting.com`,
          avatar_url: '',
          capacity: 100,
          status: 'available',
          department: roleRec.department,
          skills: roleRec.skills
        })
        setTeamMembers(prev => [...prev, { ...roleRec, id: savedMember.id }])
      }

      setAddedRecommendationsHistory(prev =>
        prev.map(item => item.id === historyItem.id ? { ...item, status: 'active' } : item)
      )
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to restore recommendation: " + err.message)
    }
  }

  // Deletion hook for milestones
  const handleDeleteMilestone = async (id, index) => {
    try {
      setDbError(null)
      const deletedMs = milestones[index]
      if (id) {
        await db.milestones.delete(id)
      } else if (deletedMs.id) {
        await db.milestones.delete(deletedMs.id)
      }
      setMilestones(prev => prev.filter((_, i) => i !== index))

      // Update history status
      setAddedRecommendationsHistory(prev =>
        prev.map(item =>
          item.type === 'milestone' && item.name.toLowerCase() === deletedMs.title.toLowerCase()
            ? { ...item, status: 'deleted' }
            : item
        )
      )
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to delete milestone: " + err.message)
    }
  }

  // Deletion hook for team members
  const handleDeleteMember = async (id, index) => {
    try {
      setDbError(null)
      const deletedMember = teamMembers[index]
      if (id) {
        await db.team_members.delete(id)
      } else if (deletedMember.id) {
        await db.team_members.delete(deletedMember.id)
      }
      setTeamMembers(prev => prev.filter((_, i) => i !== index))

      // Update history status
      setAddedRecommendationsHistory(prev =>
        prev.map(item =>
          item.type === 'role' && item.name.toLowerCase() === deletedMember.role.toLowerCase()
            ? { ...item, status: 'deleted' }
            : item
        )
      )
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to delete team member: " + err.message)
    }
  }

  // Slack channel change & auto-save
  const handleChannelBlur = async (ch) => {
    try {
      setDbError(null)
      await saveProjectDetails()
      if (ch.name) {
        await db.channels.save({
          id: ch.id || undefined,
          project_id: localProjectId,
          type: ch.type,
          name: ch.name,
          description: ch.description,
          channel_url: ch.channel_url || `#proj-${formData.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          is_active: ch.is_active
        })
      }
    } catch (err) {
      console.error(err)
      setDbError("Failed to sync channel with database: " + err.message)
    }
  }

  // Toggle credential requirements save to DB
  const handleToggleIntegration = async (idx) => {
    try {
      setDbError(null)
      await saveProjectDetails()

      const updated = [...integrations]
      const item = updated[idx]
      item.required = !item.required
      setIntegrations(updated)

      await db.integrations.save({
        id: item.id || undefined,
        project_id: localProjectId,
        service: item.service,
        description: item.description,
        status: item.required ? 'active' : 'pending',
        required: item.required
      })
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to sync integration toggle: " + err.message)
    }
  }

  // Add custom milestone save to DB
  const handleAddMilestoneSubmit = async () => {
    if (!msTitle.trim()) {
      setDbError('Milestone title is required')
      return
    }

    const exists = milestones.some(m => m.title.toLowerCase() === msTitle.trim().toLowerCase())
    if (exists) {
      setDbError(`Milestone "${msTitle}" already exists in the timeline.`)
      return
    }

    try {
      setDbError(null)
      await saveProjectDetails()

      const payload = {
        project_id: localProjectId,
        title: msTitle.trim(),
        description: msDesc.trim(),
        start_date: msStart || formData.startDate || new Date().toISOString().split('T')[0],
        end_date: msEnd || formData.endDate || msStart || formData.startDate || new Date().toISOString().split('T')[0],
        status: 'scheduled',
        progress: 0
      }

      const savedMs = await db.milestones.save(payload)
      setMilestones(prev => [...prev, { ...payload, id: savedMs.id }])
      setMsTitle('')
      setMsDesc('')
      setMsStart('')
      setMsEnd('')
      setShowAddMilestoneInline(false)
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to save custom milestone: " + err.message)
    }
  }

  // Add custom team member save to DB
  const handleAddMemberSubmit = async () => {
    if (!inlineName.trim()) {
      setDbError('Consultant name is required')
      return
    }

    if (inlineRole.trim()) {
      const exists = teamMembers.some(tm => tm.role.toLowerCase() === inlineRole.trim().toLowerCase())
      if (exists) {
        setDbError(`Role "${inlineRole}" has already been assigned.`)
        return
      }
    }

    try {
      setDbError(null)
      await saveProjectDetails()

      const payload = {
        project_id: localProjectId,
        name: inlineName.trim(),
        role: inlineRole.trim() || 'Consultant',
        email: `${inlineName.toLowerCase().replace(/[^a-z]/g, '')}@consulting.com`,
        avatar_url: '',
        capacity: 100,
        status: 'available',
        department: inlineDept.trim() || 'Consulting',
        skills: inlineSkills.split(',').map(s => s.trim()).filter(Boolean)
      }

      const savedMember = await db.team_members.save(payload)
      setTeamMembers(prev => [...prev, { ...payload, id: savedMember.id }])
      setInlineName('')
      setInlineRole('')
      setInlineDept('')
      setInlineSkills('')
      setShowAddMemberInline(false)
      await refreshProjects()
    } catch (err) {
      console.error(err)
      setDbError("Failed to save custom team member: " + err.message)
    }
  }

  // Dynamic recommendation check checkmarks
  const isMilestoneAdded = (title) => milestones.some(m => m.title.toLowerCase() === title.toLowerCase())
  const isRoleAdded = (roleName) => teamMembers.some(tm => tm.role.toLowerCase() === roleName.toLowerCase())

  // Exports & Downloaders
  const handleExportPDF = () => {
    console.log("Clicked: Export PDF Button")
    window.print()
  }

  const handleExportDOCX = () => {
    console.log("Clicked: Export DOCX Button")
    const docText = `# PROJECT KICKOFF DOCUMENT: ${formData.projectName || 'New Project'}
Generated on: ${new Date().toLocaleDateString()}
Client Name: ${formData.clientName || 'N/A'}
Project Manager: ${formData.projectManager}
Industry: ${formData.industry}
Priority: ${priority.toUpperCase()}

## 1. Project Overview
${formData.notes || 'No internal notes provided.'}

## 2. Team Assigned
${teamMembers.map((t, i) => `${i + 1}. ${t.name} - ${t.role} (${t.department})`).join('\n')}

## 3. Communication Setup
Meeting Frequencies:
${meetings.map((m, i) => `- ${m.name}: ${m.frequency} on ${m.day_of_week} at ${m.time} (${m.duration})`).join('\n')}

Channels:
${channels.map((c, i) => `- ${c.name} (${c.type}): ${c.channel_url || 'Pending Link'}`).join('\n')}

## 4. Credentials Checklist
${integrations.map(i => `[${i.required ? 'Required' : 'Optional'}] ${i.service} (${i.status})`).join('\n')}

## 5. Timeline & Milestones
${milestones.map((m, i) => `- ${m.title}: ${m.start_date} to ${m.end_date} - Status: ${m.status}`).join('\n')}
`
    const blob = new Blob([docText], { type: 'application/msword' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${(formData.projectName || 'project').toLowerCase().replace(/\s+/g, '-')}-kickoff-document.doc`
    link.click()
  }

  const handleDownloadPackage = () => {
    console.log("Clicked: Download Package Button")
    const fullPackage = {
      version: '1.0.0',
      clientName: formData.clientName,
      projectName: formData.projectName,
      industry: formData.industry,
      projectType: formData.projectType,
      contractValue: formData.contractValue,
      startDate: formData.startDate,
      endDate: formData.endDate,
      projectManager: formData.projectManager,
      notes: formData.notes,
      priority,
      teamMembers,
      channels,
      meetings,
      clientContacts,
      integrations,
      milestones,
      risks,
      deliverables,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(fullPackage, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${(formData.projectName || 'project').toLowerCase().replace(/\s+/g, '-')}-package-configuration.json`
    link.click()
  }

  const handleSharePackage = () => {
    console.log("Clicked: Share Package Button")
    const shareUrl = `${window.location.origin}/preview?client=${encodeURIComponent(formData.clientName)}&project=${encodeURIComponent(formData.projectName)}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Sharing link copied to clipboard!', 'success')
    }).catch(() => {
      showToast('Failed to copy sharing link', 'error')
    })
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    console.log("Clicked: Submit Project Creation Form / Generate Package")
    if (!formData.projectName || !formData.clientName) {
      setDbError('Client Name and Project Name are required in Step 1')
      setCurrentStep(1)
      return
    }

    setLoading(true)

    try {
      // Execute final details save to DB
      await saveProjectDetails({ status: 'active' })

      // Seed starter task in tasks table
      await db.tasks.save({
        project_id: localProjectId,
        title: 'Draft Requirement Specifications document',
        due_date: formData.startDate || new Date().toISOString().split('T')[0],
        priority: 'high',
        status: 'pending',
        owner_name: teamMembers[0]?.name || 'Sarah Jenkins',
        completed: false
      })

      showToast('Project Kickoff Package Generated!', 'success')
      setSuccess(true)
      localStorage.removeItem('ko_project_creation_draft')
      setProjectId(localProjectId)
      await refreshProjects()

      setTimeout(() => {
        setSuccess(false)
        setLoading(false)
        navigate('/dashboard')
      }, 1500)

    } catch (err) {
      setLoading(false)
      setDbError(err.message || 'Error generating kickoff package')
    }
  }

  return (
    <Layout>
      {/* Hidden Print Container for High Fidelity PDF Export */}
      <div className="print-only hidden p-8 max-w-4xl mx-auto space-y-6 text-on-surface bg-white">
        <div className="border-b-4 border-primary pb-4">
          <h1 className="text-3xl font-extrabold text-primary uppercase">PROJECT ONBOARDING STRATEGY KICKOFF RECAP</h1>
          <p className="text-sm text-outline mt-1 font-semibold">Generated by KickoffGen Enterprise Suite on {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6 bg-surface-container/20 p-4 rounded-xl">
          <div>
            <h3 className="font-bold text-sm uppercase text-outline">Project Identity</h3>
            <p className="text-xl font-bold mt-1">{formData.projectName || 'Unnamed Onboarding'}</p>
            <p className="text-sm font-semibold text-on-surface-variant">Client: {formData.clientName || 'N/A'}</p>
            <p className="text-sm text-on-surface-variant">Type: {formData.projectType || 'N/A'} • Industry: {formData.industry}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-sm uppercase text-outline">Onboarding Schedule</h3>
            <p className="text-lg font-bold mt-1">PM: {formData.projectManager}</p>
            <p className="text-sm font-semibold text-on-surface-variant capitalize">Priority: {priority} • Status: Active</p>
            <p className="text-sm text-on-surface-variant">Timeline: {formData.startDate || 'N/A'} — {formData.endDate || 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold border-b border-border-subtle pb-1 uppercase">1. Assigned Delivery Roster</h2>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container/10">
                <th className="py-2 font-bold text-outline uppercase text-xs">Consultant Name</th>
                <th className="py-2 font-bold text-outline uppercase text-xs">Role Title</th>
                <th className="py-2 font-bold text-outline uppercase text-xs">Department</th>
                <th className="py-2 font-bold text-outline uppercase text-xs">Assigned Skills</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m, idx) => (
                <tr key={idx} className="border-b border-border-subtle/50">
                  <td className="py-2 font-bold text-on-surface">{m.name}</td>
                  <td className="py-2 text-on-surface-variant">{m.role}</td>
                  <td className="py-2 text-on-surface-variant">{m.department}</td>
                  <td className="py-2 text-xs text-on-surface-variant font-medium">{(m.skills || []).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold border-b border-border-subtle pb-1 uppercase">2. Timeline & Scheduled Milestones</h2>
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-1">
                <h4 className="font-bold text-sm text-on-surface">{m.title}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">{m.description || 'No description.'}</p>
                <p className="text-[10px] text-outline mt-1 font-semibold">Start: {m.start_date || 'TBD'} • End: {m.end_date || 'TBD'} • Status: Scheduled</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <div className="space-y-3">
            <h2 className="text-base font-bold border-b border-border-subtle pb-1 uppercase">3. Communication Cadence Matrix</h2>
            <ul className="space-y-1.5 text-xs text-on-surface-variant">
              {meetings.map((m, idx) => (
                <li key={idx}>
                  <span className="font-bold text-on-surface">{m.name}</span>: {m.frequency} sync, scheduled on {m.day_of_week}s at {m.time} ({m.duration})
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-base font-bold border-b border-border-subtle pb-1 uppercase">4. Provisioned Credentials</h2>
            <ul className="space-y-1.5 text-xs text-on-surface-variant">
              {integrations.filter(i => i.required).map((i, idx) => (
                <li key={idx}>
                  <span className="font-bold text-on-surface">{i.service}</span>: Required access space ({i.status})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border-subtle text-center text-xs text-outline font-semibold">
          This document was generated in real-time. Unauthorized copies are restricted.
        </div>
      </div>

      <div className="no-print">
        {/* Unsaved Draft Banner */}
        {hasDraft && (
          <div className="bg-surface-container border border-primary/20 rounded-2xl p-4 shadow-sm mb-6 flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-on-surface-variant font-medium">
              <Icon name="restore" className="text-primary" size={20} />
              <span>You have a saved kickoff package draft from a previous session. Would you like to restore it?</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={discardDraft}
                className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-semibold hover:bg-surface-container-low"
              >
                Discard Draft
              </button>
              <button
                type="button"
                onClick={loadDraft}
                className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                Restore Draft
              </button>
            </div>
          </div>
        )}

        {/* Database Error Alert Banner */}
        {dbError && (
          <div className="bg-status-error/10 border border-status-error text-status-error px-4 py-3 rounded-2xl mb-6 flex justify-between items-center text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <Icon name="error_outline" size={18} />
              <span>{dbError}</span>
            </div>
            <button onClick={() => setDbError(null)} className="text-status-error hover:opacity-85">
              <Icon name="close" size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
          {/* Main Area: Hero Section, Stepper, and Workspace Cards */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-accent-vivid text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      AI Onboarding Workspace
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${priority === 'high' ? 'bg-status-error text-white' : priority === 'medium' ? 'bg-status-warning text-white' : 'bg-status-success text-white'}`}>
                      {priority} Priority
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    {formData.projectName || 'Initialize New Package'}
                  </h1>
                  <p className="text-white/85 text-xs mt-1">
                    {formData.clientName ? `Client: ${formData.clientName} • ` : ''} 
                    {formData.projectType ? `Type: ${formData.projectType} • ` : ''} 
                    Status: <span className="font-semibold text-inverse-primary">Draft Workspace</span> • 
                    Created: {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 text-xs active:scale-95"
                  >
                    <Icon name="save" size={16} /> Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 text-xs active:scale-95"
                  >
                    <Icon name="picture_as_pdf" size={16} /> Export PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(6)}
                    className="bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 text-xs active:scale-95"
                  >
                    <Icon name="visibility" size={16} /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-white text-primary hover:opacity-90 font-bold py-1.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs active:scale-95"
                  >
                    {loading ? <Icon name="progress_activity" size={16} className="animate-spin" /> : <Icon name="check_circle" size={16} />}
                    Generate Package
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Workflow Header */}
            <div className="flex justify-between items-center bg-surface-base border border-border-subtle rounded-2xl p-4 shadow-sm overflow-x-auto scroll-hide">
              {[
                { step: 1, label: 'Details', icon: 'info' },
                { step: 2, label: 'Team', icon: 'groups' },
                { step: 3, label: 'Comm Setup', icon: 'forum' },
                { step: 4, label: 'Credentials', icon: 'vpn_key' },
                { step: 5, label: 'Timeline', icon: 'checklist' },
                { step: 6, label: 'Review', icon: 'verified' }
              ].map((s, idx) => (
                <React.Fragment key={s.step}>
                  {idx > 0 && (
                    <div className={`flex-1 h-0.5 min-w-[15px] mx-1 ${currentStep > idx ? 'bg-primary' : 'bg-border-subtle'}`}></div>
                  )}
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s.step)}
                    className={`flex items-center gap-1.5 shrink-0 transition-all ${currentStep === s.step ? 'text-primary font-bold' : currentStep > s.step ? 'text-on-surface' : 'text-outline-variant'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${currentStep === s.step ? 'bg-primary text-white ring-4 ring-primary/20' : currentStep > s.step ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-low border border-border-subtle text-outline'}`}>
                      {currentStep > s.step ? <Icon name="check" size={14} /> : s.step}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold">{s.label}</span>
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Main Interactive Workspace (Step Cards) */}
            <div className="glass-card shadow-lg border border-border-subtle/40 rounded-2xl p-6">
              
              {/* STEP 1: Project Details Form */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 1: Project Details</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Initialize project parameters and metadata</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="client-name">Client Name *</label>
                      <input
                        id="client-name"
                        type="text"
                        required
                        placeholder="Acme Corporation"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="project-name">Project Name *</label>
                      <input
                        id="project-name"
                        type="text"
                        required
                        placeholder="Cloud Infrastructure Migration"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.projectName}
                        onChange={(e) => handleInputChange('projectName', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="industry">Industry</label>
                      <select
                        id="industry"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.industry}
                        onChange={(e) => {
                          handleInputChange('industry', e.target.value)
                          saveProjectDetails({ industry: e.target.value })
                        }}
                      >
                        <option>Financial Services</option>
                        <option>Healthcare</option>
                        <option>Technology</option>
                        <option>Manufacturing</option>
                        <option>Retail</option>
                        <option>Energy</option>
                        <option>Public Sector</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="project-type">Project Type</label>
                      <input
                        id="project-type"
                        type="text"
                        placeholder="Cloud Transformation"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.projectType}
                        onChange={(e) => handleInputChange('projectType', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="contract-value">Contract Value (₹)</label>
                      <input
                        id="contract-value"
                        type="number"
                        placeholder="125000"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.contractValue}
                        onChange={(e) => handleInputChange('contractValue', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="start-date">Start Date</label>
                      <input
                        id="start-date"
                        type="date"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="end-date">End Date</label>
                      <input
                        id="end-date"
                        type="date"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="pm">Project Manager</label>
                      <select
                        id="pm"
                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                        value={formData.projectManager}
                        onChange={(e) => {
                          handleInputChange('projectManager', e.target.value)
                          saveProjectDetails({ projectManager: e.target.value })
                        }}
                      >
                        <option>Sarah Jenkins</option>
                        <option>Mark Thompson</option>
                        <option>David Chen</option>
                        <option>Elena Rostova</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-md text-label-md text-on-surface-variant">Priority Level</label>
                      <div className="flex gap-2">
                        {['low', 'medium', 'high'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => {
                              setPriority(level)
                              saveProjectDetails({ priority: level })
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold capitalize transition-all flex items-center justify-center gap-1.5 ${
                              priority === level
                                ? level === 'high' ? 'border-status-error bg-error-container/20 text-status-error'
                                  : level === 'medium' ? 'border-status-warning bg-status-warning/10 text-status-warning'
                                  : 'border-status-success bg-status-success/10 text-status-success'
                                : 'border-border-subtle hover:bg-surface-container-low text-on-surface-variant'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${level === 'high' ? 'bg-status-error' : level === 'medium' ? 'bg-status-warning' : 'bg-status-success'}`} />
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="notes">Internal Notes</label>
                    <textarea
                      id="notes"
                      rows={4}
                      placeholder="Compliance requirements, primary technical challenges, and key client milestones..."
                      className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      onBlur={handleInputBlur}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Team Assignment */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 2: Team Assignment</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">Assemble delivery team and define key capabilities</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMemberInline(!showAddMemberInline)
                        setDbError(null)
                      }}
                      className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Icon name="add" size={16} /> Add Consultant
                    </button>
                  </div>

                  {/* Team Member Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 shadow-sm flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold font-headline-sm shrink-0">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-bold text-on-surface text-sm">{member.name}</h4>
                            <p className="text-xs text-on-surface-variant opacity-80">{member.role} • {member.department}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(member.skills || []).map((skill, sIdx) => (
                                <span key={sIdx} className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-semibold">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id, idx)}
                          className="text-outline hover:text-status-error transition-all"
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Member form */}
                  {showAddMemberInline && (
                    <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Add New Consultant</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Consultant Name"
                          className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={inlineName}
                          onChange={(e) => setInlineName(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. Lead Dev)"
                          className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={inlineRole}
                          onChange={(e) => setInlineRole(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Department (e.g. Delivery)"
                          className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={inlineDept}
                          onChange={(e) => setInlineDept(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Skills (comma separated, e.g. AWS, Node.js)"
                          className="flex-1 bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={inlineSkills}
                          onChange={(e) => setInlineSkills(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddMemberInline(false)}
                            className="px-3 py-1.5 border border-border-subtle rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddMemberSubmit}
                            className="px-4 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                          >
                            Add Member
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Communication Setup */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 3: Communication Setup</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Set up Slack channels, meetings, and client contacts</p>
                  </div>

                  {/* Slack channels */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="chat" size={16} className="text-primary" /> Slack Channels
                    </h4>
                    {channels.map((ch, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-surface-container-low border border-border-subtle rounded-xl">
                        <div className="space-y-1">
                          <label className="text-[10px] text-on-surface-variant font-bold uppercase">Channel Name</label>
                          <input
                            type="text"
                            className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={ch.name}
                            onChange={(e) => handleChannelChange(idx, 'name', e.target.value)}
                            onBlur={() => handleChannelBlur(ch)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-on-surface-variant font-bold uppercase">Channel URL / Handle</label>
                          <input
                            type="text"
                            placeholder="#proj-acme-cloud"
                            className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={ch.channel_url}
                            onChange={(e) => handleChannelChange(idx, 'channel_url', e.target.value)}
                            onBlur={() => handleChannelBlur(ch)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meeting Frequency */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                        <Icon name="meeting_room" size={16} className="text-primary" /> Meetings Cadence
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMeetingInline(!showAddMeetingInline)
                          setDbError(null)
                        }}
                        className="text-primary hover:bg-primary-fixed/20 px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-0.5"
                      >
                        <Icon name="add" size={14} /> Add Sync
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {meetings.map((m, idx) => (
                        <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-3 flex justify-between items-center text-xs shadow-sm">
                          <div>
                            <span className="font-bold text-on-surface">{m.name}</span>
                            <span className="text-[10px] text-on-surface-variant ml-2 bg-surface-container px-2.5 py-0.5 rounded-full font-bold uppercase">{m.frequency}</span>
                            <div className="text-[10px] text-on-surface-variant opacity-80 mt-1">
                              Day: {m.day_of_week} • Time: {m.time} • Duration: {m.duration} • Attendees: {m.attendees}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (m.id) await db.meetings.delete(m.id)
                                setMeetings(meetings.filter((_, i) => i !== idx))
                                await refreshProjects()
                              } catch (err) {
                                setDbError("Failed to delete meeting: " + err.message)
                              }
                            }}
                            className="text-outline hover:text-status-error transition-all"
                          >
                            <Icon name="close" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {showAddMeetingInline && (
                      <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 text-xs">
                        <h5 className="font-bold uppercase tracking-wider">Add Meeting Sync</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Meeting Name (e.g. Daily Standup)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetName}
                            onChange={(e) => setMeetName(e.target.value)}
                          />
                          <select
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetFreq}
                            onChange={(e) => setMeetFreq(e.target.value)}
                          >
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Bi-weekly</option>
                            <option>Monthly</option>
                          </select>
                          <select
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetDay}
                            onChange={(e) => setMeetDay(e.target.value)}
                          >
                            <option>Monday</option>
                            <option>Tuesday</option>
                            <option>Wednesday</option>
                            <option>Thursday</option>
                            <option>Friday</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Time (e.g. 10:00 AM)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetTime}
                            onChange={(e) => setMeetTime(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g. 30 mins)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5"
                            value={meetDuration}
                            onChange={(e) => setMeetDuration(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddMeetingInline(false)}
                              className="flex-1 border border-border-subtle rounded font-semibold text-xs py-1"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!meetName.trim()) {
                                  setDbError('Meeting name is required')
                                  return
                                }
                                try {
                                  setDbError(null)
                                  await saveProjectDetails()
                                  
                                  const attendeesText = teamMembers.map(t => t.name).join(', ')
                                  const savedMeet = await db.meetings.save({
                                    project_id: localProjectId,
                                    name: meetName.trim(),
                                    frequency: meetFreq,
                                    day_of_week: meetDay,
                                    time: meetTime || '10:00 AM',
                                    duration: meetDuration || '30 mins',
                                    attendees: teamMembers.map(t => t.name)
                                  })

                                  setMeetings([...meetings, {
                                    id: savedMeet.id,
                                    name: meetName.trim(),
                                    frequency: meetFreq,
                                    day_of_week: meetDay,
                                    time: meetTime || '10:00 AM',
                                    duration: meetDuration || '30 mins',
                                    attendees: attendeesText
                                  }])
                                  setMeetName('')
                                  setShowAddMeetingInline(false)
                                  await refreshProjects()
                                } catch (err) {
                                  setDbError("Failed to save meeting: " + err.message)
                                }
                              }}
                              className="flex-1 bg-primary text-white rounded font-bold text-xs hover:opacity-90 active:scale-95 transition-all py-1"
                            >
                              Save Sync
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Client Contacts */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                        <Icon name="contact_phone" size={16} className="text-primary" /> Client Stakeholders
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddContactInline(!showAddContactInline)
                          setDbError(null)
                        }}
                        className="text-primary hover:bg-primary-fixed/20 px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-0.5"
                      >
                        <Icon name="add" size={14} /> Add Contact
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {clientContacts.map((cc, idx) => (
                        <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 shadow-sm flex justify-between items-start text-xs">
                          <div>
                            <h5 className="font-bold text-on-surface text-sm">{cc.name}</h5>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-0.5">{cc.role} {cc.organization ? `at ${cc.organization}` : ''}</p>
                            <div className="text-xs text-on-surface-variant opacity-85 mt-2 space-y-1">
                              <p className="flex items-center gap-1"><Icon name="mail" size={12} /> {cc.email}</p>
                              <p className="flex items-center gap-1"><Icon name="phone" size={12} /> {cc.phone}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                if (cc.id) await db.stakeholders.delete(cc.id)
                                setClientContacts(clientContacts.filter((_, i) => i !== idx))
                                await refreshProjects()
                              } catch (err) {
                                setDbError("Failed to delete contact: " + err.message)
                              }
                            }}
                            className="text-outline hover:text-status-error transition-all"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {showAddContactInline && (
                      <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 text-xs">
                        <h5 className="font-bold uppercase tracking-wider">Add Stakeholder</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Name (e.g. Alice Smith)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Role (e.g. Sponsor)"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={contactRole}
                            onChange={(e) => setContactRole(e.target.value)}
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Phone Number"
                            className="bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddContactInline(false)}
                            className="px-3 py-1.5 border border-border-subtle rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!contactName.trim()) {
                                setDbError('Stakeholder name is required')
                                return
                              }
                              try {
                                setDbError(null)
                                await saveProjectDetails()

                                const savedContact = await db.stakeholders.save({
                                  project_id: localProjectId,
                                  name: contactName.trim(),
                                  role: contactRole.trim() || 'Stakeholder',
                                  organization: formData.clientName || 'Draft Client',
                                  email: contactEmail.trim(),
                                  phone: contactPhone.trim()
                                })

                                setClientContacts([...clientContacts, {
                                  id: savedContact.id,
                                  name: contactName.trim(),
                                  role: contactRole.trim() || 'Stakeholder',
                                  organization: formData.clientName,
                                  email: contactEmail.trim(),
                                  phone: contactPhone.trim()
                                }])
                                setContactName('')
                                setContactRole('')
                                setContactEmail('')
                                setContactPhone('')
                                setShowAddContactInline(false)
                                await refreshProjects()
                              } catch (err) {
                                setDbError("Failed to save contact: " + err.message)
                              }
                            }}
                            className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                          >
                            Save Contact
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Credentials Check */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 4: Integration Credentials</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Set required environments, repositories, and workspace access</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((inte, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleIntegration(idx)}
                        className={`border rounded-xl p-4 cursor-pointer transition-all flex justify-between items-start ${inte.required ? 'border-primary bg-primary-container/5 shadow-sm' : 'border-border-subtle hover:bg-surface-container-low bg-surface-container-lowest'}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-on-surface text-sm">{inte.service}</h4>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${inte.required ? 'bg-primary text-white' : 'bg-surface-container text-outline'}`}>
                              {inte.required ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant opacity-80 leading-normal">{inte.description}</p>
                          <div className="flex items-center gap-1.5 pt-2.5">
                            <span className={`w-2 h-2 rounded-full ${inte.status === 'active' ? 'bg-status-success' : 'bg-status-warning animate-pulse'}`} />
                            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">{inte.status === 'active' ? 'provisioned' : 'pending generation'}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${inte.required ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-white'}`}>
                          {inte.required && <Icon name="check" size={14} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Timeline & Milestones */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 5: Timeline & Milestones</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">Plot scheduled deliverables and inspect onboarding risks</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMilestoneInline(!showAddMilestoneInline)
                        setDbError(null)
                      }}
                      className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Icon name="add" size={16} /> Add Milestone
                    </button>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-3">
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
                            className="text-outline hover:text-status-error transition-all"
                          >
                            <Icon name="delete" size={16} />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border-subtle text-xs text-on-surface-variant font-medium">
                          <span className="flex items-center gap-1"><Icon name="calendar_today" size={14} /> Start: {m.start_date || 'Project Start'}</span>
                          <span className="flex items-center gap-1"><Icon name="event" size={14} /> End: {m.end_date || 'Project Start'}</span>
                          <span className="flex items-center gap-1 capitalize">
                            <span className={`w-2 h-2 rounded-full ${m.status === 'in_progress' ? 'bg-primary' : m.status === 'completed' ? 'bg-status-success' : 'bg-outline-variant'}`} />
                            Status: {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showAddMilestoneInline && (
                    <div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl space-y-3 text-xs">
                      <h4 className="font-bold uppercase tracking-wider">Add Custom Milestone</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Milestone Title (e.g. Architecture Approval)"
                          className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={msTitle}
                          onChange={(e) => setMsTitle(e.target.value)}
                        />
                        <textarea
                          placeholder="Milestone Description"
                          rows={2}
                          className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs"
                          value={msDesc}
                          onChange={(e) => setMsDesc(e.target.value)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-on-surface-variant">Start Date</label>
                            <input
                              type="date"
                              className="w-full bg-surface-base border border-border-subtle rounded px-2 py-1 text-xs"
                              value={msStart}
                              onChange={(e) => setMsStart(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-on-surface-variant">End Date</label>
                            <input
                              type="date"
                              className="w-full bg-surface-base border border-border-subtle rounded px-2 py-1 text-xs"
                              value={msEnd}
                              onChange={(e) => setMsEnd(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMilestoneInline(false)}
                          className="px-3 py-1.5 border border-border-subtle rounded text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddMilestoneSubmit}
                          className="px-4 py-1.5 bg-primary text-white rounded text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                        >
                          Schedule Milestone
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Risks Assessment Section */}
                  <div className="space-y-4 pt-4 border-t border-border-subtle">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="warning" size={16} className="text-status-warning" /> Risk Assessment Matrix
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.keys(risks).map((riskKey) => (
                        <div key={riskKey} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-3 shadow-sm text-center">
                          <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-2">{riskKey} Risk</span>
                          <div className="flex flex-col gap-1.5">
                            {['low', 'medium', 'high'].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setRisks({ ...risks, [riskKey]: lvl })}
                                className={`py-1 rounded text-xs font-bold transition-all border capitalize ${
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
                </div>
              )}

              {/* STEP 6: Review & Generate */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 6: Review & Generate</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Validate details and select export format packages</p>
                  </div>

                  {/* Summary card review */}
                  <div className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-4 space-y-4 shadow-sm text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Project Identity</span>
                        <p className="font-bold text-on-surface text-sm mt-1">{formData.projectName || 'Unnamed Project'}</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Client: {formData.clientName || 'N/A'} • {formData.projectType || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider">Priority & Schedule</span>
                        <p className="font-bold text-on-surface capitalize mt-1">{priority} Priority</p>
                        <p className="text-xs text-on-surface-variant font-medium mt-0.5">{formData.startDate || 'No start'} to {formData.endDate || 'No end'}</p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-border-subtle grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div>
                        <span className="text-outline font-bold uppercase block mb-1">Consultants</span>
                        <span className="font-bold text-on-surface text-xs">{teamMembers.length} Assigned</span>
                      </div>
                      <div>
                        <span className="text-outline font-bold uppercase block mb-1">Milestones</span>
                        <span className="font-bold text-on-surface text-xs">{milestones.length} Scheduled</span>
                      </div>
                      <div>
                        <span className="text-outline font-bold uppercase block mb-1">Credentials Required</span>
                        <span className="font-bold text-on-surface text-xs">{integrations.filter(i => i.required).length} Required</span>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="inventory" size={16} className="text-primary" /> Deliverables Checklists
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'kickoffDocument', label: 'Kickoff Document', desc: 'Kickoff strategy presentation deck & initial agenda.' },
                        { key: 'projectCharter', label: 'Project Charter', desc: 'Core alignment charter signed by sponsors.' },
                        { key: 'teamDirectory', label: 'Team Directory', desc: 'Roles roster and escalation contacts directory.' },
                        { key: 'communicationMatrix', label: 'Communication Matrix', desc: 'Slack guidelines and meeting schedules.' },
                        { key: 'timelinePlan', label: 'Timeline Plan', desc: 'Target milestones and delivery deadlines.' },
                        { key: 'credentialsSheet', label: 'Credentials Sheet', desc: 'AWS/GitHub secure environments catalog.' }
                      ].map((item) => (
                        <div
                          key={item.key}
                          onClick={() => setDeliverables({ ...deliverables, [item.key]: !deliverables[item.key] })}
                          className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${deliverables[item.key] ? 'border-primary bg-primary-container/5 shadow-sm' : 'border-border-subtle bg-surface-container-lowest hover:bg-surface-container-low'}`}
                        >
                          <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${deliverables[item.key] ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-white'}`}>
                            {deliverables[item.key] && <Icon name="check" size={12} />}
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-on-surface">{item.label}</h5>
                            <p className="text-[10px] text-on-surface-variant opacity-75 mt-0.5 leading-normal">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons footer */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={handleDownloadPackage}
                      className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95"
                    >
                      <Icon name="download" size={16} /> Download JSON
                    </button>
                    <button
                      type="button"
                      onClick={handleExportDOCX}
                      className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95"
                    >
                      <Icon name="description" size={16} /> Export DOCX
                    </button>
                    <button
                      type="button"
                      onClick={handleSharePackage}
                      className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm active:scale-95"
                    >
                      <Icon name="share" size={16} /> Share Link
                    </button>
                  </div>
                </div>
              )}

              {/* Stepper Navigation buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-border-subtle/50 mt-6">
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className={`px-4 py-2 border rounded-xl font-semibold text-xs flex items-center gap-1 transition-all ${currentStep === 1 ? 'border-border-subtle text-outline-variant bg-surface-container-low cursor-not-allowed' : 'border-border-subtle text-on-surface hover:bg-surface-container-low active:scale-95'}`}
                >
                  <Icon name="arrow_back" size={16} /> Back
                </button>
                
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-5 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
                  >
                    Next <Icon name="arrow_forward" size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-primary to-accent-vivid text-white font-bold text-xs rounded-xl hover:opacity-95 shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    {loading ? <Icon name="progress_activity" size={16} className="animate-spin" /> : <Icon name="check_circle" size={16} />}
                    Generate Onboarding Package
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: AI Assistant, Quality Score, and Live Preview */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Package Quality Score Card */}
            <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[10px] uppercase text-outline tracking-wider">Package Completeness</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${completenessScore >= 80 ? 'bg-status-success/15 text-status-success' : completenessScore >= 40 ? 'bg-status-warning/15 text-status-warning' : 'bg-status-error/15 text-status-error'}`}>
                  {completenessScore}% Complete
                </span>
              </div>
              
              <div className="w-full bg-surface-container rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${completenessScore >= 80 ? 'bg-status-success' : completenessScore >= 40 ? 'bg-status-warning' : 'bg-status-error'}`}
                  style={{ width: `${completenessScore}%` }}
                ></div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-on-surface-variant">
                {[
                  { label: 'Project Details Filled', ok: completenessChecks.details, step: 1 },
                  { label: 'Delivery Team Assigned', ok: completenessChecks.team, step: 2 },
                  { label: 'Communication Cadence Setup', ok: completenessChecks.communication, step: 3 },
                  { label: 'Required Credentials Selected', ok: completenessChecks.credentials, step: 4 },
                  { label: 'Timeline Milestones Added', ok: completenessChecks.milestones, step: 5 }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentStep(item.step)}
                    className="flex justify-between items-center py-1 cursor-pointer hover:text-primary transition-colors border-b border-b-border-subtle/30 last:border-b-0 pb-1 last:pb-0"
                  >
                    <span className="flex items-center gap-2">
                      <Icon
                        name={item.ok ? 'check_circle' : 'cancel'}
                        size={16}
                        className={item.ok ? 'text-status-success' : 'text-outline-variant'}
                        filled={item.ok}
                      />
                      {item.label}
                    </span>
                    <Icon name="chevron_right" size={14} className="text-outline-variant" />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Onboarding Assistant Panel */}
            <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 border-b border-border-subtle pb-3">
                <Icon name="auto_awesome" size={20} className="text-primary" />
                <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider">AI Kickoff Assistant</h4>
              </div>

              <div className="bg-primary-container/5 border border-primary/10 rounded-xl p-3 text-xs text-on-surface-variant font-medium leading-relaxed">
                <p className="italic text-primary font-bold mb-1">Smart Advisor Recommendation:</p>
                {aiRecs.advice}
              </div>

              {/* Suggested Milestones */}
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase text-outline tracking-wider block">Recommended Milestones</span>
                <div className="flex flex-col gap-1.5">
                  {aiRecs.recommendedMilestones.map((ms, idx) => {
                    const added = isMilestoneAdded(ms.title)
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={added}
                        onClick={() => handleAddSuggestedMilestone(ms)}
                        className={`text-left p-2 rounded-lg font-semibold flex justify-between items-center transition-colors border active:scale-98 ${added ? 'bg-status-success/5 border-status-success/20 text-status-success opacity-85 cursor-default' : 'bg-surface-container border-border-subtle/40 hover:bg-surface-container-high text-on-surface-variant'}`}
                      >
                        <div className="pr-2">
                          <p className="font-bold text-xs">{ms.title}</p>
                          <p className="text-[10px] opacity-75 font-normal">{ms.description.slice(0, 50)}...</p>
                        </div>
                        <Icon name={added ? 'check' : 'add'} size={16} className="text-primary shrink-0" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Suggested Roles */}
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase text-outline tracking-wider block">Recommended Team Roles</span>
                <div className="flex flex-wrap gap-1.5">
                  {aiRecs.recommendedRoles.map((roleRec, idx) => {
                    const added = isRoleAdded(roleRec.role)
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={added}
                        onClick={() => handleAddSuggestedRole(roleRec)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] flex items-center gap-1 border active:scale-95 ${added ? 'bg-status-success/5 border-status-success/20 text-status-success cursor-default' : 'bg-surface-container border-border-subtle/40 hover:bg-surface-container-high text-on-surface-variant'}`}
                      >
                        <Icon name={added ? 'check' : 'add'} size={12} className="text-primary" />
                        {roleRec.role} {added ? '(Added)' : ''}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Suggested Freq */}
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase text-outline tracking-wider block">Recommended Cadence</span>
                <button
                  type="button"
                  onClick={() => handleApplySuggestedFreq(aiRecs.recommendedFreq)}
                  className="w-full text-left bg-surface-container hover:bg-surface-container-high p-2 rounded-lg font-semibold text-on-surface-variant flex justify-between items-center transition-colors border border-border-subtle/40 active:scale-98"
                >
                  <div>
                    <p className="font-bold text-on-surface text-xs">{aiRecs.recommendedFreq}</p>
                    <p className="text-[10px] opacity-75 font-normal">Apply team sync template</p>
                  </div>
                  <Icon name="add" size={16} className="text-primary shrink-0" />
                </button>
              </div>

              {/* Risk Warnings */}
              {aiRecs.riskWarnings.length > 0 && (
                <div className="space-y-2 text-xs border-t border-border-subtle pt-3">
                  <span className="font-bold uppercase text-status-error tracking-wider block">Workspace Risk Alerts</span>
                  <div className="space-y-1.5">
                    {aiRecs.riskWarnings.map((warn, idx) => (
                      <div key={idx} className="bg-status-error/5 border border-status-error/15 text-status-error p-2.5 rounded-lg font-medium flex gap-1.5">
                        <Icon name="error_outline" size={14} className="shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-normal">{warn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation History Ledger Section */}
              {addedRecommendationsHistory.length > 0 && (
                <div className="space-y-2 text-xs border-t border-border-subtle pt-3">
                  <span className="font-bold uppercase text-outline tracking-wider block">Previously Added Recommendations</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {addedRecommendationsHistory.map((item) => (
                      <div key={item.id} className="p-2 border border-border-subtle rounded-lg flex justify-between items-center text-[10px] bg-surface-container-lowest">
                        <div>
                          <p className="font-bold text-on-surface truncate max-w-[150px]">{item.name}</p>
                          <p className="opacity-70 text-[9px] mt-0.5">By: {item.addedBy} • {item.addedDate.split(',')[0]}</p>
                        </div>
                        <div>
                          {item.status === 'active' ? (
                            <span className="text-status-success bg-status-success/10 px-2 py-0.5 rounded-full font-bold uppercase text-[8px]">Active</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestoreRecommendation(item)}
                              className="text-primary hover:underline font-bold text-[9px] flex items-center gap-0.5"
                            >
                              <Icon name="restore" size={10} /> Restore
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview Panel */}
            <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-1.5">
                  <Icon name="preview" size={20} className="text-primary" />
                  <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider">Live Preview</h4>
                </div>
                <span className="text-[9px] bg-status-success/15 text-status-success font-bold px-2 py-0.5 rounded-full animate-pulse uppercase">Active</span>
              </div>

              <div className="space-y-3 text-xs leading-normal">
                <div>
                  <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Client Identity</span>
                  <span className="font-bold text-on-surface">{formData.clientName || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-[9px] text-outline font-bold uppercase tracking-wider block">Assigned Lead (PM)</span>
                  <span className="font-bold text-on-surface">{formData.projectManager}</span>
                </div>

                {teamMembers.length > 0 && (
                  <div>
                    <span className="text-[9px] text-outline font-bold uppercase tracking-wider block mb-1">Team Structure Roster ({teamMembers.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {teamMembers.map((m, idx) => (
                        <span key={idx} className="bg-primary-container/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-semibold text-[10px]">
                          {m.name} ({m.role.split(' ')[0]})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {milestones.length > 0 && (
                  <div>
                    <span className="text-[9px] text-outline font-bold uppercase tracking-wider block mb-1">Onboarding Milestones Timeline ({milestones.length})</span>
                    <div className="space-y-1">
                      {milestones.map((m, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-surface-container/40 p-1.5 rounded text-[10px] border border-border-subtle/10">
                          <span className="font-bold text-on-surface-variant truncate mr-2">{m.title}</span>
                          <span className="text-[9px] text-outline shrink-0 font-medium">{m.start_date || 'TBD'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {meetings.length > 0 && (
                  <div>
                    <span className="text-[9px] text-outline font-bold uppercase tracking-wider block mb-1">Sync Channels Cadence</span>
                    <div className="space-y-1">
                      {meetings.map((m, idx) => (
                        <p key={idx} className="font-semibold text-on-surface-variant text-[10px] flex items-center gap-1">
                          <Icon name="today" size={12} className="text-primary" /> {m.name} ({m.frequency})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Package Overview Cards */}
            <div className="bg-surface-base border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
              <span className="font-bold text-[10px] uppercase text-outline tracking-wider block">Overview Checklists</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                {[
                  { label: 'Project Info', ok: completenessChecks.details, step: 1 },
                  { label: 'Team Roster', ok: completenessChecks.team, step: 2 },
                  { label: 'Communication Plan', ok: completenessChecks.communication, step: 3 },
                  { label: 'Credentials Access', ok: completenessChecks.credentials, step: 4 },
                  { label: 'Timeline Milestones', ok: completenessChecks.milestones, step: 5 },
                  { label: 'Risk Assessment', ok: true, step: 5 },
                  { label: 'Deliverables List', ok: Object.values(deliverables).some(Boolean), step: 6 },
                  { label: 'Client Contacts', ok: clientContacts.length > 0, step: 3 }
                ].map((card, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentStep(card.step)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-14 ${card.ok ? 'border-status-success/30 bg-status-success/5 text-status-success' : 'border-border-subtle hover:bg-surface-container-low text-outline-variant'}`}
                  >
                    <span>{card.label}</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[8px] uppercase tracking-wider font-semibold">{card.ok ? 'Complete' : 'Pending'}</span>
                      <Icon name={card.ok ? 'check_circle' : 'pending'} size={14} className={card.ok ? 'text-status-success' : 'text-outline-variant'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  )
}
