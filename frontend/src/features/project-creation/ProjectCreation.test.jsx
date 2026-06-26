import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ProjectCreation } from './ProjectCreation'

vi.mock('./hooks/useProjectForm', () => ({
  useProjectForm: () => ({
    currentStep: 1,
    setCurrentStep: vi.fn(),
    formData: { clientName: '', projectName: '' },
    handleInputChange: vi.fn(),
    handleInputBlur: vi.fn(),
    priority: 'medium',
    setPriority: vi.fn(),
    teamMembers: [],
    milestones: [],
    clientContacts: [],
    meetings: [],
    integrations: [],
    risks: { timeline: 'low' },
    deliverables: {},
    completenessScore: 10,
    completenessChecks: { details: false },
    aiRecs: { recommendedMilestones: [], recommendedRoles: [], riskWarnings: [], advice: 'Test advice' },
    addedRecommendationsHistory: []
  })
}))

vi.mock('../../context/ProjectContext', () => ({
  useProject: () => ({
    projects: [],
    userProfile: { fullName: 'Test User' }
  })
}))

describe('Project Creation Workflow', () => {
  it('renders step 1 by default', () => {
    render(
      <MemoryRouter>
        <ProjectCreation />
      </MemoryRouter>
    )
    
    expect(screen.getByText(/Project Details/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e\.g\., Acme Corp/i)).toBeInTheDocument()
  })
})
