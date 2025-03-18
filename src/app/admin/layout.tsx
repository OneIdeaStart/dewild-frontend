import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'  // Only admin header
import { sofia } from '@/styles/fonts'

export const metadata = {
  title: 'DeWild Admin'
}

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sofia.variable}>
      <body>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}