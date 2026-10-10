import { Request, Response } from 'express'
import OpenAI from 'openai'
import { pool } from '../config/db'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type LogisticsData = {
  summary: {
    total_orders: string
    total_trips: string
    total_vehicles: string
    total_quantity_kg: string
  }

  orders: {
    order_number: string
    commodity: string
    quantity_kg: string
    status: string
    priority: string
    source_location: string
    destination_location: string
  }[]

  vehicles: {
    vehicle_number: string
    vehicle_type: string
    capacity_kg: string
    driver_name: string
    status: string
  }[]

  trips: {
    trip_number: string
    status: string
    planned_distance_km: string
    estimated_duration_minutes: number
    order_number: string
    vehicle_number: string
    source_location: string
    destination_location: string
  }[]
}

/* -----------------------------------------
   Database fallback assistant
----------------------------------------- */

const generateFallbackAnswer = (
  question: string,
  data: LogisticsData
): string => {
  const q = question.toLowerCase().trim()

  const summary = data.summary

  // -----------------------------------------
  // Pending Orders
  // -----------------------------------------
  if (
    q.includes('pending order') ||
    q.includes('pending orders') ||
    q.includes('pending')
  ) {
    const pendingOrders = data.orders.filter(
      (order) =>
        order.status.toLowerCase() === 'pending'
    )

    if (pendingOrders.length === 0) {
      return 'There are currently no pending orders.'
    }

    const orderDetails = pendingOrders
      .map(
        (order) =>
          `${order.order_number} (${order.commodity}, ${Number(
            order.quantity_kg
          ).toLocaleString()} KG)`
      )
      .join(', ')

    return `There are ${pendingOrders.length} pending order(s): ${orderDetails}.`
  }

  // -----------------------------------------
  // Total Orders
  // -----------------------------------------
  if (
    q.includes('total order') ||
    q.includes('total orders') ||
    q.includes('how many orders') ||
    q.includes('how many order')
  ) {
    return `There are currently ${summary.total_orders} total order(s) in the system.`
  }

  // -----------------------------------------
  // Available Vehicles
  // IMPORTANT:
  // This MUST be before Total Vehicles.
  // -----------------------------------------
  if (
    q.includes('available vehicle') ||
    q.includes('available vehicles') ||
    q.includes('vehicles available') ||
    q.includes('vehicles are available') ||
    q.includes('vehicle available') ||
    q.includes('vehicle is available') ||
    q.includes('how many vehicles are available') ||
    q.includes('how many vehicle are available') ||
    q.includes('available truck') ||
    q.includes('available trucks') ||
    q.includes('trucks available') ||
    q.includes('trucks are available')
  ) {
    const availableVehicles =
      data.vehicles.filter(
        (vehicle) =>
          vehicle.status.toLowerCase() ===
          'available'
      )

    if (availableVehicles.length === 0) {
      return 'There are currently no vehicles available for assignment.'
    }

    const vehicleDetails = availableVehicles
      .map(
        (vehicle) =>
          `${vehicle.vehicle_number} (${vehicle.vehicle_type}, ${Number(
            vehicle.capacity_kg
          ).toLocaleString()} KG capacity)`
      )
      .join(', ')

    return `${availableVehicles.length} vehicle(s) are currently available: ${vehicleDetails}.`
  }

  // -----------------------------------------
  // Total Vehicles
  // -----------------------------------------
  if (
    q.includes('total vehicle') ||
    q.includes('total vehicles') ||
    q.includes('how many vehicles') ||
    q.includes('how many vehicle') ||
    q === 'vehicles'
  ) {
    return `There are currently ${summary.total_vehicles} vehicle(s) in the system.`
  }

  // -----------------------------------------
  // Vehicle Capacity
  // -----------------------------------------
  if (
    q.includes('capacity') ||
    q.includes('largest vehicle') ||
    q.includes('highest capacity')
  ) {
    if (data.vehicles.length === 0) {
      return 'No vehicle data is currently available.'
    }

    const largestVehicle = [...data.vehicles].sort(
      (a, b) =>
        Number(b.capacity_kg) -
        Number(a.capacity_kg)
    )[0]

    return `${largestVehicle.vehicle_number} has the highest capacity at ${Number(
      largestVehicle.capacity_kg
    ).toLocaleString()} KG.`
  }

  // -----------------------------------------
  // Total Trips
  // -----------------------------------------
  if (
    q.includes('total trip') ||
    q.includes('total trips') ||
    q.includes('how many trips') ||
    q.includes('how many trip')
  ) {
    return `There are currently ${summary.total_trips} trip(s) in the system.`
  }

  // -----------------------------------------
  // Active Trips
  // -----------------------------------------
  if (
    q.includes('active trip') ||
    q.includes('active trips') ||
    q.includes('in progress')
  ) {
    const activeTrips = data.trips.filter(
      (trip) =>
        trip.status.toLowerCase() ===
        'in_progress'
    )

    if (activeTrips.length === 0) {
      return 'There are currently no active trips.'
    }

    return `There are ${activeTrips.length} active trip(s) currently in progress.`
  }

  // -----------------------------------------
  // Completed Trips
  // -----------------------------------------
  if (
    q.includes('completed trip') ||
    q.includes('completed trips')
  ) {
    const completedTrips = data.trips.filter(
      (trip) =>
        trip.status.toLowerCase() ===
        'completed'
    )

    return `${completedTrips.length} trip(s) have been completed.`
  }

  // -----------------------------------------
  // Total Quantity
  // -----------------------------------------
  if (
    q.includes('total quantity') ||
    q.includes('total weight') ||
    q.includes('quantity')
  ) {
    return `The total order quantity is ${Number(
      summary.total_quantity_kg
    ).toLocaleString()} KG.`
  }

  // -----------------------------------------
  // Distance
  // -----------------------------------------
  if (
    q.includes('distance') ||
    q.includes('total distance')
  ) {
    const totalDistance = data.trips.reduce(
      (total, trip) =>
        total +
        Number(
          trip.planned_distance_km || 0
        ),
      0
    )

    return `The total planned trip distance is ${totalDistance.toFixed(
      2
    )} KM.`
  }

  // -----------------------------------------
  // Trip Duration
  // -----------------------------------------
  if (
    q.includes('duration') ||
    q.includes('travel time') ||
    q.includes('trip time')
  ) {
    const totalDuration = data.trips.reduce(
      (total, trip) =>
        total +
        Number(
          trip.estimated_duration_minutes || 0
        ),
      0
    )

    return `The total estimated trip duration is ${totalDuration} minutes.`
  }

  // -----------------------------------------
  // Order Details
  // -----------------------------------------
  if (
    q.includes('order detail') ||
    q.includes('orders details') ||
    q.includes('show orders')
  ) {
    if (data.orders.length === 0) {
      return 'No order data is currently available.'
    }

    const details = data.orders
      .slice(0, 10)
      .map(
        (order) =>
          `${order.order_number}: ${order.commodity}, ${Number(
            order.quantity_kg
          ).toLocaleString()} KG, ${order.status}, ${order.source_location} → ${order.destination_location}`
      )
      .join('\n')

    return `Recent orders:\n${details}`
  }

  // -----------------------------------------
  // Vehicle Details
  // -----------------------------------------
  if (
    q.includes('vehicle detail') ||
    q.includes('vehicles details') ||
    q.includes('show vehicles')
  ) {
    if (data.vehicles.length === 0) {
      return 'No vehicle data is currently available.'
    }

    const details = data.vehicles
      .map(
        (vehicle) =>
          `${vehicle.vehicle_number}: ${vehicle.vehicle_type}, ${Number(
            vehicle.capacity_kg
          ).toLocaleString()} KG, ${vehicle.status}`
      )
      .join('\n')

    return `Current vehicles:\n${details}`
  }

  // -----------------------------------------
  // Trip Details
  // -----------------------------------------
  if (
    q.includes('trip detail') ||
    q.includes('trips details') ||
    q.includes('show trips')
  ) {
    if (data.trips.length === 0) {
      return 'No trip data is currently available.'
    }

    const details = data.trips
      .slice(0, 10)
      .map(
        (trip) =>
          `${trip.trip_number}: ${trip.vehicle_number}, ${trip.source_location} → ${trip.destination_location}, ${trip.planned_distance_km} KM, ${trip.estimated_duration_minutes} min, ${trip.status}`
      )
      .join('\n')

    return `Recent trips:\n${details}`
  }

  // -----------------------------------------
  // Help
  // -----------------------------------------
  if (
    q.includes('help') ||
    q.includes('what can you do') ||
    q.includes('what can i ask')
  ) {
    return `I can help with logistics information such as pending orders, available vehicles, vehicle capacity, total trips, active trips, quantities, route distance, trip duration, and order or vehicle details.`
  }

  // -----------------------------------------
  // Generic Summary
  // -----------------------------------------
  return `Current logistics summary: ${summary.total_orders} order(s), ${summary.total_vehicles} vehicle(s), ${summary.total_trips} trip(s), and ${Number(
    summary.total_quantity_kg
  ).toLocaleString()} KG of total order quantity.`
}

/* -----------------------------------------
   AI Assistant Controller
----------------------------------------- */

export const askAssistant = async (
  req: Request,
  res: Response
) => {
  try {
    const { message } = req.body || {}

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      })
    }

    // -----------------------------------------
    // Get Orders
    // -----------------------------------------
    const ordersResult = await pool.query(`
      SELECT
        o.order_number,
        o.commodity,
        o.quantity_kg,
        o.status,
        o.priority,
        s.name AS source_location,
        d.name AS destination_location
      FROM orders o
      JOIN locations s
        ON o.source_location_id = s.id
      JOIN locations d
        ON o.destination_location_id = d.id
      ORDER BY o.created_at DESC
      LIMIT 20
    `)

    // -----------------------------------------
    // Get Vehicles
    // -----------------------------------------
    const vehiclesResult = await pool.query(`
      SELECT
        vehicle_number,
        vehicle_type,
        capacity_kg,
        driver_name,
        status
      FROM vehicles
      ORDER BY id
    `)

    // -----------------------------------------
    // Get Trips
    // -----------------------------------------
    const tripsResult = await pool.query(`
      SELECT
        t.trip_number,
        t.status,
        t.planned_distance_km,
        t.estimated_duration_minutes,
        o.order_number,
        v.vehicle_number,
        s.name AS source_location,
        d.name AS destination_location
      FROM trips t
      JOIN orders o
        ON t.order_id = o.id
      JOIN vehicles v
        ON t.vehicle_id = v.id
      JOIN locations s
        ON t.source_location_id = s.id
      JOIN locations d
        ON t.destination_location_id = d.id
      ORDER BY t.created_at DESC
      LIMIT 20
    `)

    // -----------------------------------------
    // Get Summary
    // -----------------------------------------
    const summaryResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM trips) AS total_trips,
        (SELECT COUNT(*) FROM vehicles) AS total_vehicles,
        (
          SELECT COALESCE(SUM(quantity_kg), 0)
          FROM orders
        ) AS total_quantity_kg
    `)

    const logisticsData: LogisticsData = {
      summary: summaryResult.rows[0],
      orders: ordersResult.rows,
      vehicles: vehiclesResult.rows,
      trips: tripsResult.rows,
    }

    // -----------------------------------------
    // Direct Database Questions
    // -----------------------------------------
    // These questions always use PostgreSQL data.
    // OpenAI is not used for direct numeric/status
    // questions to avoid incorrect interpretation.

    const directDataQuestionPatterns = [
      'pending',

      'available vehicle',
      'available vehicles',
      'vehicles available',
      'vehicles are available',
      'vehicle available',
      'vehicle is available',
      'how many vehicles are available',
      'how many vehicle are available',

      'available truck',
      'available trucks',
      'trucks available',
      'trucks are available',

      'total vehicle',
      'total vehicles',
      'how many vehicle',

      'total order',
      'total orders',
      'how many orders',

      'total trip',
      'total trips',
      'how many trips',

      'active trip',
      'active trips',
      'completed trip',
      'completed trips',

      'total quantity',
      'total weight',
      'quantity',

      'distance',
      'total distance',

      'duration',
      'travel time',
      'trip time',

      'largest vehicle',
      'highest capacity',
      'capacity',
    ]

    const normalizedMessage =
      message.toLowerCase().trim()

    const isDirectDataQuestion =
      directDataQuestionPatterns.some(
        (pattern) =>
          normalizedMessage.includes(pattern)
      )

    if (isDirectDataQuestion) {
      const fallbackAnswer =
        generateFallbackAnswer(
          message,
          logisticsData
        )

      return res.status(200).json({
        success: true,
        source: 'database',
        message: fallbackAnswer,
      })
    }

    // -----------------------------------------
    // Try OpenAI for general questions
    // -----------------------------------------
    if (process.env.OPENAI_API_KEY) {
      try {
        const response =
          await client.responses.create({
            model:
              process.env.OPENAI_MODEL ||
              'gpt-5.6-luna',

            instructions: `
You are LogiMind AI, an intelligent logistics assistant.

Your job is to answer questions using the logistics
data provided by the application.

Rules:
- Use the provided database data as the source of truth.
- Do not invent orders, vehicles, trips, quantities or locations.
- If the data does not contain the answer, clearly say that.
- Keep answers concise and useful.
- Mention relevant numbers when available.
- Explain logistics information in simple language.
            `,

            input: `
LOGISTICS DATA:

${JSON.stringify(
  logisticsData,
  null,
  2
)}

USER QUESTION:

${message}
            `,
          })

        return res.status(200).json({
          success: true,
          source: 'openai',
          message: response.output_text,
        })
      } catch (openAIError) {
        console.error(
          'OpenAI unavailable, using fallback:',
          openAIError
        )
      }
    }

    // -----------------------------------------
    // Database Fallback
    // -----------------------------------------
    const fallbackAnswer =
      generateFallbackAnswer(
        message,
        logisticsData
      )

    return res.status(200).json({
      success: true,
      source: 'database-fallback',
      message: fallbackAnswer,
    })
  } catch (error) {
    console.error(
      'AI Assistant error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'AI Assistant failed',
    })
  }
}