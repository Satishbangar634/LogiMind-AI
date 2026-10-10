import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 min-h-screen bg-slate-50">
        <div className="w-full px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default ProtectedLayout