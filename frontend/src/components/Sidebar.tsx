import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: '📦',
    },
    {
      name: 'Vehicles',
      path: '/vehicles',
      icon: '🚚',
    },
    {
      name: 'Locations',
      path: '/locations',
      icon: '📍',
    },
    {
      name: 'Trips',
      path: '/trips',
      icon: '🗺️',
    },
    {
      name: 'Route Optimization',
      path: '/route-optimization',
      icon: '🗺️',
    },
    {
      name: 'AI Assistant',
      path: '/ai-assistant',
      icon: '🤖',
    },
    {
      name: 'What-if Simulation',
      path: '/what-if-simulation',
      icon: '🧪',
    },
    {
      name: 'Scenario Comparison',
      path: '/scenario-comparison',
      icon: '⚖️',
    },
  ]

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-40
        h-screen
        w-64
        border-r
        border-slate-200
        bg-white
        px-5
        py-6
      "
    >
      {/* Logo */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          LogiMind AI
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Logistics Intelligence
        </p>
      </div>

      {/* Navigation */}

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
              flex
              items-center
              gap-3
              rounded-lg
              px-4
              py-3
              text-sm
              font-medium
              transition-all
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }
              `
            }
          >
            <span className="text-lg">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar