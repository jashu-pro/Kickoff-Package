import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DB_FILE = join(DATA_DIR, 'db.json')
const PORT = Number(process.env.PORT || 5000)

const tables = [
  'projects',
  'team_members',
  'tasks',
  'milestones',
  'communication_channels',
  'stakeholders',
  'escalation_levels',
  'meeting_frequencies',
  'integrations',
  'notifications',
]

const emptyDb = () => Object.fromEntries(tables.map(table => [table, []]))

const sendJson = (res, status, body = null) => {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  })
  res.end(body === null ? '' : JSON.stringify(body))
}

const notFound = res => sendJson(res, 404, { error: 'Not found' })

const readBody = async req => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

const loadDb = async () => {
  await mkdir(DATA_DIR, { recursive: true })
  try {
    const data = JSON.parse(await readFile(DB_FILE, 'utf8'))
    return { ...emptyDb(), ...data }
  } catch {
    const data = emptyDb()
    await writeFile(DB_FILE, JSON.stringify(data, null, 2))
    return data
  }
}

const saveDb = async db => {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DB_FILE, JSON.stringify(db, null, 2))
}

const normalizeRecord = (table, record, existing = {}) => {
  const now = new Date().toISOString()
  const merged = {
    ...existing,
    ...record,
    id: existing.id || record.id || randomUUID(),
    updated_at: now,
  }

  if (!existing.id) merged.created_at = record.created_at || now

  if (table === 'tasks') {
    merged.status = merged.status || (merged.completed ? 'completed' : 'pending')
    merged.progress = merged.progress ?? (merged.status === 'completed' ? 100 : 0)
  }

  if (table === 'notifications') {
    merged.priority = merged.priority || 'medium'
    merged.is_read = Boolean(merged.is_read)
    merged.is_deleted = Boolean(merged.is_deleted)
    merged.deleted_at = merged.deleted_at || null
  }

  return merged
}

const withTaskOwner = (db, task) => {
  const owner = db.team_members.find(member => member.id === task.owner_id)
  return {
    ...task,
    team_members: owner ? { name: owner.name } : null,
  }
}

const filterByProject = (items, projectId) => {
  if (!projectId) return items
  return items.filter(item => item.project_id === projectId)
}

const listNotifications = (items, searchParams) => {
  const filter = searchParams.get('filter') || 'all'
  const page = Math.max(Number(searchParams.get('page') || 1), 1)
  const limit = Math.max(Number(searchParams.get('limit') || 20), 1)
  const query = (searchParams.get('q') || '').trim().toLowerCase()

  let list = [...items]
  if (filter === 'deleted') {
    list = list.filter(item => item.is_deleted)
  } else {
    list = list.filter(item => !item.is_deleted)
    if (filter === 'unread') list = list.filter(item => !item.is_read)
    if (filter === 'high_priority') list = list.filter(item => item.priority === 'high')
    if (['project', 'task', 'milestone', 'team'].includes(filter)) {
      list = list.filter(item => item.category === filter)
    }
  }

  if (query) {
    list = list.filter(item =>
      String(item.title || '').toLowerCase().includes(query) ||
      String(item.message || '').toLowerCase().includes(query)
    )
  }

  const sortField = filter === 'deleted' ? 'deleted_at' : 'created_at'
  list.sort((a, b) => new Date(b[sortField] || b.created_at || 0) - new Date(a[sortField] || a.created_at || 0))

  const start = (page - 1) * limit
  return {
    data: list.slice(start, start + limit),
    count: list.length,
  }
}

const hasDuplicateNotification = (notifications, relatedId, category, type) => {
  if (!relatedId) return false
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  return notifications.some(item =>
    item.related_id === relatedId &&
    item.category === category &&
    item.type === type &&
    (!item.is_read || new Date(item.created_at || 0).getTime() > oneDayAgo)
  )
}

const handleCollection = async (req, res, db, table, searchParams) => {
  if (req.method === 'GET') {
    if (table === 'notifications') return sendJson(res, 200, listNotifications(db.notifications, searchParams))

    const list = filterByProject(db[table], searchParams.get('project_id'))
    const result = table === 'tasks' ? list.map(task => withTaskOwner(db, task)) : list
    return sendJson(res, 200, result)
  }

  if (req.method === 'POST') {
    const body = await readBody(req)
    const record = normalizeRecord(table, body)
    db[table].push(record)
    await saveDb(db)
    return sendJson(res, 201, table === 'tasks' ? withTaskOwner(db, record) : record)
  }

  if (req.method === 'DELETE' && table === 'notifications') {
    const now = new Date().toISOString()
    db.notifications = db.notifications.map(item =>
      item.is_deleted ? item : { ...item, is_deleted: true, deleted_at: now, updated_at: now }
    )
    await saveDb(db)
    return sendJson(res, 200, { ok: true })
  }

  return notFound(res)
}

const handleRecord = async (req, res, db, table, id) => {
  const index = db[table].findIndex(item => item.id === id)
  if (index === -1) return notFound(res)

  if (req.method === 'GET') {
    const record = db[table][index]
    return sendJson(res, 200, table === 'tasks' ? withTaskOwner(db, record) : record)
  }

  if (req.method === 'PUT') {
    const body = await readBody(req)
    const record = normalizeRecord(table, body, db[table][index])
    db[table][index] = record
    await saveDb(db)
    return sendJson(res, 200, table === 'tasks' ? withTaskOwner(db, record) : record)
  }

  if (req.method === 'DELETE') {
    if (table === 'notifications') {
      const now = new Date().toISOString()
      db.notifications[index] = { ...db.notifications[index], is_deleted: true, deleted_at: now, updated_at: now }
    } else {
      db[table].splice(index, 1)
    }
    await saveDb(db)
    return sendJson(res, 200, { ok: true })
  }

  return notFound(res)
}

const handleNotificationAction = async (req, res, db, id, action) => {
  const index = db.notifications.findIndex(item => item.id === id)
  if (index === -1) return notFound(res)

  const now = new Date().toISOString()
  if (req.method === 'PATCH' && action === 'read') {
    db.notifications[index] = { ...db.notifications[index], is_read: true, updated_at: now }
  } else if (req.method === 'POST' && action === 'restore') {
    db.notifications[index] = { ...db.notifications[index], is_deleted: false, deleted_at: null, updated_at: now }
  } else if (req.method === 'DELETE' && action === 'permanent') {
    db.notifications.splice(index, 1)
    await saveDb(db)
    return sendJson(res, 200, { ok: true })
  } else {
    return notFound(res)
  }

  await saveDb(db)
  return sendJson(res, 200, db.notifications[index])
}

const handleRequest = async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204)

  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'api') return notFound(res)
    if (parts[1] === 'health') return sendJson(res, 200, { ok: true })

    const db = await loadDb()
    const table = parts[1]
    if (!tables.includes(table)) return notFound(res)

    if (table === 'notifications' && parts[2] === 'check-duplicate' && req.method === 'GET') {
      const duplicate = hasDuplicateNotification(
        db.notifications,
        url.searchParams.get('related_id'),
        url.searchParams.get('category'),
        url.searchParams.get('type')
      )
      return sendJson(res, 200, { duplicate })
    }

    if (table === 'notifications' && parts[2] === 'mark-all-read' && req.method === 'POST') {
      const now = new Date().toISOString()
      db.notifications = db.notifications.map(item =>
        item.is_deleted || item.is_read ? item : { ...item, is_read: true, updated_at: now }
      )
      await saveDb(db)
      return sendJson(res, 200, { ok: true })
    }

    if (!parts[2]) return handleCollection(req, res, db, table, url.searchParams)
    if (table === 'notifications' && parts[3]) return handleNotificationAction(req, res, db, parts[2], parts[3])
    return handleRecord(req, res, db, table, parts[2])
  } catch (error) {
    console.error(error)
    return sendJson(res, 500, { error: error.message || 'Server error' })
  }
}

createServer(handleRequest).listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}/api`)
})
