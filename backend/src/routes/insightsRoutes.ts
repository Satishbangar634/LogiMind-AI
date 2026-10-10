import { Router } from 'express'

import {
  getLogisticsInsights,
} from '../controllers/insightsController'

import {
  authenticateToken,
} from '../middleware/authMiddleware'

const router = Router()

router.get(
  '/',
  authenticateToken,
  getLogisticsInsights
)

export default router