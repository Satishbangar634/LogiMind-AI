import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

import ProtectedRoute from './components/ProtectedRoute'
import ProtectedLayout from './components/ProtectedLayout'

import Orders from './pages/Orders'
import Vehicles from './pages/Vehicles'
import Locations from './pages/Locations'
import Trips from './pages/Trips'
import RouteOptimization from './pages/RouteOptimization'
import AIAssistant from './pages/AIAssistant'
import WhatIfSimulation from './pages/WhatIfSimulation'
import ScenarioComparison from './pages/ScenarioComparison'


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/vehicles"
              element={<Vehicles />}
            />

            <Route
              path="/locations"
              element={<Locations />}
            />

            <Route
              path="/trips"
              element={<Trips />}
            />

            <Route
              path="/route-optimization"
              element={<RouteOptimization />}
            />

            <Route
              path="/ai-assistant"
              element={<AIAssistant />}
            />

            <Route
              path="/what-if-simulation"
              element={<WhatIfSimulation />}
            />
            
            <Route
               path="/scenario-comparison"
               element={<ScenarioComparison />}
             />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App