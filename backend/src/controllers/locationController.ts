import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getLocations = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM locations
       ORDER BY created_at DESC`
    )

    return res.status(200).json({
      success: true,
      locations: result.rows,
    })
  } catch (error) {
    console.error('Get locations error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const createLocation = async (req: Request, res: Response) => {
  try {
    const {
      name,
      city,
      state,
      latitude,
      longitude,
      location_type,
    } = req.body || {}

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required',
      })
    }

    const result = await pool.query(
      `INSERT INTO locations
       (
         name,
         city,
         state,
         latitude,
         longitude,
         location_type
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        city || null,
        state || null,
        latitude ?? null,
        longitude ?? null,
        location_type || 'warehouse',
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Location created successfully',
      location: result.rows[0],
    })
  } catch (error) {
    console.error('Create location error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const {
      name,
      city,
      state,
      latitude,
      longitude,
      location_type,
    } = req.body || {}

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required',
      })
    }

    const result = await pool.query(
      `UPDATE locations
       SET
         name = $1,
         city = $2,
         state = $3,
         latitude = $4,
         longitude = $5,
         location_type = $6
       WHERE id = $7
       RETURNING *`,
      [
        name,
        city || null,
        state || null,
        latitude ?? null,
        longitude ?? null,
        location_type || 'warehouse',
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      location: result.rows[0],
    })
  } catch (error) {
    console.error('Update location error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `DELETE FROM locations
       WHERE id = $1
       RETURNING id`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
    })
  } catch (error) {
    console.error('Delete location error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}