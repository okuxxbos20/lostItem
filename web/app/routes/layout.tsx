import { Outlet } from 'react-router'

import { Sidebar } from '#app/components/sidebar'

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
