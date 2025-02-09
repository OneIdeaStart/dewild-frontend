// src/app/admin/components/Sidebar.tsx
import Link from 'next/link'

export function Sidebar() {
  return (
    <div className="w-64 bg-white shadow min-h-screen">
      <nav className="mt-5 px-2">
        <Link 
          href="/admin" 
          className="group flex items-center px-2 py-2 text-base leading-6 font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <Link 
          href="/admin/applications" 
          className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-100"
        >
          Applications
        </Link>
      </nav>
    </div>
  )
}