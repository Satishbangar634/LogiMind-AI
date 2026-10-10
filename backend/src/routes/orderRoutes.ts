import { Router } from 'express'
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController'

const router = Router()

router.get('/', getOrders)
router.post('/', createOrder)
router.put('/:id', updateOrder)
router.delete('/:id', deleteOrder)

export default router