import { Request, Response } from 'express'
import { pool } from '../config/db'

export const optimizeTripRoute = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params

    const tripResult = await pool.query(
      `
      SELECT
        t.id,
        t.trip_number,
        t.source_location_id,
        t.destination_location_id
      FROM trips t
      WHERE t.id = $1
      `,
      [id]
    )

    if (tripResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      })
    }

    const trip = tripResult.rows[0]

    const locationsResult = await pool.query(
      `
      SELECT
        id,
        name,
        city,
        latitude,
        longitude
      FROM locations
      WHERE id IN ($1, $2)
      `,
      [
        trip.source_location_id,
        trip.destination_location_id,
      ]
    )

    const source = locationsResult.rows.find(
      (location) =>
        location.id === trip.source_location_id
    )

    const destination = locationsResult.rows.find(
      (location) =>
        location.id === trip.destination_location_id
    )

    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Source or destination location not found',
      })
    }

    const coordinates = `${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}`

    const routingResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    )

    if (!routingResponse.ok) {
      return res.status(502).json({
        success: false,
        message: 'OSRM routing service failed',
      })
    }

    const routingData = await routingResponse.json()

    if (
      !routingData.routes ||
      routingData.routes.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: 'No route found',
      })
    }

    const bestRoute = routingData.routes[0]

    const plannedDistanceKm = Number(
      (bestRoute.distance / 1000).toFixed(2)
    )

    const estimatedDurationMinutes = Math.round(
      bestRoute.duration / 60
    )

    const updateResult = await pool.query(
      `
      UPDATE trips
      SET
        planned_distance_km = $1,
        estimated_duration_minutes = $2
      WHERE id = $3
      RETURNING
        id,
        trip_number,
        planned_distance_km,
        estimated_duration_minutes
      `,
      [
        plannedDistanceKm,
        estimatedDurationMinutes,
        id,
      ]
    )

    return res.status(200).json({
      success: true,
      message: 'Trip route optimized successfully',
      trip: updateResult.rows[0],
      route: {
        distance_km: plannedDistanceKm,
        duration_minutes: estimatedDurationMinutes,
        geometry: bestRoute.geometry,
      },
    })
  } catch (error) {
    console.error(
      'Trip route optimization error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to optimize trip route',
    })
  }
}