import { Router } from 'express'

import {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  updateTripStatus,
} from '../controllers/tripController'

import { optimizeTripRoute } from '../controllers/tripOptimizationController'

import { authenticateToken } from '../middleware/authMiddleware'

const router = Router()

router.get('/', getTrips)

router.post('/', createTrip)

router.put('/:id', updateTrip)

router.delete('/:id', deleteTrip)

router.patch('/:id/status', updateTripStatus)

router.patch(
  '/:id/optimize-route',
  authenticateToken,
  optimizeTripRoute
)

export default router