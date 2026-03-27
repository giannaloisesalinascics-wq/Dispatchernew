"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";

// Disable SSR for Map due to Leaflet breaking the window
const IncidentsMap = dynamic(() => import("./IncidentsMap"), { ssr: false });

export default function IncidentsView() {
  const [tab, setTab] = useState("All");
  const [searchId, setSearchId] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [incidents, setIncidents] = useState<any[]>([]);
  
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [dispatchOrders, setDispatchOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchIncidents() {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setIncidents(data);
      }
    }
    fetchIncidents();
  }, [supabase]);

  const totalInProgress = incidents.filter(i => i.status !== 'completed' && i.status !== 'closed').length;
  const totalCompleted = incidents.filter(i => i.status === 'completed' || i.status === 'closed').length;

  const filteredIncidents = incidents.filter(i => {
    const isDone = i.status === 'completed' || i.status === 'closed';
    if (tab === "Proceeding" && isDone) return false;
    if (tab === "Completed" && !isDone) return false;
    
    const displayId = (i.ticket_id || i.id || '').toLowerCase();
    if (searchId && !displayId.includes(searchId.toLowerCase())) return false;
    
    const searchBody = JSON.stringify(i).toLowerCase();
    if (filterQuery && !searchBody.includes(filterQuery.toLowerCase())) return false;

    return true;
  });

  const handleIncidentClick = async (inc: any) => {
    setSelectedIncident(inc);
    setLoadingOrders(true);
    // Fetch dispatch orders for this incident
    const { data } = await supabase.from('dispatch_orders').select('*').eq('incident_id', inc.id);
    setDispatchOrders(data || []);
    setLoadingOrders(false);
  };

  return (
    <div className="flex bg-[#f2f2f2] h-[calc(100vh-66px)] w-full relative">
      <div className="w-[360px] bg-white h-full flex flex-col shadow-[4px_0_12px_rgba(0,0,0,0.05)] z-10 relative">
        <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Incidents</h1>
            <div className="relative w-40">
              <input type="text" placeholder="Search Ticket ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="w-full border border-gray-300 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-[#f2552c]" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs text-opacity-70 pointer-events-none">🔍</span>
            </div>
          </div>
          <div className="relative">
            <input type="text" placeholder="Filter Search" value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#f2552c]" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm text-opacity-70 pointer-events-none">🔍</span>
          </div>
          
          <div className="flex gap-3 mt-1">
            <div className="flex-1 bg-white border-l-4 border-l-[#f08b1d] shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-r-lg p-3 text-left">
              <div className="text-[26px] leading-none font-bold text-gray-800">{totalInProgress}</div>
              <div className="text-[12px] mt-1 font-semibold text-gray-500 tracking-tight">In Progress</div>
            </div>
            <div className="flex-1 bg-white border-l-4 border-l-[#3fd1c8] shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-r-lg p-3 text-left">
              <div className="text-[26px] leading-none font-bold text-gray-800">{totalCompleted}</div>
              <div className="text-[12px] mt-1 font-semibold text-gray-500 tracking-tight">Completed</div>
            </div>
          </div>

          <div className="flex bg-[#eaedf0] p-1.5 rounded-xl mt-2">
            {["All", "Proceeding", "Completed"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-[13px] font-semibold py-1.5 rounded-[8px] transition ${tab === t ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-8">
          {filteredIncidents.map((inc) => {
            const timeRaw = new Date(inc.created_at || new Date());
            const formattedTime = isNaN(timeRaw.getTime()) 
              ? '' 
              : timeRaw.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const displayId = inc.ticket_id || inc.id || 'INC-000';
            const locationStr = inc.location || inc.city || 'Unknown Location';
            const displayStatus = (inc.status === 'completed' || inc.status === 'closed') ? 'completed' : 'in-progress';

            return (
              <div key={inc.id} onClick={() => handleIncidentClick(inc)} className="flex bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100 p-3 items-center justify-between group cursor-pointer hover:shadow-md transition gap-2">
                <div className={`w-1.5 h-12 self-center rounded-full ${displayStatus === 'in-progress' ? 'bg-[#e8862e]' : 'bg-[#3fd1c8]'}`}></div>
                <div className="flex-1 px-2 flex justify-between items-center text-sm gap-2">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 font-medium">ID</div>
                    <div className="font-bold text-[13px] text-gray-800">{displayId}</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-[10px] text-gray-400 font-medium">Time of Occurrence</div>
                    <div className="font-semibold text-[13px] text-gray-700">{formattedTime}</div>
                  </div>
                  <div className="text-right flex-1">
                    <div className="text-[10px] text-gray-400 font-medium">Location</div>
                    <div className="font-semibold text-[13px] text-gray-700">{locationStr}</div>
                  </div>
                </div>
                <div className="text-gray-400 pr-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatch Orders Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl relative flex flex-col p-0 overflow-hidden border border-gray-200">
             
             <div className="bg-gray-50 border-b border-gray-200 px-7 py-5 flex justify-between items-center">
                 <h2 className="text-[19px] font-bold text-gray-900 tracking-tight">Active Dispatch Orders</h2>
                 <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-red-500 font-black text-3xl leading-none transition-colors">&times;</button>
             </div>
             
             <div className="px-7 py-3 bg-white border-b border-gray-100 flex gap-8 text-[13px]">
                <div><span className="text-gray-400 font-bold tracking-wide mr-2 text-[11px] uppercase">Ticket ID</span> <span className="font-extrabold text-gray-800">{selectedIncident.ticket_id || selectedIncident.id}</span></div>
                <div><span className="text-gray-400 font-bold tracking-wide mr-2 text-[11px] uppercase">Location</span> <span className="font-extrabold text-gray-800">{selectedIncident.location || selectedIncident.city || 'Unknown'}</span></div>
             </div>
             
             <div className="p-7 bg-white max-h-[60vh] overflow-y-auto relative">
                 {loadingOrders ? (
                   <div className="text-center py-12">
                     <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full font-bold tracking-widest text-[11px] animate-pulse uppercase shadow-inner border border-gray-200">Searching Active Units...</span>
                   </div>
                 ) : dispatchOrders.length > 0 ? (
                   <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                     <table className="w-full text-left text-[14px]">
                       <thead>
                         <tr className="bg-gray-50 border-b border-gray-200">
                           <th className="py-3 px-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider">Unit ID</th>
                           <th className="py-3 px-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider">Type</th>
                           <th className="py-3 px-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider text-center">Status</th>
                           <th className="py-3 px-4 font-bold text-gray-500 uppercase text-[11px] tracking-wider">ETA / Desc</th>
                         </tr>
                       </thead>
                       <tbody>
                         {dispatchOrders.map(order => {
                           const statusColor = (order.status || '').toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
                           return (
                             <tr key={order.id} className="border-b border-gray-100/60 transition hover:bg-gray-50">
                               <td className="py-3 px-4 font-bold tracking-tight text-gray-800">{order.unit_id || order.id}</td>
                               <td className="py-3 px-4 font-bold text-gray-600">{order.unit_type || 'Unknown'}</td>
                               <td className="py-3 px-4 text-center">
                                  <span className={`${statusColor} px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide inline-block shadow-sm`}>
                                     {order.status || 'Dispatched'}
                                  </span>
                               </td>
                               <td className="py-3 px-4 text-[13px] font-semibold text-gray-600">{order.eta || order.description || 'N/A'}</td>
                             </tr>
                           )
                         })}
                       </tbody>
                     </table>
                   </div>
                 ) : (
                   <div className="bg-[#fafafa] py-14 rounded-xl flex items-center justify-center border-2 border-gray-200 border-dashed m-1">
                      <span className="text-gray-400 font-bold tracking-wider uppercase text-[12px]">No Dispatch Orders Found for this Incident</span>
                   </div>
                 )}
             </div>
             
             <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                <button onClick={() => setSelectedIncident(null)} className="px-6 py-2 bg-white border border-gray-300 rounded-full text-[13px] font-bold text-gray-700 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:bg-gray-100 active:scale-95 transition-all">Close Window</button>
             </div>
          </div>
        </div>
      )}

      {/* Map Area */}
      <div className="flex-1 relative z-0 h-full bg-blue-50/50">
        <IncidentsMap incidents={filteredIncidents} />
        
        {/* Map Overlays */}
        <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-start pointer-events-none">
          {/* Rescue Monitoring Info */}
          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-[14px] p-3 pointer-events-auto flex items-center gap-6">
            <h2 className="text-[15px] font-bold text-gray-800 pl-1">Rescue Monitoring</h2>
            <div className="flex gap-4 border-l border-gray-200 pl-5 pr-2">
               <div className="flex flex-col items-center gap-1.5">
                 <div className="w-3.5 h-3.5 rounded-full bg-[#32db44] border-2 border-white shadow-sm"></div>
                 <span className="text-[10px] font-bold text-gray-600">Situation Under Control</span>
               </div>
               <div className="flex flex-col items-center gap-1.5">
                 <div className="w-3.5 h-3.5 rounded-full bg-[#f08b1d] border-2 border-white shadow-sm"></div>
                 <span className="text-[10px] font-bold text-gray-600">Situation Escalating</span>
               </div>
               <div className="flex flex-col items-center gap-1.5">
                 <div className="w-3.5 h-3.5 rounded-full bg-[#d11d1d] border-2 border-white shadow-sm"></div>
                 <span className="text-[10px] font-bold text-gray-600">Situation Critical</span>
               </div>
            </div>
          </div>

          {/* Map Filters */}
          <div className="pointer-events-auto flex gap-3">
             <div className="relative">
                 <select 
                    value={tab} 
                    onChange={(e) => setTab(e.target.value)} 
                    className="bg-white/95 shadow-md border border-gray-200 rounded-full pl-4 pr-10 py-[9px] text-[13px] font-medium text-gray-600 focus:outline-none focus:border-gray-300 appearance-none">
                    <option value="All">All Status</option>
                    <option value="Proceeding">In progress</option>
                    <option value="Completed">Completed</option>
                 </select>
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-t-[5px] border-b-0 border-x-[5px] border-transparent border-t-gray-500 w-0 h-0"></span>
             </div>
             
             <div className="relative">
                <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Search Ticket" className="bg-white/95 shadow-md border border-gray-200 rounded-full pl-4 pr-10 py-[9px] text-[13px] font-medium text-gray-600 focus:outline-none focus:border-gray-300 w-44" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm opacity-70 cursor-pointer">🔍</span>
             </div>

             <div className="relative border-l border-transparent">
                <input type="text" value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)} placeholder="Filter Incident eg. road accident" className="bg-white/95 shadow-md border border-gray-200 rounded-full pl-4 pr-10 py-[9px] text-[13px] font-medium text-gray-600 focus:outline-none focus:border-gray-300 w-64" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm opacity-70 cursor-pointer">🔍</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
