export const errorHandler = (err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  const message = err.message || 'Server error'
  res.status(status).json({ error: message })
}

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: 'Not found' })
}
