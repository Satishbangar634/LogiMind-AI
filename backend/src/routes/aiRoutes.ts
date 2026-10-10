import { Router } from 'express'
import { askAssistant } from '../controllers/aiController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = Router()

router.post('/ask', authenticateToken, askAssistant)

export default router