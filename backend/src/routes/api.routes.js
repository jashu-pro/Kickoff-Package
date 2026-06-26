import express from 'express'
import { getCollection, createRecord, deleteCollection } from '../controllers/collection.controller.js'
import { getRecord, updateRecord, deleteRecord, handleNotificationAction } from '../controllers/record.controller.js'
import { checkDuplicate, markAllRead } from '../services/notification.service.js'
import { getAIRecommendations } from '../controllers/ai.controller.js'
import { generateKickoffPackage } from '../controllers/package.controller.js'

const router = express.Router()

const tables = [
  'projects', 'team_members', 'tasks', 'milestones', 
  'communication_channels', 'stakeholders', 'escalation_levels', 
  'meeting_frequencies', 'integrations', 'notifications',
  'risks', 'activities', 'deliverables', 'kickoff_packages'
]

const validateTable = (req, res, next) => {
  if (req.params.table !== 'notifications' || !req.params.action) {
     if (!tables.includes(req.params.table)) {
        return res.status(404).json({ error: 'Not found' })
     }
  }
  next()
}

router.get('/health', (req, res) => res.status(200).json({ ok: true }))

// AI Recommendations
router.post('/ai/recommend', getAIRecommendations)

// Package Generation
router.post('/projects/:id/generate_package', generateKickoffPackage)

// Custom notification routes
router.get('/notifications/check-duplicate', async (req, res, next) => {
  try {
    const { related_id, category, type } = req.query
    const duplicate = await checkDuplicate(req.headers.authorization, related_id, category, type)
    res.status(200).json({ duplicate })
  } catch (err) {
    next(err)
  }
})

router.post('/notifications/mark-all-read', async (req, res, next) => {
  try {
    await markAllRead()
    res.status(200).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// Custom notification actions
router.route('/notifications/:id/:action')
  .patch(handleNotificationAction)
  .post(handleNotificationAction)
  .delete(handleNotificationAction)

// Collection routes
router.route('/:table')
  .all(validateTable)
  .get(getCollection)
  .post(createRecord)
  .delete(deleteCollection)

// Record routes
router.route('/:table/:id')
  .all(validateTable)
  .get(getRecord)
  .put(updateRecord)
  .delete(deleteRecord)

export default router
