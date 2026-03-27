import { useState } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./DispatchLeafletMap'), { ssr: false });

export default function DispatchModal({ incident, onClose }: { incident: any, onClose: () => void }) {
  const displayId = incident?.ticket_id || incident?.id || 'INC-000';
  const displayType = incident?.incident_type || incident?.type || 'Unknown';
  
  const lat = parseFloat(incident?.lat || incident?.latitude) || 14.605;
  const lng = parseFloat(incident?.lng || incident?.longitude) || 121.025;

  return (
    <div className="fixed inset-0 z-[9000] bg-[#4a4a4a] bg-opacity-70 backdrop-blur-[1px] flex justify-center py-6 px-[100px] overflow-y-auto">
      <div className="w-full max-w-[1100px] flex flex-col pt-10 relative">
         <button onClick={onClose} className="absolute top-1 left-0 text-white font-bold text-[22px] flex items-center gap-2 z-10 hover:opacity-80 drop-shadow-md">
            <span>&larr;</span> Back
         </button>

         {/* Inner Content wrapper */}
         <div className="w-full flex flex-col gap-5">
            
            {/* Map Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-4 flex-none" style={{ height: '480px' }}>
               <div className="flex justify-between items-center px-2 pt-1">
                 <div className="flex items-center gap-6">
                    <h2 className="font-[800] text-[17px] text-gray-900 tracking-tight">SELECT AVAILABLE UNITS</h2>
                    <div className="flex items-center gap-[18px] text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                       <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#f08b1d] rounded-full"></span> FIRE</span>
                       <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#3bdced] rounded-full"></span> AMB</span>
                       <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#9f7aea] rounded-full"></span> POL</span>
                       <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border-2 border-black rounded-full overflow-hidden flex"><span className="w-full h-full bg-transparent"></span><span className="w-full h-full bg-black"></span></span> Selected</span>
                    </div>
                 </div>
                 
                 <div className="flex gap-8 items-center text-[13px]">
                    <div className="font-extrabold text-black border-r border-gray-300 pr-8">Ticket ID: {displayId}</div>
                    <div className="font-extrabold text-black pr-8">Type: {displayType}</div>
                    
                    <div className="flex gap-3">
                       <select className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none text-gray-500 font-semibold bg-white shadow-sm">
                          <option>All Units</option>
                       </select>
                       <div className="relative">
                          <input type="text" placeholder={incident?.location || incident?.city || "Search location"} className="border border-gray-300 rounded-md pl-3 pr-8 py-1.5 w-52 text-gray-600 focus:outline-none shadow-sm" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold opacity-70">🔍</span>
                       </div>
                       <button className="text-gray-400 ml-1 transform scale-110 font-bold px-1 hover:text-black transition">⤢</button>
                    </div>
                 </div>
               </div>

               <div className="flex-1 rounded-[14px] overflow-hidden bg-gray-100 relative mt-1">
                  <MapComponent centerLat={lat} centerLng={lng} />
               </div>
            </div>

            {/* Bottom Table Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-none">
               <div className="px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-10 relative">
                  <h2 className="font-bold text-[14px] text-gray-800 tracking-wide">ASSIGNED UNITS</h2>
               </div>
               <div className="px-5 py-3">
                  <table className="w-full text-left text-[14px] text-[#444]">
                     <thead>
                        <tr className="border-b-2 border-gray-100">
                           <th className="py-3 px-4 font-semibold text-gray-500">Unit ID</th>
                           <th className="py-3 px-4 font-semibold text-gray-500">Unit Type</th>
                           <th className="py-3 px-4 font-semibold text-gray-500">Station</th>
                           <th className="py-3 px-4 font-semibold text-gray-500 text-center">Personnel</th>
                           <th className="py-3 px-4 font-semibold text-gray-500">Distance</th>
                           <th className="py-3 px-4 font-semibold text-gray-500">ETA</th>
                           <th className="py-3 px-4 font-semibold text-gray-500">Status</th>
                           <th className="py-3 px-4 font-semibold text-gray-500 text-center">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr className="border-b border-gray-100/60">
                           <td className="py-3 px-4 text-gray-800 font-bold tracking-tight">AMB-03</td>
                           <td className="py-3 px-4 font-bold text-gray-800">AMB</td>
                           <td className="py-3 px-4 font-medium">UERM Hospital</td>
                           <td className="py-3 px-4 text-center font-bold text-gray-800">3</td>
                           <td className="py-3 px-4 font-medium">1.2 km</td>
                           <td className="py-3 px-4 font-medium">5 mins</td>
                           <td className="py-3 px-4 font-bold text-[#32db44]">On Route</td>
                           <td className="py-3 px-4 text-center"><button className="bg-[#ff4d4f] text-white px-5 py-1.5 flex items-center justify-center mx-auto rounded-lg font-bold text-[12px] shadow-sm transition hover:bg-red-600 active:scale-95">Cancel</button></td>
                        </tr>
                        <tr>
                           <td className="py-3 px-4 text-gray-800 font-bold tracking-tight">FIRE-07</td>
                           <td className="py-3 px-4 font-bold text-gray-800">FIRE</td>
                           <td className="py-3 px-4 font-medium">Quezon City Fire District</td>
                           <td className="py-3 px-4 text-center font-bold text-gray-800">7</td>
                           <td className="py-3 px-4 font-medium">900 m</td>
                           <td className="py-3 px-4 font-medium">2 mins</td>
                           <td className="py-3 px-4 font-bold text-[#f2552c]">Assigned</td>
                           <td className="py-3 px-4 text-center"><button className="bg-[#ff4d4f] text-white px-5 py-1.5 flex items-center justify-center mx-auto rounded-lg font-bold text-[12px] shadow-sm transition hover:bg-red-600 active:scale-95">Cancel</button></td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
