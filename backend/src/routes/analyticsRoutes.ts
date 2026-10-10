import { Router } from 'express'
import { getAnalytics } from '../controllers/analyticsController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = Router()

router.get('/', authenticateToken, getAnalytics)

export default router