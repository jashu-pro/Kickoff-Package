import PDFDocument from 'pdfkit'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

export const generatePDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers = []
      
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData.toString('base64'))
      })
      doc.on('error', reject)

      // Helper function for section titles
      const sectionTitle = (title) => {
        doc.addPage()
        doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' })
        doc.moveDown()
      }

      const addField = (label, value) => {
        if (value) {
          doc.fontSize(12).font('Helvetica-Bold').text(`${label}: `, { continued: true })
             .font('Helvetica').text(value)
          doc.moveDown(0.5)
        }
      }

      // 1. Executive Summary (Title Page)
      doc.fontSize(28).font('Helvetica-Bold').text('Project Kickoff Package', { align: 'center', underline: true })
      doc.moveDown(2)
      doc.fontSize(18).text(`Project: ${data.projectName || 'Untitled Project'}`, { align: 'center' })
      doc.fontSize(14).text(`Client: ${data.clientName || 'N/A'}`, { align: 'center' })
      doc.text(`Manager: ${data.projectManager || 'N/A'}`, { align: 'center' })
      doc.moveDown(2)
      
      addField('Industry', data.industry)
      addField('Project Type', data.projectType)
      addField('Contract Value', data.contractValue ? `${data.billingCurrency || '$'} ${data.contractValue}` : null)
      addField('Duration', data.estimatedDuration)
      addField('Priority', data.priority)

      // 2. Project Charter
      sectionTitle('Project Charter')
      addField('Business Goal', data.businessGoal)
      addField('Technical Scope', data.technicalScope)
      addField('Success Criteria', data.successCriteria)
      addField('Dependencies', data.dependencies)
      addField('Known Constraints', data.knownConstraints)
      addField('Special Instructions', data.specialInstructions)

      // 3. Architecture & AI Recommendations
      sectionTitle('Architecture & Recommendations')
      if (data.aiRecs && data.aiRecs.recommendedArchitecture) {
        addField('AI Match Score', `${data.aiRecs.aiConfidenceScore}%`)
        addField('Recommended Architecture', data.aiRecs.recommendedArchitecture)
        addField('Tech Stack', (data.aiRecs.recommendedTechStack || []).join(', '))
        addField('Integrations', (data.aiRecs.recommendedIntegrations || []).join(', '))
        
        doc.moveDown()
        doc.fontSize(14).font('Helvetica-Bold').text('AI Strategic Advice:')
        doc.fontSize(12).font('Helvetica').text(data.aiRecs.advice || 'N/A')
      } else {
        doc.fontSize(12).text('No AI recommendations generated.')
      }

      // 4. Team Directory
      sectionTitle('Team Directory')
      if (data.teamMembers && data.teamMembers.length > 0) {
        data.teamMembers.forEach((member, i) => {
          doc.fontSize(14).font('Helvetica-Bold').text(`${i + 1}. ${member.name}`)
          doc.fontSize(12).font('Helvetica').text(`Role: ${member.role} | Dept: ${member.department || 'Consulting'}`)
          if (member.skills && member.skills.length > 0) {
            doc.text(`Skills: ${member.skills.join(', ')}`)
          }
          doc.moveDown()
        })
      } else {
        doc.fontSize(12).text('No team members assigned.')
      }

      // 5. Stakeholder Matrix
      sectionTitle('Stakeholder Matrix')
      if (data.clientContacts && data.clientContacts.length > 0) {
        data.clientContacts.forEach((cc, i) => {
          doc.fontSize(14).font('Helvetica-Bold').text(`${i + 1}. ${cc.name} - ${cc.role}`)
          doc.fontSize(12).font('Helvetica').text(`Org: ${cc.organization || data.clientName}`)
          doc.text(`Email: ${cc.email} | Phone: ${cc.phone}`)
          doc.moveDown()
        })
      } else {
        doc.fontSize(12).text('No external stakeholders provided.')
      }

      // 6. Communication Plan
      sectionTitle('Communication Plan')
      doc.fontSize(14).font('Helvetica-Bold').text('Slack Channels')
      if (data.channels && data.channels.length > 0) {
        data.channels.forEach(ch => {
          doc.fontSize(12).font('Helvetica').text(`- ${ch.name}: ${ch.channel_url || 'TBD'}`)
        })
      } else {
        doc.fontSize(12).font('Helvetica').text('No channels defined.')
      }
      doc.moveDown()
      
      doc.fontSize(14).font('Helvetica-Bold').text('Meeting Cadence')
      if (data.meetings && data.meetings.length > 0) {
        data.meetings.forEach(m => {
          doc.fontSize(12).font('Helvetica-Bold').text(m.name)
          doc.font('Helvetica').text(`Schedule: ${m.frequency} on ${m.day_of_week} at ${m.time} (${m.duration})`)
          doc.text(`Attendees: ${m.attendees || 'TBD'}`)
          doc.moveDown(0.5)
        })
      } else {
        doc.fontSize(12).font('Helvetica').text('No meetings defined.')
      }

      // 7. Milestone Plan
      sectionTitle('Milestone Plan')
      if (data.milestones && data.milestones.length > 0) {
        data.milestones.forEach((m, i) => {
          doc.fontSize(14).font('Helvetica-Bold').text(`${i + 1}. ${m.title}`)
          doc.fontSize(12).font('Helvetica').text(`Duration: ${m.start_date || 'TBD'} to ${m.end_date || 'TBD'}`)
          if (m.description) doc.text(`Description: ${m.description}`)
          doc.moveDown()
        })
      } else {
        doc.fontSize(12).text('No milestones defined.')
      }

      // 8. Deliverables List
      sectionTitle('Deliverables List')
      const reqDeliverables = Object.entries(data.deliverables || {}).filter(([k, v]) => v)
      if (reqDeliverables.length > 0) {
        reqDeliverables.forEach(([k]) => {
          doc.fontSize(12).font('Helvetica').text(`• ${k}`)
        })
      } else {
        doc.fontSize(12).text('No deliverables specified.')
      }

      // 9. Risk Register
      sectionTitle('Risk Register')
      doc.fontSize(14).font('Helvetica-Bold').text('Risk Assessment:')
      const risks = data.risks || {}
      doc.fontSize(12).font('Helvetica')
         .text(`Timeline Risk: ${risks.timeline || 'Low'}`)
         .text(`Budget Risk: ${risks.budget || 'Low'}`)
         .text(`Communication Risk: ${risks.communication || 'Low'}`)
         .text(`Technical Risk: ${risks.technical || 'Low'}`)
         .text(`Resource Risk: ${risks.resource || 'Low'}`)
      
      if (data.aiRecs && data.aiRecs.riskWarnings && data.aiRecs.riskWarnings.length > 0) {
        doc.moveDown()
        doc.fontSize(14).font('Helvetica-Bold').text('AI Identified Risks:')
        data.aiRecs.riskWarnings.forEach(r => {
          doc.fontSize(12).font('Helvetica').text(`• ${r}`)
        })
      }

      // 10. Integration Credentials Summary
      sectionTitle('Integration Credentials')
      if (data.integrations && data.integrations.length > 0) {
        data.integrations.forEach((inte) => {
          if (inte.status === 'Generated' || inte.required) {
            doc.fontSize(14).font('Helvetica-Bold').text(inte.service)
            doc.fontSize(12).font('Helvetica').text(`Category: ${inte.category}`)
            if (inte.fields && Array.isArray(inte.fields)) {
              inte.fields.forEach(f => {
                if (f.value) {
                  doc.text(`${f.label}: ${f.value}`)
                }
              })
            }
            doc.moveDown()
          }
        })
      } else {
        doc.fontSize(12).text('No integrations provisioned.')
      }

      // 11. Project Readiness Report
      sectionTitle('Project Readiness')
      doc.fontSize(14).font('Helvetica-Bold').text(`Completeness Score: ${data.completenessScore || 0}%`)
      doc.moveDown()
      doc.fontSize(12).font('Helvetica').text('This score evaluates whether the core enterprise data fields are captured correctly prior to kickoff.')

      // 12. Kickoff Checklist
      sectionTitle('Kickoff Checklist')
      const checklist = [
        "Review and sign Project Charter",
        "Provision all Integration Credentials to Team",
        "Send intro email to Client Stakeholders",
        "Send calendar invites for standard Meeting Cadence",
        "Set up Git repository and Jira boards",
        "Schedule internal Team Kickoff",
        "Schedule formal Client Kickoff"
      ]
      checklist.forEach(item => {
        doc.fontSize(12).font('Helvetica').text(`[  ] ${item}`)
        doc.moveDown(0.5)
      })
      
      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

export const generateDOCX = async (data) => {
  try {
    const createParagraph = (text, options = {}) => {
      return new Paragraph({
        children: [new TextRun({ text, ...options })],
        spacing: { after: 120 }
      })
    }
    
    const createHeading = (text, level = HeadingLevel.HEADING_1) => {
      return new Paragraph({
        text,
        heading: level,
        spacing: { before: 240, after: 120 },
        pageBreakBefore: level === HeadingLevel.HEADING_1
      })
    }

    const createField = (label, value) => {
      if (!value) return null
      return new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true }),
          new TextRun({ text: value.toString() })
        ],
        spacing: { after: 120 }
      })
    }

    const sections = []

    // 1. Executive Summary
    sections.push(
      new Paragraph({
        text: 'Project Kickoff Package',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: '', spacing: { after: 240 } }),
      createParagraph(`Project: ${data.projectName || 'Untitled'}`, { bold: true, size: 28 }),
      createParagraph(`Client: ${data.clientName || 'N/A'}`, { size: 24 }),
      createParagraph(`Manager: ${data.projectManager || 'N/A'}`, { size: 24 }),
      new Paragraph({ text: '', spacing: { after: 240 } }),
      createField('Industry', data.industry),
      createField('Project Type', data.projectType),
      createField('Contract Value', data.contractValue ? `${data.billingCurrency || '$'} ${data.contractValue}` : null),
      createField('Duration', data.estimatedDuration),
      createField('Priority', data.priority)
    )

    // 2. Project Charter
    sections.push(createHeading('Project Charter'))
    sections.push(
      createField('Business Goal', data.businessGoal),
      createField('Technical Scope', data.technicalScope),
      createField('Success Criteria', data.successCriteria),
      createField('Dependencies', data.dependencies),
      createField('Known Constraints', data.knownConstraints),
      createField('Special Instructions', data.specialInstructions)
    )

    // 3. Architecture & AI
    sections.push(createHeading('Architecture & Recommendations'))
    if (data.aiRecs && data.aiRecs.recommendedArchitecture) {
      sections.push(
        createField('AI Match Score', `${data.aiRecs.aiConfidenceScore}%`),
        createField('Recommended Architecture', data.aiRecs.recommendedArchitecture),
        createField('Tech Stack', (data.aiRecs.recommendedTechStack || []).join(', ')),
        createField('Integrations', (data.aiRecs.recommendedIntegrations || []).join(', ')),
        createHeading('AI Strategic Advice', HeadingLevel.HEADING_3),
        createParagraph(data.aiRecs.advice || 'N/A')
      )
    } else {
      sections.push(createParagraph('No AI recommendations generated.'))
    }

    // 4. Team Directory
    sections.push(createHeading('Team Directory'))
    if (data.teamMembers && data.teamMembers.length > 0) {
      data.teamMembers.forEach((member, i) => {
        sections.push(
          createHeading(`${i + 1}. ${member.name}`, HeadingLevel.HEADING_3),
          createParagraph(`Role: ${member.role} | Dept: ${member.department || 'Consulting'}`)
        )
        if (member.skills && member.skills.length > 0) {
          sections.push(createParagraph(`Skills: ${member.skills.join(', ')}`))
        }
      })
    } else {
      sections.push(createParagraph('No team members assigned.'))
    }

    // 5. Stakeholder Matrix
    sections.push(createHeading('Stakeholder Matrix'))
    if (data.clientContacts && data.clientContacts.length > 0) {
      data.clientContacts.forEach((cc, i) => {
        sections.push(
          createHeading(`${i + 1}. ${cc.name} - ${cc.role}`, HeadingLevel.HEADING_3),
          createParagraph(`Org: ${cc.organization || data.clientName}`),
          createParagraph(`Email: ${cc.email} | Phone: ${cc.phone}`)
        )
      })
    } else {
      sections.push(createParagraph('No external stakeholders provided.'))
    }

    // 6. Communication Plan
    sections.push(createHeading('Communication Plan'))
    sections.push(createHeading('Slack Channels', HeadingLevel.HEADING_3))
    if (data.channels && data.channels.length > 0) {
      data.channels.forEach(ch => {
        sections.push(createParagraph(`- ${ch.name}: ${ch.channel_url || 'TBD'}`))
      })
    } else {
      sections.push(createParagraph('No channels defined.'))
    }
    
    sections.push(createHeading('Meeting Cadence', HeadingLevel.HEADING_3))
    if (data.meetings && data.meetings.length > 0) {
      data.meetings.forEach(m => {
        sections.push(
          createParagraph(m.name, { bold: true }),
          createParagraph(`Schedule: ${m.frequency} on ${m.day_of_week} at ${m.time} (${m.duration})`),
          createParagraph(`Attendees: ${m.attendees || 'TBD'}`)
        )
      })
    } else {
      sections.push(createParagraph('No meetings defined.'))
    }

    // 7. Milestone Plan
    sections.push(createHeading('Milestone Plan'))
    if (data.milestones && data.milestones.length > 0) {
      data.milestones.forEach((m, i) => {
        sections.push(
          createHeading(`${i + 1}. ${m.title}`, HeadingLevel.HEADING_3),
          createParagraph(`Duration: ${m.start_date || 'TBD'} to ${m.end_date || 'TBD'}`)
        )
        if (m.description) sections.push(createParagraph(`Description: ${m.description}`))
      })
    } else {
      sections.push(createParagraph('No milestones defined.'))
    }

    // 8. Deliverables List
    sections.push(createHeading('Deliverables List'))
    const reqDeliverables = Object.entries(data.deliverables || {}).filter(([k, v]) => v)
    if (reqDeliverables.length > 0) {
      reqDeliverables.forEach(([k]) => {
        sections.push(new Paragraph({ text: k, bullet: { level: 0 } }))
      })
    } else {
      sections.push(createParagraph('No deliverables specified.'))
    }

    // 9. Risk Register
    sections.push(createHeading('Risk Register'))
    const risks = data.risks || {}
    sections.push(
      createField('Timeline Risk', risks.timeline || 'Low'),
      createField('Budget Risk', risks.budget || 'Low'),
      createField('Communication Risk', risks.communication || 'Low'),
      createField('Technical Risk', risks.technical || 'Low'),
      createField('Resource Risk', risks.resource || 'Low')
    )
    if (data.aiRecs && data.aiRecs.riskWarnings && data.aiRecs.riskWarnings.length > 0) {
      sections.push(createHeading('AI Identified Risks', HeadingLevel.HEADING_3))
      data.aiRecs.riskWarnings.forEach(r => {
        sections.push(new Paragraph({ text: r, bullet: { level: 0 } }))
      })
    }

    // 10. Integrations Summary
    sections.push(createHeading('Integration Credentials Summary'))
    if (data.integrations && data.integrations.length > 0) {
      data.integrations.forEach((inte) => {
        if (inte.status === 'Generated' || inte.required) {
          sections.push(createHeading(inte.service, HeadingLevel.HEADING_3))
          sections.push(createField('Category', inte.category))
          if (inte.fields && Array.isArray(inte.fields)) {
            inte.fields.forEach(f => {
              if (f.value) sections.push(createField(f.label, f.value))
            })
          }
        }
      })
    } else {
      sections.push(createParagraph('No integrations provisioned.'))
    }

    // 11. Readiness Report
    sections.push(createHeading('Project Readiness Report'))
    sections.push(createField('Completeness Score', `${data.completenessScore || 0}%`))
    sections.push(createParagraph('This score evaluates whether the core enterprise data fields are captured correctly prior to kickoff.'))

    // 12. Kickoff Checklist
    sections.push(createHeading('Kickoff Checklist'))
    const checklist = [
      "Review and sign Project Charter",
      "Provision all Integration Credentials to Team",
      "Send intro email to Client Stakeholders",
      "Send calendar invites for standard Meeting Cadence",
      "Set up Git repository and Jira boards",
      "Schedule internal Team Kickoff",
      "Schedule formal Client Kickoff"
    ]
    checklist.forEach(item => {
      sections.push(createParagraph(`[  ] ${item}`))
    })

    const doc = new Document({
      sections: [{
        properties: {},
        children: sections.filter(s => s !== null)
      }]
    })

    const buffer = await Packer.toBuffer(doc)
    return buffer.toString('base64')
  } catch (err) {
    throw err
  }
}
