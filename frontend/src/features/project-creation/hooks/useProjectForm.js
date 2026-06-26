
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../../../context/ProjectContext'
import { useToast } from '../../../components/Toast'
import { db, generateUUID } from '../../../lib/db'

export const useProjectForm = () => {
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
      }, !projectSavedInDb)

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
        owner_id: teamMembers[0]?.id || null
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


  return {
    localProjectId,
    projectSavedInDb,
    setProjectSavedInDb,
    currentStep,
    setCurrentStep,
    hasDraft,
    setHasDraft,
    loading,
    setLoading,
    success,
    setSuccess,
    dbError,
    setDbError,
    priority,
    setPriority,
    formData,
    setFormData,
    teamMembers,
    setTeamMembers,
    showAddMemberInline,
    setShowAddMemberInline,
    inlineName,
    setInlineName,
    inlineRole,
    setInlineRole,
    inlineDept,
    setInlineDept,
    inlineSkills,
    setInlineSkills,
    channels,
    setChannels,
    meetings,
    setMeetings,
    clientContacts,
    setClientContacts,
    showAddContactInline,
    setShowAddContactInline,
    contactName,
    setContactName,
    contactRole,
    setContactRole,
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    showAddMeetingInline,
    setShowAddMeetingInline,
    meetName,
    setMeetName,
    meetFreq,
    setMeetFreq,
    meetDay,
    setMeetDay,
    meetTime,
    setMeetTime,
    meetDuration,
    setMeetDuration,
    integrations,
    setIntegrations,
    milestones,
    setMilestones,
    showAddMilestoneInline,
    setShowAddMilestoneInline,
    msTitle,
    setMsTitle,
    msDesc,
    setMsDesc,
    msStart,
    setMsStart,
    msEnd,
    setMsEnd,
    risks,
    setRisks,
    deliverables,
    setDeliverables,
    addedRecommendationsHistory,
    setAddedRecommendationsHistory,
    // newly exported variables to fix inline handlers in step components
    db,
    saveProjectDetails,
    handleInputBlur,
    discardDraft,
    loadDraft,
    saveDraft,
    completenessScore,
    completenessChecks,
    handleRestoreRecommendation,
    aiRecs,
    handleAddSuggestedRole,
    handleApplySuggestedFreq,
    handleAddSuggestedMilestone,
    handleSubmit,
    handleExportJSON: handleDownloadPackage,
    handleSharePackage,
    handleInputChange,
    handleChannelChange,
    handleDeleteMilestone,
    handleDeleteMember,
    handleChannelBlur,
    handleToggleIntegration,
    handleAddMilestoneSubmit,
    handleAddMemberSubmit,
    handleExportPDF,
    handleExportDOCX
  }
}
