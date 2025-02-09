// src/app/admin/page.tsx
import { DB } from '@/lib/db'

export default async function AdminPage() {
 const stats = await DB.getStats()

 return (
   <div>
     <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
     
     <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
       {/* Total Applications */}
       <div className="bg-white overflow-hidden shadow rounded-lg">
         <div className="p-5">
           <div className="flex items-center">
             <div className="flex-1">
               <div className="text-sm font-medium text-gray-500 truncate">
                 Total Applications
               </div>
               <div className="mt-1 text-3xl font-semibold text-gray-900">
                 {stats.total}
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* Pending Applications */}
       <div className="bg-white overflow-hidden shadow rounded-lg">
         <div className="p-5">
           <div className="flex items-center">
             <div className="flex-1">
               <div className="text-sm font-medium text-gray-500 truncate">
                 Pending
               </div>
               <div className="mt-1 text-3xl font-semibold text-gray-900">
                 {stats.pending}
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* Approved Applications */}
       <div className="bg-white overflow-hidden shadow rounded-lg">
         <div className="p-5">
           <div className="flex items-center">
             <div className="flex-1">
               <div className="text-sm font-medium text-gray-500 truncate">
                 Approved
               </div>
               <div className="mt-1 text-3xl font-semibold text-yellow-600">
                 {stats.approved}
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* Rejected Applications */}
       <div className="bg-white overflow-hidden shadow rounded-lg">
         <div className="p-5">
           <div className="flex items-center">
             <div className="flex-1">
               <div className="text-sm font-medium text-gray-500 truncate">
                 Rejected
               </div>
               <div className="mt-1 text-3xl font-semibold text-red-600">
                 {stats.rejected}
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 )
}