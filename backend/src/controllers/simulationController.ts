import { Request, Response } from 'express'
import { pool } from '../config/db'

export const simulateRoute = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      source_location_id,
      destination_location_id,
      vehicle_id,
      quantity_kg,
    } = req.body

    if (
      !source_location_id ||
      !destination_location_id ||
      !vehicle_id ||
      quantity_kg === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Source, destination, vehicle and quantity are required',
      })
    }

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
      [source_location_id, destination_location_id]
    )

    const source = locationsResult.rows.find(
      (location) => location.id === Number(source_location_id)
    )

    const destination = locationsResult.rows.find(
      (location) =>
        location.id === Number(destination_location_id)
    )

    if (!source || !destination) {
      return res.status(404).json({
        success: false,
        message: 'Source or destination location not found',
      })
    }

    const vehicleResult = await pool.query(
      `
      SELECT
        id,
        vehicle_number,
        vehicle_type,
        capacity_kg,
        driver_name,
        status
      FROM vehicles
      WHERE id = $1
      `,
      [vehicle_id]
    )

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      })
    }

    const vehicle = vehicleResult.rows[0]

    const quantity = Number(quantity_kg)
    const capacity = Number(vehicle.capacity_kg)

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      })
    }

    if (quantity > capacity) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds vehicle capacity of ${capacity} KG`,
      })
    }

    const coordinates =
      `${source.longitude},${source.latitude};` +
      `${destination.longitude},${destination.latitude}`

    const routingResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
    )

    if (!routingResponse.ok) {
      return res.status(502).json({
        success: false,
        message: 'Routing service failed',
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

    const route = routingData.routes[0]

    const distanceKm = Number(
      (route.distance / 1000).toFixed(2)
    )

    const durationMinutes = Math.round(
      route.duration / 60
    )

    const utilization = Number(
      ((quantity / capacity) * 100).toFixed(2)
    )

    return res.status(200).json({
      success: true,
      message: 'Route simulation completed',
      simulation: {
        source: source.name,
        destination: destination.name,

        vehicle: {
          id: vehicle.id,
          vehicle_number: vehicle.vehicle_number,
          vehicle_type: vehicle.vehicle_type,
          capacity_kg: capacity,
        },

        quantity_kg: quantity,

        vehicle_utilization_percent: utilization,

        route: {
          distance_km: distanceKm,
          duration_minutes: durationMinutes,
          geometry: route.geometry,
        },
      },
    })
  } catch (error) {
    console.error('Route simulation error:', error)

    return res.status(500).json({
      success: false,
      message: 'Route simulation failed',
    })
  }
}