// src/app/admin/applications/page.tsx
import { DB } from '@/lib/db'
import { CollabApplication } from '@/types/collab'
import { SearchIcon } from 'lucide-react'
import ActionButtons from '../components/ActionButtons'

export default async function ApplicationsPage({
 searchParams,
}: {
 searchParams: Promise<{ status?: string; q?: string }>;
}) {
 const params = await searchParams;
 const status = params?.status || '';
 const query = params?.q || '';
 
 const applications = await DB.getAllApplications(status, query);

 return (
   <div className="p-6">
     <div className="flex justify-between items-center mb-6">
       <h2 className="text-2xl font-bold">Applications</h2>
       
       <div className="flex gap-4">
         <form className="flex gap-4">
           <div className="relative">
             <input
               type="text"
               name="q"
               placeholder="Search by twitter/discord/wallet..."
               defaultValue={query}
               className="pl-10 pr-4 py-2 border rounded-lg w-64"
             />
             <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
           </div>
           
           <select 
             name="status" 
             defaultValue={status}
             className="border rounded-lg px-4 py-2"
           >
             <option value="">All Status</option>
             <option value="pending">Pending</option>
             <option value="approved">Approved</option>
             <option value="rejected">Rejected</option>
           </select>

           <button 
             type="submit"
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
           >
             Filter
           </button>
         </form>
       </div>
     </div>
     
     <div className="bg-white shadow-sm rounded-lg">
       <table className="min-w-full">
         <thead>
           <tr className="border-b">
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discord</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Twitter</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
           </tr>
         </thead>
         <tbody className="divide-y divide-gray-200">
           {applications?.map((app: CollabApplication) => (
             <tr key={app.id}>
               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.id}</td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.discord}</td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                 <a 
                   href={`https://x.com/${app.twitter}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-indigo-600 hover:text-indigo-900"
                 >
                   {app.twitter}
                 </a>
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                   ${app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                     app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                     'bg-yellow-100 text-yellow-800'}`}>
                   {app.status}
                 </span>
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                 {new Date(app.createdAt).toLocaleDateString()}
               </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium max-w-32">
                 <ActionButtons id={app.id} status={app.status} />
               </td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>
   </div>
 );
}