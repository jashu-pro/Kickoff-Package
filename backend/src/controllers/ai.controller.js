export const getAIRecommendations = async (req, res, next) => {
  try {
    const { industry = 'Financial Services', projectType = 'Cloud Transformation', contractValue = 0, teamSize = 1, startDate, endDate } = req.body

    const type = projectType.toLowerCase()
    const ind = industry.toLowerCase()
    const budget = parseFloat(contractValue) || 0

    let recommendedMilestones = []
    let recommendedRoles = []
    let recommendedFreq = 'Weekly Sync'
    let riskWarnings = []
    let advice = 'Establish clean collaboration spaces and communication cadences early.'

    let recommendedArchitecture = 'Monolithic'
    let recommendedTechStack = ['React', 'Node.js', 'PostgreSQL']
    let recommendedIntegrations = ['GitHub', 'Jira', 'Slack']
    let aiConfidenceScore = 85

    if (ind.includes('financial') || ind.includes('finance') || ind.includes('bank')) {
      advice = 'Financial Services project: Prioritize PCI DSS guidelines, security audits, and data governance.'
      recommendedArchitecture = 'Microservices with Event Sourcing'
      recommendedTechStack = ['React', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Redis']
      recommendedIntegrations = ['Jira', 'Confluence', 'AWS', 'Datadog', 'Security Setup']
      aiConfidenceScore = 92
      recommendedMilestones.push(
        { title: 'PCI DSS Review', description: 'Evaluate cardholder data environment compliance.', durationDays: 5 },
        { title: 'Security Audit', description: 'System security verification and network scans.', durationDays: 6 },
        { title: 'Encryption Validation', description: 'Confirm SSL/TLS protocols and databases encryption.', durationDays: 4 }
      )
      recommendedRoles.push({ name: 'SecOps Architect', role: 'Security Specialist', department: 'Security', skills: ['PCI DSS', 'IAM', 'TLS'] })
    } else if (ind.includes('health') || ind.includes('medical')) {
      advice = 'Healthcare project: Ensure HIPAA compliance and secure patient data encryption audits.'
      recommendedArchitecture = 'Serverless Microservices'
      recommendedTechStack = ['Next.js', 'Node.js', 'MongoDB', 'AWS HealthLake']
      recommendedIntegrations = ['GitHub', 'Jira', 'AWS', 'Sentry']
      aiConfidenceScore = 95
      recommendedMilestones.push(
        { title: 'HIPAA Compliance Audit', description: 'Validate patient record security and audit logging.', durationDays: 6 },
        { title: 'Data Protection Review', description: 'Verify transport security and access logging.', durationDays: 5 }
      )
      recommendedRoles.push({ name: 'Compliance Officer', role: 'HIPAA Auditor', department: 'Auditing', skills: ['HIPAA', 'Encryption'] })
    } else if (ind.includes('retail') || ind.includes('e-commerce') || ind.includes('commerce')) {
      advice = 'E-Commerce project: Load testing and payment integrations are critical.'
      recommendedArchitecture = 'MACH Architecture (Microservices, API-first, Cloud-native, Headless)'
      recommendedTechStack = ['Vue.js', 'Go', 'Redis', 'PostgreSQL', 'ElasticSearch']
      recommendedIntegrations = ['GitHub', 'Slack', 'Vercel', 'Stripe (Custom)']
      aiConfidenceScore = 88
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
      recommendedArchitecture = 'Cloud-Native Containerized'
      recommendedTechStack = ['Docker', 'Kubernetes', 'Terraform', 'AWS/GCP']
      recommendedIntegrations.push('Grafana', 'AWS')
      recommendedMilestones.push(
        { title: 'Cloud Landing Zone Setup', description: 'Configure IAM policies, VPC subnetting, and logging.', durationDays: 7 }
      )
      recommendedRoles.push({ name: 'Cloud Expert', role: 'Cloud Solutions Architect', department: 'Cloud Ops', skills: ['Terraform', 'AWS', 'IAM'] })
    } else if (type.includes('devops') || type.includes('pipeline') || type.includes('ci')) {
      recommendedMilestones.push(
        { title: 'Pipeline CI/CD Automation', description: 'Establish main build and deployment pipelines.', durationDays: 6 }
      )
      recommendedRoles.push({ name: 'DevOps Lead', role: 'DevOps Engineer', department: 'Ops', skills: ['Docker', 'CI/CD'] })
    } else if (type.includes('ai') || type.includes('ml') || type.includes('data')) {
      recommendedArchitecture = 'Data Lakehouse with Retrieval-Augmented Generation (RAG)'
      recommendedTechStack = ['Python', 'FastAPI', 'Pinecone', 'LangChain', 'OpenAI']
      recommendedIntegrations.push('OpenAI', 'Pinecone')
      aiConfidenceScore = 94
      recommendedMilestones.push(
        { title: 'Model Selection & Training', description: 'Evaluate LLMs and fine-tune data.', durationDays: 14 }
      )
      recommendedRoles.push({ name: 'AI Lead', role: 'AI/ML Engineer', department: 'Data', skills: ['Python', 'LLMs', 'Vector DBs'] })
    } else if (type.includes('saas') || type.includes('app') || type.includes('develop')) {
      recommendedMilestones.push(
        { title: 'Figma Mockup Design Signoff', description: 'Acquire user experience design signoff.', durationDays: 5 },
        { title: 'Client Acceptance Test (UAT)', description: 'Ensure all functional requirements are validated.', durationDays: 6 }
      )
      recommendedRoles.push({ name: 'Lead Dev', role: 'Senior React Developer', department: 'Delivery', skills: ['React', 'Node.js'] })
    }

    if (budget > 100000) {
      advice += ' High-budget project: Setup regular Steering Committee reviews and quality gates.'
      recommendedRoles.push({ name: 'Delivery Director', role: 'PMO Lead', department: 'Leadership', skills: ['PMO', 'Governance'] })
    }

    if (startDate && endDate) {
      const diffDays = Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
      if (diffDays < 30) {
        riskWarnings.push('Timeline Risk: Active project span is under 30 days. Risk of schedule compression.')
      }
    }

    if (teamSize < 2) {
      riskWarnings.push('Resource Risk: Only 1 team member assigned. Single point of failure risk.')
    }

    // De-duplicate recommended arrays
    recommendedTechStack = [...new Set(recommendedTechStack)]
    recommendedIntegrations = [...new Set(recommendedIntegrations)]

    return res.status(200).json({
      recommendedMilestones,
      recommendedRoles,
      recommendedFreq,
      riskWarnings,
      advice,
      recommendedArchitecture,
      recommendedTechStack,
      recommendedIntegrations,
      aiConfidenceScore
    })
  } catch (error) {
    next(error)
  }
}
