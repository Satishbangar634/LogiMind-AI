# LogiMind AI 🚚

**AI-Powered Logistics & Route Optimization Platform**

LogiMind AI is a full-stack web application designed to simplify logistics operations through order management, vehicle management, route optimization, simulations, and analytics.

## Features

- **Dashboard & Analytics** — Monitor logistics operations and key metrics.
- **Order Management** — Manage orders, quantities, priorities, and delivery dates.
- **Vehicle Management** — Track vehicle details, capacity, and availability.
- **Location Management** — Manage warehouses and distribution locations.
- **Trip Management** — Track trips, routes, and delivery status.
- **Route Optimization** — Calculate route distances and estimated travel times.
- **What-if Simulation** — Evaluate vehicle capacity and load utilization.
- **Scenario Comparison** — Compare logistics scenarios.
- **Logistics Insights** — Generate insights from operational data.
- **AI Assistant** — Ask questions about logistics operations.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios, Recharts, Leaflet
- **Backend:** Node.js, Express.js, TypeScript, JWT
- **Database:** PostgreSQL
- **Routing & Maps:** OSRM, OpenStreetMap
- **AI Integration:** OpenAI API

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Configure PostgreSQL and the required environment variables in `backend/.env` before starting the backend.

## Security

Never commit `.env` files, database passwords, JWT secrets, or API keys.

## Developer

Full-Stack Software Developer