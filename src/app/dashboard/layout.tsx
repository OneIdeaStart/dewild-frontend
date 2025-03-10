// src/app/dashboard/layout.tsx
import { sofia } from '@/styles/fonts'

export const metadata = {
  title: 'DeWild Artist Dashboard'
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <div className="lg:h-[calc(100vh-56px)] mt-[56px]">
        {children}
      </div>
    </div>
  );
}