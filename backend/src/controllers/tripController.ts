import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getTrips = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        t.*,
        o.order_number,
        o.commodity,
        o.quantity_kg,
        v.vehicle_number,
        v.driver_name,
        s.name AS source_location_name,
        d.name AS destination_location_name
      FROM trips t
      JOIN orders o ON t.order_id = o.id
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN locations s ON t.source_location_id = s.id
      JOIN locations d ON t.destination_location_id = d.id
      ORDER BY t.created_at DESC
    `)

    return res.status(200).json({
      success: true,
      trips: result.rows,
    })
  } catch (error) {
    console.error('Get trips error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const createTrip = async (req: Request, res: Response) => {
  try {
    const {
      trip_number,
      order_id,
      vehicle_id,
      source_location_id,
      destination_location_id,
      planned_distance_km,
      estimated_duration_minutes,
      status,
    } = req.body || {}

    if (
      !trip_number ||
      !order_id ||
      !vehicle_id ||
      !source_location_id ||
      !destination_location_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Trip number, order, vehicle, source location and destination location are required',
      })
    }

    if (source_location_id === destination_location_id) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination locations must be different',
      })
    }

    const existingTrip = await pool.query(
      'SELECT id FROM trips WHERE trip_number = $1',
      [trip_number]
    )

    if (existingTrip.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Trip number already exists',
      })
    }

    const orderCheck = await pool.query(
      'SELECT id FROM orders WHERE id = $1',
      [order_id]
    )

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      })
    }

    const vehicleCheck = await pool.query(
      'SELECT id FROM vehicles WHERE id = $1',
      [vehicle_id]
    )

    if (vehicleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      })
    }

    const result = await pool.query(
      `INSERT INTO trips (
        trip_number,
        order_id,
        vehicle_id,
        source_location_id,
        destination_location_id,
        planned_distance_km,
        estimated_duration_minutes,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        trip_number,
        order_id,
        vehicle_id,
        source_location_id,
        destination_location_id,
        planned_distance_km || null,
        estimated_duration_minutes || null,
        status || 'planned',
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip: result.rows[0],
    })
  } catch (error) {
    console.error('Create trip error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
export const updateTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const {
      vehicle_id,
      source_location_id,
      destination_location_id,
      planned_distance_km,
      estimated_duration_minutes,
      status,
    } = req.body || {}

    if (
  source_location_id !== undefined &&
  destination_location_id !== undefined &&
  source_location_id === destination_location_id
) {
  return res.status(400).json({
    success: false,
    message: 'Source and destination locations must be different',
  })
}

    const existingTrip = await pool.query(
      'SELECT id FROM trips WHERE id = $1',
      [id]
    )

    if (existingTrip.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      })
    }

    const result = await pool.query(
      `UPDATE trips
       SET
         vehicle_id = COALESCE($1, vehicle_id),
         source_location_id = COALESCE($2, source_location_id),
         destination_location_id = COALESCE($3, destination_location_id),
         planned_distance_km = COALESCE($4, planned_distance_km),
         estimated_duration_minutes = COALESCE($5, estimated_duration_minutes),
         status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [
        vehicle_id,
        source_location_id,
        destination_location_id,
        planned_distance_km,
        estimated_duration_minutes,
        status,
        id,
      ]
    )

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: result.rows[0],
    })
  } catch (error) {
    console.error('Update trip error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM trips WHERE id = $1 RETURNING id, trip_number',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
      trip: result.rows[0],
    })
  } catch (error) {
    console.error('Delete trip error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
export const updateTripStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}

    const allowedStatuses = [
      'planned',
      'in_progress',
      'completed',
      'cancelled',
    ]

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid status. Allowed: planned, in_progress, completed, cancelled',
      })
    }

    const existingTrip = await pool.query(
      'SELECT id, status FROM trips WHERE id = $1',
      [id]
    )

    if (existingTrip.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      })
    }

    let query = `
      UPDATE trips
      SET status = $1
    `

    const values: any[] = [status]

    if (status === 'in_progress') {
      query += `, started_at = COALESCE(started_at, CURRENT_TIMESTAMP)`
    }

    if (status === 'completed') {
      query += `
        , started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
        , completed_at = CURRENT_TIMESTAMP
      `
    }

    if (status === 'cancelled') {
      query += `, completed_at = NULL`
    }

    query += `
      WHERE id = $2
      RETURNING *
    `

    values.push(id)

    const result = await pool.query(query, values)

    return res.status(200).json({
      success: true,
      message: 'Trip status updated successfully',
      trip: result.rows[0],
    })
  } catch (error) {
    console.error('Update trip status error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}