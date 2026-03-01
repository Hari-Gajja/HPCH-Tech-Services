import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import config from './config/env.js'
import emailOtpRoutes from './routes/emailOtp.js'
import phoneOtpRoutes from './routes/phoneOtp.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ------------------------------------
// Middleware
// ------------------------------------
app.use(cors({
  origin: config.isProduction
    ? ['https://your-domain.com']  // Update with your actual domain
    : '*',
}))
app.use(express.json({ limit: '1mb' }))

// Request logging in development
if (!config.isProduction) {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
  })
}

// ------------------------------------
// API Routes
// ------------------------------------
app.use('/api', emailOtpRoutes)
app.use('/api', phoneOtpRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// ------------------------------------
// Serve frontend in production
// ------------------------------------
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// ------------------------------------
// Global error handler
// ------------------------------------
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ------------------------------------
// Start server
// ------------------------------------
app.listen(config.port, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │  HPCH Server running                    │
  │  Port:  ${String(config.port).padEnd(32)}│
  │  Mode:  ${config.nodeEnv.padEnd(32)}│
  │  URL:   http://localhost:${String(config.port).padEnd(20)}│
  └─────────────────────────────────────────┘
  `)
})

export default app
