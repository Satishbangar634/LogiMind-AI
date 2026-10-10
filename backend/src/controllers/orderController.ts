import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        o.*,
        s.name AS source_location_name,
        d.name AS destination_location_name
      FROM orders o
      JOIN locations s
        ON o.source_location_id = s.id
      JOIN locations d
        ON o.destination_location_id = d.id
      ORDER BY o.created_at DESC
    `)

    return res.status(200).json({
      success: true,
      orders: result.rows,
    })
  } catch (error) {
    console.error('Get orders error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      order_number,
      source_location_id,
      destination_location_id,
      commodity,
      quantity_kg,
      priority,
      expected_delivery_date,
    } = req.body || {}

    if (
      !order_number ||
      !source_location_id ||
      !destination_location_id ||
      !commodity ||
      !quantity_kg
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Order number, source, destination, commodity and quantity are required',
      })
    }

    if (source_location_id === destination_location_id) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same',
      })
    }

    const existingOrder = await pool.query(
      `SELECT id
       FROM orders
       WHERE order_number = $1`,
      [order_number]
    )

    if (existingOrder.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Order number already exists',
      })
    }

    const result = await pool.query(
      `INSERT INTO orders
       (
         order_number,
         source_location_id,
         destination_location_id,
         commodity,
         quantity_kg,
         priority,
         expected_delivery_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        order_number,
        source_location_id,
        destination_location_id,
        commodity,
        quantity_kg,
        priority || 'normal',
        expected_delivery_date || null,
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: result.rows[0],
    })
  } catch (error) {
    console.error('Create order error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const {
      order_number,
      source_location_id,
      destination_location_id,
      commodity,
      quantity_kg,
      status,
      priority,
      expected_delivery_date,
    } = req.body || {}

    if (
      !order_number ||
      !source_location_id ||
      !destination_location_id ||
      !commodity ||
      !quantity_kg
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Order number, source, destination, commodity and quantity are required',
      })
    }

    if (source_location_id === destination_location_id) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same',
      })
    }

    const existingOrder = await pool.query(
      `SELECT id
       FROM orders
       WHERE order_number = $1
       AND id != $2`,
      [order_number, id]
    )

    if (existingOrder.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Order number already exists',
      })
    }

    const result = await pool.query(
      `UPDATE orders
       SET
         order_number = $1,
         source_location_id = $2,
         destination_location_id = $3,
         commodity = $4,
         quantity_kg = $5,
         status = $6,
         priority = $7,
         expected_delivery_date = $8
       WHERE id = $9
       RETURNING *`,
      [
        order_number,
        source_location_id,
        destination_location_id,
        commodity,
        quantity_kg,
        status || 'pending',
        priority || 'normal',
        expected_delivery_date || null,
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: result.rows[0],
    })
  } catch (error) {
    console.error('Update order error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `DELETE FROM orders
       WHERE id = $1
       RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    })
  } catch (error) {
    console.error('Delete order error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}