"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import MetroManilaLiveMap from "../../components/MetroManilaLiveMap";
import IncidentsView from "../../components/IncidentsView";
import DispatchModal from "../../components/DispatchModal";
import { createClient } from "../../utils/supabase/client";

type Incident = {
  id: string;
  type: string;
  location: string;
  timeReported: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  ticketStatus: "View Ticket" | "Waiting";
};

type ResourceType = "ALL" | "FIRE" | "AMB" | "POL";

type TicketDetails = {
  ticketId: string;
  incidentType: string;
  priorityLevel: string;
  status: string;
  timeReported: string;
  reportedBy: string;
  location: string;
  coordinates: string;
  nearestLandmark: string;
  description: string[];
  possibleCasualties: string;
  infrastructureDamage: string;
  imageUrl?: string;
};

const INCIDENTS: Incident[] = [
  {
    id: "INC-0145",
    type: "Fire",
    location: "1113 Aurora Blvd",
    timeReported: "1 min ago",
    priority: "HIGH",
    ticketStatus: "View Ticket",
  },
  {
    id: "INC-0146",
    type: "Fire",
    location: "Pnoval St.",
    timeReported: "1 min ago",
    priority: "HIGH",
    ticketStatus: "View Ticket",
  },
  {
    id: "INC-0147",
    type: "Flood",
    location: "Dapitan St.",
    timeReported: "2 mins ago",
    priority: "MEDIUM",
    ticketStatus: "Waiting",
  },
  {
    id: "INC-0148",
    type: "Medical Emergency",
    location: "Lacson Avenue",
    timeReported: "2 mins ago",
    priority: "MEDIUM",
    ticketStatus: "Waiting",
  },
  {
    id: "INC-0149",
    type: "Road Accident",
    location: "Cayco St",
    timeReported: "2 mins ago",
    priority: "MEDIUM",
    ticketStatus: "Waiting",
  },
  {
    id: "INC-0150",
    type: "Road Accident",
    location: "Aurora Blvd.",
    timeReported: "3 mins ago",
    priority: "LOW",
    ticketStatus: "Waiting",
  },
  {
    id: "INC-0151",
    type: "Medical Emergency",
    location: "Brgy San Felipe",
    timeReported: "3 mins ago",
    priority: "LOW",
    ticketStatus: "Waiting",
  },
];

const TICKET_DETAILS: Record<string, TicketDetails> = {
  "INC-0145": {
    ticketId: "INC - 0145",
    incidentType: "Fire",
    priorityLevel: "High",
    status: "Pending Dispatch",
    timeReported: "2:14 PM",
    reportedBy: "John Cruz",
    location:
      "1113 Aurora Blvd, Guirayan St, Mezza II Residences,\nBrgy. Dona Imelda, Quezon City, Metro Manila",
    coordinates: "14.5995° N, 120.9842° E",
    nearestLandmark: "UERM Hospital",
    description: [
      "Unit fire reported. Flames visible from the balcony.",
      "Residents still inside the unit.",
      "Heavy smoke in surrounding area.",
    ],
    possibleCasualties: "Yes",
    infrastructureDamage: "Possible",
  },
  "INC-0146": {
    ticketId: "INC - 0146",
    incidentType: "Fire",
    priorityLevel: "High",
    status: "Pending Dispatch",
    timeReported: "2:16 PM",
    reportedBy: "Maria Santos",
    location:
      "P. Noval St., Sampaloc, Manila,\nNear University Belt, Metro Manila",
    coordinates: "14.6108° N, 120.9894° E",
    nearestLandmark: "University of Santo Tomas",
    description: [
      "Fire alarm triggered in a mixed-use building.",
      "Thick smoke seen near the second floor.",
      "Evacuation ongoing at the time of report.",
    ],
    possibleCasualties: "Unknown",
    infrastructureDamage: "Under Assessment",
  },
};

function PriorityDot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "linear-gradient(180deg, #ff5a5a 0%, #c70000 100%)",
        verticalAlign: "middle",
        marginLeft: 6,
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5)",
      }}
    />
  );
}

export default function DashboardPage() {
  const [isActive, setIsActive] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState("Dashboard");
  const [mapSearch, setMapSearch] = useState("");
  const [searchNonce, setSearchNonce] = useState(0);
  const [searchStatus, setSearchStatus] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("ALL");
  const [openTicketId, setOpenTicketId] = useState<any>(null);
  
  const [dbIncidents, setDbIncidents] = useState<any[]>([]);
  const [verifyingIncident, setVerifyingIncident] = useState<any>(null);
  const [dispatchingIncident, setDispatchingIncident] = useState<any>(null);
  const supabase = createClient();

  // Load from Supabase
  const fetchIncidents = useCallback(async () => {
    const { data } = await supabase.from('incident_reports').select('*').order('created_at', { ascending: false });
    if (data) setDbIncidents(data);
  }, [supabase]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Fallback to INCIDENTS array structure if DB doesn't have proper layout yet
  const pendingIncidents = dbIncidents.length > 0
    ? dbIncidents.filter(i => i.status !== 'completed' && i.status !== 'invalid' && i.status !== 'in-progress' && i.status !== 'resolved')
    : INCIDENTS;

  const handleDispatch = (inc: any) => {
    setVerifyingIncident(inc);
  };

  const markInvalid = async (id: string) => {
    // If it's a mock ID, ignore
    if (id.toString().startsWith("INC-")) return;
    await supabase.from('incident_reports').update({ status: 'invalid' }).eq('id', id);
    fetchIncidents();
  };

  const confirmVerification = async (inc: any) => {
    if (!inc.id.toString().startsWith("INC-")) {
      await supabase.from('incident_reports').update({ status: 'in-progress' }).eq('id', inc.id);
      fetchIncidents();
    }
    setVerifyingIncident(null);
    setDispatchingIncident(inc);
  };

  const submitMapSearch = () => {
    setSearchNonce((prev) => prev + 1);
  };

  const resetMapSearch = () => {
    setMapSearch("");
    setSearchNonce((prev) => prev + 1);
  };

  const openTicket = (incident: any) => {
    setOpenTicketId(incident);
  };

  const closeTicket = () => {
    setOpenTicketId(null);
  };

  const activeTicketInfo = useMemo(() => {
    if (!openTicketId) return null;
    if (typeof openTicketId === 'string') return TICKET_DETAILS[openTicketId];
    // Map DB object to mockup interface
    return {
      ticketId: openTicketId.ticket_id || openTicketId.id || "INC-000",
      incidentType: openTicketId.incident_type || openTicketId.type || "Unknown",
      priorityLevel: openTicketId.priority || "High",
      status: openTicketId.status || "Pending",
      timeReported: new Date(openTicketId.created_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reportedBy: openTicketId.reported_by || "Citizen",
      location: openTicketId.location || "Unknown",
      coordinates: openTicketId.coordinates || `${openTicketId.lat || ''}, ${openTicketId.lng || ''}`,
      nearestLandmark: openTicketId.nearest_landmark || "N/A",
      description: [openTicketId.description || "No description provided."],
      possibleCasualties: openTicketId.casualties || "Unknown",
      infrastructureDamage: openTicketId.infrastructure_damage || "Unknown",
      imageUrl: openTicketId.image_url
    };
  }, [openTicketId]);

  return (
    <main className="drms-page-bg">
      <div className="drms-page-overlay" />

      <div className="drms-dashboard-layout">
        <aside
          className={`drms-sidebar-fixed ${
            isSidebarCollapsed ? "drms-sidebar-collapsed" : "drms-sidebar-expanded"
          }`}
        >
          <div className="drms-sidebar-top-area">
            <button
              type="button"
              className="drms-sidebar-toggle"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <nav className="drms-sidebar-nav">
            <button
              type="button"
              className={`drms-sidebar-link ${currentView === "Dashboard" ? "drms-sidebar-link-active" : ""}`}
              onClick={() => setCurrentView("Dashboard")}
            >
              <img src="/Dashboard-icon.png" alt="Dashboard" className="drms-sidebar-icon" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </button>

            <button
              type="button"
              className={`drms-sidebar-link ${currentView === "Incidents" ? "drms-sidebar-link-active" : ""}`}
              onClick={() => setCurrentView("Incidents")}
            >
              <img src="/Incidents-icon.png" alt="Incidents" className="drms-sidebar-icon" />
              {!isSidebarCollapsed && <span>Incidents</span>}
            </button>

            <button type="button" className="drms-sidebar-link">
              <img
                src="/Resource-Map-icon.png"
                alt="Resource Map"
                className="drms-sidebar-icon"
              />
              {!isSidebarCollapsed && <span>Resource Map</span>}
            </button>

            <button type="button" className="drms-sidebar-link">
              <img src="/Resources-icon.png" alt="Resources" className="drms-sidebar-icon" />
              {!isSidebarCollapsed && <span>Resources</span>}
            </button>
          </nav>
        </aside>

        <section
          className={`drms-main-area ${
            isSidebarCollapsed ? "drms-main-collapsed" : "drms-main-expanded"
          }`}
        >
          <header className="drms-topbar-exact">
            <div className="drms-topbar-left-exact">
              <img src="/Main-Logo.png" alt="DRMS Logo" className="drms-topbar-logo-exact" />
              <div className="drms-topbar-title-group">
                <span className="drms-topbar-drms">DRMS</span>
                <span className="drms-topbar-console">Dispatcher Console</span>
              </div>
            </div>

            <div className="drms-topbar-right-exact">
              <div className="drms-active-wrap">
                <span className={`drms-active-label ${isActive ? "active" : "inactive"}`}>
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </span>

                <button
                  type="button"
                  className={`drms-status-toggle ${
                    isActive ? "drms-status-toggle-on" : "drms-status-toggle-off"
                  }`}
                  onClick={() => setIsActive((prev) => !prev)}
                  aria-label="Toggle active state"
                >
                  <span className="drms-status-toggle-knob">
                    {isActive ? "✓" : "✕"}
                  </span>
                </button>
              </div>

              <div className="drms-notif-wrap">
                <img
                  src="/notifications-button.png"
                  alt="Notifications"
                  className="drms-notif-icon"
                />
                <span className="drms-notif-text">1 new alert</span>
              </div>

              <div className="drms-notif-wrap mr-4">
                <button
                  type="button"
                  onClick={() => window.location.href = '/admin'}
                  className="bg-[#292929]/20 hover:bg-[#292929]/30 text-white font-bold py-1.5 px-4 rounded-full text-xs tracking-wider transition uppercase"
                >
                  Admin Portal
                </button>
              </div>

              <div className="drms-user-wrap">
                <div className="drms-user-avatar">👤</div>
                <div className="drms-user-meta">
                  <p>System</p>
                  <span>Administrator</span>
                </div>
                <img
                  src="/Dropdown-button.png"
                  alt="Dropdown"
                  className="drms-user-dropdown"
                />
              </div>
            </div>
          </header>

          {currentView === "Dashboard" ? (
          <section className="drms-content-shell">
            {isActive && (
              <div className="drms-summary-pills">
                <div className="drms-summary-pill drms-summary-pill-red">
                  <strong>23</strong>
                  <span>New Incidents</span>
                </div>

                <div className="drms-summary-pill drms-summary-pill-yellow">
                  <strong>26</strong>
                  <span>Proceeding</span>
                </div>

                <div className="drms-summary-pill drms-summary-pill-green">
                  <strong>126</strong>
                  <span>Completed</span>
                </div>
              </div>
            )}

            <div className="drms-map-panel">
              <div className="drms-map-panel-header">
                <div className="drms-map-panel-title">
                  <h3>Live Resource Monitoring</h3>

                  <div className="drms-map-legend">
                    <span><i className="legend-green" /> Available</span>
                    <span><i className="legend-blue" /> On Route</span>
                    <span><i className="legend-red" /> On Scene</span>
                    <span><i className="legend-gray" /> Offline</span>
                  </div>

                  {searchStatus && (
                    <p className="drms-map-search-status">{searchStatus}</p>
                  )}
                </div>

                <div className="drms-map-actions">
                  <select
                    className="drms-filter-exact"
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as ResourceType)}
                  >
                    <option value="FIRE">FIRE</option>
                    <option value="AMB">AMB</option>
                    <option value="POL">POL</option>
                    <option value="ALL">ALL</option>
                  </select>

                  <div className="drms-search-box-exact">
                    <input
                      type="text"
                      placeholder="Search Maps"
                      value={mapSearch}
                      onChange={(e) => setMapSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submitMapSearch();
                        }
                      }}
                    />
                    <button type="button" aria-label="Search" onClick={submitMapSearch}>
                      <img src="/Search-button.png" alt="Search" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="drms-map-expand-btn"
                    aria-label="Reset map search"
                    onClick={resetMapSearch}
                  >
                    <img src="/Expand-button.png" alt="Expand" />
                  </button>
                </div>
              </div>

              <div className="drms-map-image-wrap drms-map-live-wrap">
                <MetroManilaLiveMap
                  searchTerm={mapSearch}
                  searchNonce={searchNonce}
                  selectedType={resourceType}
                  onSearchStatus={setSearchStatus}
                />
              </div>
            </div>

            <div className="drms-table-shell">
              <div className="drms-table-title-exact">Pending Incident Queue</div>

              <div className="drms-table-scroll-exact">
                <table className="drms-table-exact">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Time Reported</th>
                      <th>Priority</th>
                      <th>Ticket Status</th>
                      <th>Action</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {pendingIncidents.map((incident, index) => {
                      const actionActive = isActive; // Enable full interactivity when system is active
                      
                      const displayId = incident.ticket_id || incident.id || "INC-000";
                      const displayType = incident.incident_type || incident.type || "Unknown";
                      const locationStr = incident.location || incident.city || "Unknown";
                      const timeRaw = new Date(incident.created_at || new Date());
                      const displayTime = isNaN(timeRaw.getTime()) 
                        ? (incident.timeReported || '') 
                        : timeRaw.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const priority = (incident.priority || "High").toUpperCase();
                      const statusView = incident.id ? "View Ticket" : incident.ticketStatus;

                      return (
                        <tr key={incident.id}>
                          <td>{displayId}</td>
                          <td>{displayType}</td>
                          <td>{locationStr}</td>
                          <td>{displayTime}</td>
                          <td className={`priority-cell ${priority.toLowerCase()}`}>
                            {priority === "HIGH" ? "High" : priority === "MEDIUM" ? "Medium" : "Low"}
                          </td>
                          <td>
                            {statusView === "View Ticket" ? (
                              <button
                                type="button"
                                className="ticket-link-exact"
                                onClick={() => openTicket(incident)}
                              >
                                View Ticket
                              </button>
                            ) : (
                              <span className="waiting-text-exact">Waiting</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`dispatch-btn-exact ${
                                actionActive ? "dispatch-green" : "dispatch-gray"
                              }`}
                              onClick={() => actionActive && handleDispatch(incident)}
                            >
                              DISPATCH
                            </button>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`invalid-btn-exact ${
                                actionActive ? "invalid-red" : "invalid-gray"
                              }`}
                              onClick={() => actionActive && markInvalid(incident.id)}
                            >
                              INVALID
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          ) : currentView === "Incidents" ? (
            <IncidentsView />
          ) : null}
        </section>
      </div>

      {activeTicketInfo && (
        <div
          onClick={closeTicket}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 py-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[455px] rounded-[18px] bg-[#f3f3f3] px-8 pb-8 pt-7 text-[#3c3c3c] shadow-[0_20px_45px_rgba(0,0,0,0.28)]"
          >
            <button
              type="button"
              onClick={closeTicket}
              className="absolute right-4 top-3 text-[36px] font-light leading-none text-[#343434]"
              aria-label="Close ticket"
            >
              ×
            </button>

            <div className="pr-8 text-[17px] leading-[1.25]">
              <p><strong>Ticket ID:</strong> {activeTicketInfo.ticketId}</p>
              <p><strong>Incident Type:</strong> {activeTicketInfo.incidentType}</p>
              <p>
                <strong>Priority Level:</strong> {activeTicketInfo.priorityLevel}
                <PriorityDot />
              </p>
              <p><strong>Status:</strong> {activeTicketInfo.status}</p>
              <p><strong>Time Reported:</strong> {activeTicketInfo.timeReported}</p>
              <p><strong>Reported By:</strong> {activeTicketInfo.reportedBy}</p>
            </div>

            <div className="mt-4 text-[15px] leading-[1.25] text-[#404040]">
              <p className="mb-1 font-bold">Location:</p>
              <p className="whitespace-pre-line">{activeTicketInfo.location}</p>

              <p className="mb-1 mt-4 font-bold">Coordinates:</p>
              <p>{activeTicketInfo.coordinates}</p>

              <p className="mb-1 mt-4 font-bold">Nearest Landmark:</p>
              <p>{activeTicketInfo.nearestLandmark}</p>

              <p className="mb-1 mt-4 font-bold">Description:</p>
              <div>
                {activeTicketInfo.description.map((line: string) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              <p className="mb-1 mt-4 font-bold">Possible Casualties:</p>
              <p>{activeTicketInfo.possibleCasualties}</p>

              <p className="mb-1 mt-4 font-bold">Infrastructure Damage:</p>
              <p>{activeTicketInfo.infrastructureDamage}</p>

              <p className="mb-1 mt-4 font-bold">Attachments:</p>
              <button
                type="button"
                className="text-[15px] font-semibold text-[#1f63ff] underline"
                onClick={() => {
                   if (activeTicketInfo?.imageUrl) {
                       window.open(activeTicketInfo.imageUrl, '_blank');
                   } else {
                       alert('No image attached');
                   }
                }}
              >
                [view image]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY INCIDENT MODAL (Image Popup) */}
      {verifyingIncident && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-8 text-center shadow-2xl relative">
             <button onClick={() => setVerifyingIncident(null)} className="absolute right-4 top-2 text-gray-500 font-bold text-3xl">&times;</button>
             <h2 className="text-2xl font-black mb-1 text-gray-900 tracking-tight">VERIFY INCIDENT</h2>
             <p className="text-md text-gray-500 font-semibold mb-6 uppercase tracking-widest text-[11px]">
                 {verifyingIncident.image_url ? 'Attachment Found' : 'No Attachment Found'}
             </p>
             
             {verifyingIncident.image_url ? (
               <img src={verifyingIncident.image_url} alt="incident proof" className="max-h-80 w-auto object-contain rounded-lg bg-gray-50 mx-auto shadow-inner border border-gray-200" />
             ) : (
               <div className="h-56 w-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold rounded-xl border-2 border-dashed border-gray-300">No Image Attached</div>
             )}
             
             <button 
               onClick={() => confirmVerification(verifyingIncident)} 
               className="mt-8 bg-[#f2552c] text-white px-8 py-3.5 rounded-full font-bold w-full hover:bg-[#d94a24] active:scale-95 transition-all shadow-md text-lg"
             >
               Verify and Proceed to Dispatch
             </button>
          </div>
        </div>
      )}

      {/* DISPATCH MODAL (Figma Screen) */}
      {dispatchingIncident && (
        <DispatchModal 
           incident={dispatchingIncident} 
           onClose={() => setDispatchingIncident(null)} 
        />
      )}
    </main>
  );
}