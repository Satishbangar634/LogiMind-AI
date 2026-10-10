# LogiMind AI 🚚

**AI-Powered Logistics & Route Optimization Platform**

LogiMind AI is a full-stack web application designed to simplify logistics operations through order management, vehicle management, route optimization, simulation, and analytics.

## Features

- **Dashboard:** View logistics analytics and operational metrics.
- **Order Management:** Monitor orders, quantities, priorities, and delivery dates.
- **Vehicle Management:** Manage vehicle details, capacity, and availability.
- **Location Management:** Manage warehouses and distribution locations.
- **Trip Management:** Track trips, routes, and delivery status.
- **Route Optimization:** Calculate route distance and estimated duration using OSRM.
- **What-if Simulation:** Evaluate vehicle capacity and load utilization.
- **Scenario Comparison:** Compare two logistics scenarios.
- **Logistics Insights:** Generate insights from current operational data.
- **AI Assistant:** Ask questions about orders, vehicles, and trips.

## Technology Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios, Recharts, Leaflet

**Backend:** Node.js, Express.js, TypeScript, JWT

**Database:** PostgreSQL

**Routing:** OSRM and OpenStreetMap

**AI Integration:** OpenAI API

## Run Locally

### Start the Backend

```bash
cd backend
npm install
npm run dev
```

### Start the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure the PostgreSQL database and backend environment variables in `backend/.env` before starting the application.

**Security:** Never upload `.env` files, database passwords, or API keys to GitHub.

## Developer

Satish Bangar — Full-Stack Software Developer
