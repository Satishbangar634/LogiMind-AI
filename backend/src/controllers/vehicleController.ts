import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getVehicles = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM vehicles
       ORDER BY created_at DESC`
    )

    return res.status(200).json({
      success: true,
      vehicles: result.rows,
    })
  } catch (error) {
    console.error('Get vehicles error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const {
      vehicle_number,
      vehicle_type,
      capacity_kg,
      driver_name,
      driver_phone,
    } = req.body || {}

    if (!vehicle_number || !capacity_kg) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number and capacity are required',
      })
    }

    const existingVehicle = await pool.query(
      `SELECT id
       FROM vehicles
       WHERE vehicle_number = $1`,
      [vehicle_number]
    )

    if (existingVehicle.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle number already exists',
      })
    }

    const result = await pool.query(
      `INSERT INTO vehicles
       (
         vehicle_number,
         vehicle_type,
         capacity_kg,
         driver_name,
         driver_phone
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        vehicle_number,
        vehicle_type || null,
        capacity_kg,
        driver_name || null,
        driver_phone || null,
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle: result.rows[0],
    })
  } catch (error) {
    console.error('Create vehicle error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const {
      vehicle_number,
      vehicle_type,
      capacity_kg,
      driver_name,
      driver_phone,
      status,
    } = req.body || {}

    if (!vehicle_number || !capacity_kg) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number and capacity are required',
      })
    }

    const existingVehicle = await pool.query(
      `SELECT id
       FROM vehicles
       WHERE vehicle_number = $1
       AND id != $2`,
      [vehicle_number, id]
    )

    if (existingVehicle.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle number already exists',
      })
    }

    const result = await pool.query(
      `UPDATE vehicles
       SET
         vehicle_number = $1,
         vehicle_type = $2,
         capacity_kg = $3,
         driver_name = $4,
         driver_phone = $5,
         status = $6
       WHERE id = $7
       RETURNING *`,
      [
        vehicle_number,
        vehicle_type || null,
        capacity_kg,
        driver_name || null,
        driver_phone || null,
        status || 'available',
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: result.rows[0],
    })
  } catch (error) {
    console.error('Update vehicle error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `DELETE FROM vehicles
       WHERE id = $1
       RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully',
    })
  } catch (error) {
    console.error('Delete vehicle error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}