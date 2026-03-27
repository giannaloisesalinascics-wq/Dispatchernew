"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorObj, setErrorObj] = useState<string | null>(null);
  
  const supabase = createClient();

  // Note: listing users requires a service_role key accessed via an API route. 
  // We'll call the API route here.
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    setErrorObj(null);
    try {
      const res = await fetch("/api/admin/dispatchers");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch dispatchers");
      }
      
      setPendingUsers(data || []);
    } catch (err: any) {
      setErrorObj(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveDispatcher = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/dispatchers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Approval failed");
      }
      
      // Update UI
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      alert("Dispatcher approved successfully!");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const rejectDispatcher = async (userId: string) => {
    if (!confirm("Are you sure you want to reject and delete this application?")) return;
    
    try {
      const res = await fetch(`/api/admin/dispatchers?id=${userId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Deletion failed");
      }
      
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1000px] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <header className="bg-[#f2552c] px-8 py-6 flex justify-between items-center text-white">
          <div>
            <h1 className="text-2xl font-black tracking-tight">System Administrator</h1>
            <p className="text-sm font-medium opacity-90 mt-1">Pending Dispatcher Approvals</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = "/")} className="bg-white text-[#f2552c] px-5 py-2 rounded-full font-bold shadow-sm hover:scale-105 transition-transform text-sm">
            Sign Out
          </button>
        </header>

        <div className="p-8">
          {errorObj && (
            <div className="mb-6 bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <strong className="block font-bold mb-1">Service Key Required</strong>
                <p className="text-sm">To manage user accounts securely, you must add <code className="bg-red-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your `.env.local` file.</p>
              </div>
              <button onClick={fetchPendingUsers} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest animate-pulse">
              Loading Applications...
            </div>
          ) : pendingUsers.length === 0 && !errorObj ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <span className="text-3xl mb-3 block">✅</span>
              <h2 className="text-gray-500 font-bold tracking-wide">All Caught Up!</h2>
              <p className="text-sm text-gray-400 mt-1">There are no pending dispatcher applications.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingUsers.map(user => (
                <div key={user.id} className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl uppercase shrink-0">
                       {user.user_metadata?.first_name?.[0] || '?'}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-lg text-gray-800 truncate">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-5 space-y-1.5 border border-gray-100">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">Phone:</span>
                      <span className="font-medium">{user.user_metadata?.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-500">ID Number:</span>
                      <span className="font-medium text-gray-800">{user.user_metadata?.id_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-200/60">
                      <span className="font-semibold text-gray-500">Attached ID:</span>
                      {user.user_metadata?.document_filename ? (
                         <button 
                           onClick={() => window.open(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${user.user_metadata.document_filename}`, '_blank')}
                           className="text-[#1f63ff] font-bold text-xs underline hover:opacity-80 transition"
                         >
                           View Document
                         </button>
                      ) : (
                         <span className="text-xs text-red-400 font-bold">MISSING</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => approveDispatcher(user.id)} className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-lg shadow-sm hover:bg-green-600 transition active:scale-95">Approve</button>
                    <button onClick={() => rejectDispatcher(user.id)} className="flex-1 bg-white border border-red-200 text-red-500 font-bold py-2.5 rounded-lg hover:bg-red-50 transition active:scale-95">Deny</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
