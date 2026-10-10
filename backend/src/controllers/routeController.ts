import { Request, Response } from 'express'
import { pool } from '../config/db'

export const optimizeRoute = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      source_location_id,
      destination_location_id,
    } = req.body || {}

    if (!source_location_id || !destination_location_id) {
      return res.status(400).json({
        success: false,
        message:
          'Source location and destination location are required',
      })
    }

    if (source_location_id === destination_location_id) {
      return res.status(400).json({
        success: false,
        message:
          'Source and destination locations must be different',
      })
    }

    const result = await pool.query(
      `SELECT
        id,
        name,
        city,
        state,
        latitude,
        longitude,
        location_type
       FROM locations
       WHERE id IN ($1, $2)
       ORDER BY id`,
      [source_location_id, destination_location_id]
    )

    if (result.rows.length !== 2) {
      return res.status(404).json({
        success: false,
        message: 'One or both locations not found',
      })
    }

    const source = result.rows.find(
      (location) => location.id === Number(source_location_id)
    )

    const destination = result.rows.find(
      (location) => location.id === Number(destination_location_id)
    )

    if (!source || !destination) {
      return res.status(404).json({
        success: false,
        message: 'Source or destination not found',
      })
    }

    /*
      Temporary route calculation.

      Later this will be replaced with
      Google Maps / routing API.
    */

    const coordinates = `${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}`

const routingResponse = await fetch(
  `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
)

if (!routingResponse.ok) {
  return res.status(502).json({
    success: false,
    message: 'Routing service unavailable',
  })
}

const routingData = await routingResponse.json()

if (
  !routingData.routes ||
  routingData.routes.length === 0
) {
  return res.status(404).json({
    success: false,
    message: 'No route found between selected locations',
  })
}

const bestRoute = routingData.routes[0]

const plannedDistanceKm = Number(
  (bestRoute.distance / 1000).toFixed(2)
)

const estimatedDurationMinutes = Math.round(
  bestRoute.duration / 60
)

const routeGeometry = bestRoute.geometry

    return res.status(200).json({
      success: true,
      message: 'Route optimized successfully',

      route: {
        source: {
          id: source.id,
          name: source.name,
          city: source.city,
          latitude: source.latitude,
          longitude: source.longitude,
        },

        destination: {
          id: destination.id,
          name: destination.name,
          city: destination.city,
          latitude: destination.latitude,
          longitude: destination.longitude,
        },

        planned_distance_km: plannedDistanceKm,
        estimated_duration_minutes:
          estimatedDurationMinutes,
          geometry: routeGeometry,

        optimization: {
          distance_saved_km: 0,
          time_saved_minutes: 0,
          recommendation:
            'Direct route selected for current route data',
        },
      },
    })
  } catch (error) {
    console.error('Route optimization error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}