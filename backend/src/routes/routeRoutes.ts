import { Router } from 'express'
import { optimizeRoute } from '../controllers/routeController'

const router = Router()

router.post('/optimize', optimizeRoute)

export default router