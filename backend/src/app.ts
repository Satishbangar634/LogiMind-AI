import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes'
import { authenticateToken } from './middleware/authMiddleware'
import vehicleRoutes from './routes/vehicleRoutes'
import locationRoutes from './routes/locationRoutes'
import orderRoutes from './routes/orderRoutes'
import tripRoutes from './routes/tripRoutes'
import dashboardRoutes from './routes/dashboardRoutes'
import routeRoutes from './routes/routeRoutes'
import aiRoutes from './routes/aiRoutes'
import analyticsRoutes from './routes/analyticsRoutes'
import simulationRoutes from './routes/simulationRoutes'
import insightsRoutes from './routes/insightsRoutes'




const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'LogiMind API is running',
  })
})

// Authentication routes
app.use('/api/auth', authRoutes)

// Vehicle routes
app.use('/api/vehicles', vehicleRoutes)

// Location routes
app.use('/api/locations', locationRoutes)

// Order routes
app.use('/api/orders', orderRoutes)

// Trip routes
app.use('/api/trips', tripRoutes)

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes)

// Route routes
app.use('/api/routes', routeRoutes)

// AI routes
app.use('/api/ai', aiRoutes)

// Analytics routes
app.use('/api/analytics', analyticsRoutes)

// Simulation routes
app.use('/api/simulation', simulationRoutes)

// Insights routes
app.use('/api/insights', insightsRoutes)

// Protected route
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: req.user,
  })
})

export default app