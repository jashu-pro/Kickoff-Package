import { getScopedClient } from '../config/supabase.js'
import { generatePDF, generateDOCX } from '../services/document.service.js'
import { logActivity } from '../services/activity.service.js'

export const generateKickoffPackage = async (req, res, next) => {
  try {
    const supabase = getScopedClient(req.headers.authorization)
    const { id } = req.params
    const { 
      risks, deliverables, teamMembers, milestones, integrations, projectData, userName,
      channels, meetings, clientContacts, aiRecs, completenessScore
    } = req.body

    // 1. Update Project Status to 'Active'
    await supabase.from('projects').update({ status: 'active' }).eq('id', id)

    // 2. Save Risks
    if (risks) {
      await supabase.from('risks').upsert({
        project_id: id,
        timeline_risk: risks.timeline || 'low',
        budget_risk: risks.budget || 'low',
        communication_risk: risks.communication || 'low',
        technical_risk: risks.technical || 'low',
        resource_risk: risks.resource || 'low'
      })
    }

    // 3. Save Deliverables Checklist
    if (deliverables) {
      for (const [key, isRequired] of Object.entries(deliverables)) {
        if (isRequired) {
          // just an example of saving required deliverables
          await supabase.from('deliverables').upsert({
            project_id: id,
            name: key,
            status: 'pending'
          }, { onConflict: 'project_id,name' })
        }
      }
    }

    // 3.5 Save Integrations
    if (integrations) {
      for (const inte of integrations) {
        if (inte.status === 'Generated' || inte.required) {
          const configFields = {};
          (inte.fields || []).forEach(f => {
            configFields[f.key] = f.value;
          });

          const generatedAtDate = new Date(inte.generated_at);
          await supabase.from('integrations').upsert({
            project_id: id,
            category: inte.category,
            service: inte.service,
            description: inte.description,
            environment: inte.environment || 'Production',
            config: configFields,
            status: inte.status,
            generated_at: !isNaN(generatedAtDate) ? generatedAtDate.toISOString() : new Date().toISOString()
          })
        }
      }
    }

    // 4. Generate Document Artifacts (PDF & DOCX)
    const combinedData = {
      ...projectData,
      risks: risks || {},
      deliverables: deliverables || {},
      teamMembers: teamMembers || [],
      milestones: milestones || [],
      integrations: integrations || [],
      channels: channels || [],
      meetings: meetings || [],
      clientContacts: clientContacts || [],
      aiRecs: aiRecs || {},
      completenessScore: completenessScore || 0
    }

    const pdfBase64 = await generatePDF(combinedData)
    const docxBase64 = await generateDOCX(combinedData)

    // Calculate version
    const { data: existingPackages } = await supabase
      .from('kickoff_packages')
      .select('id')
      .eq('project_id', id)
    
    const versionNumber = existingPackages ? existingPackages.length + 1 : 1
    const versionStr = `1.${versionNumber - 1}`

    // 5. Upload to Supabase Storage
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')
    const docxBuffer = Buffer.from(docxBase64, 'base64')
    const jsonBuffer = Buffer.from(JSON.stringify(combinedData, null, 2))

    const pdfPath = `${id}/v${versionNumber}/Kickoff_Package.pdf`
    const docxPath = `${id}/v${versionNumber}/Kickoff_Package.docx`
    const jsonPath = `${id}/v${versionNumber}/project.json`

    await supabase.storage.from('packages').upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })
    await supabase.storage.from('packages').upload(docxPath, docxBuffer, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', upsert: true })
    await supabase.storage.from('packages').upload(jsonPath, jsonBuffer, { contentType: 'application/json', upsert: true })

    const { data: pdfUrlData } = supabase.storage.from('packages').getPublicUrl(pdfPath)
    const { data: docxUrlData } = supabase.storage.from('packages').getPublicUrl(docxPath)
    const { data: jsonUrlData } = supabase.storage.from('packages').getPublicUrl(jsonPath)

    // 6. Save the generated package record
    const { data: packageRecord, error: packageErr } = await supabase.from('kickoff_packages').insert({
      project_id: id,
      version: versionStr,
      pdf_url: pdfUrlData.publicUrl,
      docx_url: docxUrlData.publicUrl,
      json_url: jsonUrlData.publicUrl,
      generated_by: userName,
      status: 'Generated'
    }).select().single()

    if (packageErr) console.error("Error saving package record:", packageErr)

    // 7. Log Detailed Activity History
    const authHeader = req.headers.authorization
    await logActivity(authHeader, id, 'Project Created', `Project structure finalized by ${userName}.`, userName)
    if (teamMembers && teamMembers.length > 0) await logActivity(authHeader, id, 'Team Assigned', `${teamMembers.length} team members assigned.`, userName)
    if ((channels && channels.length > 0) || (meetings && meetings.length > 0)) await logActivity(authHeader, id, 'Communication Configured', 'Communication plan and stakeholders setup.', userName)
    if (integrations && integrations.length > 0) await logActivity(authHeader, id, 'Credentials Provisioned', 'Integration credentials securely generated.', userName)
    if (milestones && milestones.length > 0) await logActivity(authHeader, id, 'Timeline Generated', 'Project milestones and execution timeline scheduled.', userName)
    
    await logActivity(authHeader, id, 'Package Generated', `Version ${versionStr} kickoff package generated.`, userName)
    await logActivity(authHeader, id, 'PDF Generated', `Kickoff_Package.pdf created successfully.`, userName)
    await logActivity(authHeader, id, 'DOCX Generated', `Kickoff_Package.docx created successfully.`, userName)
    await logActivity(authHeader, id, 'JSON Generated', `project.json created successfully.`, userName)
    
    // Notify PM
    if (projectData.projectManager) {
       await supabase.from('notifications').insert({
         title: 'Kickoff Generated',
         message: `Kickoff package for ${projectData.projectName} has been generated by ${userName}.`,
         type: 'new_activity',
         category: 'project',
         priority: 'high',
         related_id: id
       })
    }

    // 8. Respond with the generated package record
    return res.status(200).json({
      message: 'Package generated successfully',
      package: packageRecord
    })

  } catch (error) {
    next(error)
  }
}
