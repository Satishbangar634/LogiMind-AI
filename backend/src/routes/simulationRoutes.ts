import { Router } from 'express'

import { simulateRoute } from '../controllers/simulationController'

import { authenticateToken } from '../middleware/authMiddleware'

const router = Router()

router.post(
  '/simulate',
  authenticateToken,
  simulateRoute
)

export default router