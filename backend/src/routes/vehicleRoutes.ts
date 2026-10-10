import { Router } from 'express'
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController'

const router = Router()

// Get all vehicles
router.get('/', getVehicles)

// Create vehicle
router.post('/', createVehicle)

// Update vehicle
router.put('/:id', updateVehicle)

// Delete vehicle
router.delete('/:id', deleteVehicle)

export default router