import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import AdminDashboardHeader from "../components/AdminDashboardHeader";
import { useNavigate } from "react-router-dom";
import AddEventModal from "../components/AddEventModal";
import RaisePrayerModal from "../components/RaisePrayerModal";

export default function Dashboard() {
  const { userRole } = useContext(AuthContext);
  const [stats, setStats] = useState({ members: 0, events: 0, donations: 0, prayers: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  const navigate = useNavigate();
  const isAdmin = userRole === "ADMIN" || userRole === "PASTOR";

  const defaultEvents = [
    { id: "d1", title: "Sunday Worship 1", description: "Morning Worship at Pallamraju Nagar", event_date: "2026-04-05T08:00:00", location: "Pallamraju Nagar" },
    { id: "d2", title: "Sunday Worship 2", description: "Morning Worship at Indrapalem", event_date: "2026-04-05T11:00:00", location: "Indrapalem" },
    { id: "d3", title: "Sunday Worship 3", description: "Afternoon Worship at Lakshmi Narasarpuram", event_date: "2026-04-05T14:00:00", location: "Lakshmi Narasarpuram" },
    { id: "d4", title: "Youth Meet", description: "Every 2nd & 4th Sunday evening", event_date: "2026-04-12T17:00:00", location: "Community Hall" },
    { id: "d5", title: "Whole Night Prayer", description: "Every 2nd Friday night prayer", event_date: "2026-04-10T19:00:00", location: "Pallamraju Nagar" },
  ];

  const gradientColors = [
    "#6A1B9A, #9C27B0",
    "#8E24AA, #BA68C8",
    "#AB47BC, #CE93D8",
    "#BA68C8, #E1BEE7",
    "#D500F9, #E1BEE7"
  ];
  const getGradientColor = (idx) => gradientColors[idx % gradientColors.length].split(",").map(c => c.trim()).join(",");

  const loadDashboard = async () => {
  try {
    const [dashboardRes, eventsRes, prayersRes] = await Promise.all([
      API.get("/dashboard"),
      API.get("/events"),
      API.get("/prayers/count")
    ]);

    setStats({
      ...dashboardRes.data,
      prayers: prayersRes.data.count
    });

    setEvents(eventsRes.data);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { loadDashboard(); }, []);

  const getWeekEvents = () => {
    const now = new Date();
    const start = new Date(now); start.setDate(start.getDate() + weekOffset * 7);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    const allEvents = [...defaultEvents, ...events];
    return allEvents.filter(e => {
      const d = new Date(e.event_date);
      return d >= start && d <= end;
    }).sort((a,b)=> new Date(a.event_date) - new Date(b.event_date));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch(err){ console.log(err); }
  };

  if(loading) return <h2 style={{padding:30}}>Loading dashboard...</h2>;

  const now = new Date(); 
  const start = new Date(now); start.setDate(start.getDate() + weekOffset * 7);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const weekRange = `${start.toLocaleDateString("en-US",{month:"short",day:"numeric"})} - ${end.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`;

  const isToday = (date) => {
    const d = new Date(date);
    return d.toDateString() === new Date().toDateString();
  };

  return (
    <div style={styles.container}>
      <AdminDashboardHeader userRole={userRole} />

      {/* Stats */}
      <div style={styles.grid}>
        {isAdmin && <div style={{...styles.card, background:"linear-gradient(135deg, #6A1B9A, #9C27B0)"}} onClick={()=>navigate("/members")}>
          <h3>👥 Members</h3><p style={styles.statNumber}>{stats.members}</p>
        </div>}
        <div style={{...styles.card, background:"linear-gradient(135deg, #FF6B6B, #FFD93D)"}} onClick={()=>navigate("/events")}>
          <h3>📅 Events</h3><p style={styles.statNumber}>{stats.events + defaultEvents.length}</p>
        </div>
        <div style={{...styles.card, background:"linear-gradient(135deg, #4D96FF, #6BCB77)"}} onClick={()=>navigate("/donations")}>
          <h3>💳 Donations</h3><p style={styles.statNumber}>₹{stats.donations}</p>
        </div>
        <div style={{...styles.card, background:"linear-gradient(135deg, #FF9800, #FFC107)"}} onClick={()=>navigate("/prayers")}>
          <h3>🙏 Prayer Requests</h3><p style={styles.statNumber}>{stats.prayers || 0}</p>
        </div>
      </div>

      {/* Upcoming Events */}
      <div style={{...styles.section, background:"linear-gradient(135deg, #E3F2FD, #E1BEE7)"}}>
        <h3 style={styles.sectionTitle}>Upcoming Events ({weekRange})</h3>
        <div style={styles.nav}>
          <button style={styles.chevron} onClick={()=>setWeekOffset(weekOffset-1)}>&lt;</button>
          <span style={{fontWeight:"bold"}}>{weekRange}</span>
          <button style={styles.chevron} onClick={()=>setWeekOffset(weekOffset+1)}>&gt;</button>
        </div>
        <div style={styles.eventList}>
          {getWeekEvents().length === 0 ? <p>No events this week</p> : getWeekEvents().map((e,idx)=>{
            const today = isToday(e.event_date);
            return (
              <div key={e.id} style={{
                ...styles.eventCard,
                background:`linear-gradient(135deg, ${getGradientColor(idx)})`,
                border: today ? "4px solid gold" : "none",
                animation: today ? "pulseBorder 2s infinite" : "none"
              }}>
                {today && <span style={styles.todayBadge}>TODAY</span>}
                <h4 style={{margin:0,fontWeight:"bold", fontFamily: "'Roboto Slab', serif"}}>{e.title}</h4>
                <p style={{margin:"4px 0", fontStyle:"italic", fontFamily:"'Dancing Script', cursive"}}>{e.description || "No description"}</p>
                <p style={{margin:"2px 0", fontWeight:"bold"}}>{new Date(e.event_date).toLocaleString()}</p>
                <p style={{margin:0}}>{e.location}</p>

                {isAdmin && !defaultEvents.find(de => de.id === e.id) && (
                  <div style={{marginTop:10, display:"flex", gap:10}}>
                    <button style={styles.editBtn} onClick={()=>{setEditingEvent(e); setShowEventModal(true)}}>Edit</button>
                    <button style={styles.deleteBtn} onClick={()=>handleDelete(e.id)}>Delete</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={styles.actions}>
          {isAdmin ? <>
            <button style={styles.button} onClick={()=>setShowEventModal(true)}>Add Event</button>
            <button style={styles.button} onClick={()=>navigate("/members")}>View Members</button>
            <button style={styles.button} onClick={()=>navigate("/donations")}>View Donations</button>
            <button style={styles.button} onClick={()=>setShowPrayerModal(true)}>Raise Prayer Request</button>
            <button style={styles.button} onClick={()=>navigate("/prayers")}>Accept Prayer Requests</button>
          </> : <>
            <button style={styles.button} onClick={()=>setShowPrayerModal(true)}>Raise Prayer Request</button>
            <button style={styles.button} onClick={()=>navigate("/donations")}>Donate</button>
          </>}
        </div>
      </div>

      {showEventModal && <AddEventModal
        event={editingEvent}
        onClose={()=>{setShowEventModal(false); setEditingEvent(null);}}
        onSave={()=>{setShowEventModal(false); setEditingEvent(null); loadDashboard();}}
      />}

      {showPrayerModal && <RaisePrayerModal
        onClose={()=>setShowPrayerModal(false)}
        onSave={()=>{setShowPrayerModal(false); loadDashboard();}}
      />}

      <style>{`
        @keyframes pulseBorder {
          0% { box-shadow: 0 0 8px 0 gold; }
          50% { box-shadow: 0 0 20px 4px gold; }
          100% { box-shadow: 0 0 8px 0 gold; }
        }
        .card:hover, .eventCard:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          transition: 0.3s;
        }
        @keyframes pulseBadge {
          0% { box-shadow: 0 0 4px gold; }
          50% { box-shadow: 0 0 15px gold; }
          100% { box-shadow: 0 0 4px gold; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {padding:30, minHeight:"100vh", background:"linear-gradient(135deg, #E6E6FA, #ADD8E6)"},
  grid:{display:"flex", gap:20, marginBottom:30, flexWrap:"wrap"},
  card:{flex:"1 1 220px", padding:25, borderRadius:12, textAlign:"center", color:"#fff", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", cursor:"pointer"},
  statNumber:{fontSize:28,fontWeight:"bold"},
  section:{marginTop:20, padding:25, borderRadius:12},
  sectionTitle:{marginBottom:15, color:"#6A1B9A"},
  nav:{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10},
  chevron:{padding:"6px 12px", borderRadius:6, border:"none", color:"#fff", cursor:"pointer", fontWeight:"bold", fontSize:16, margin:"0 5px", background:"#6A1B9A"},
  eventList:{display:"flex", flexDirection:"column", gap:10},
  eventCard:{padding:20, borderRadius:12, color:"#fff", fontFamily:"Arial, sans-serif", minHeight:120, display:"flex", flexDirection:"column", justifyContent:"space-between", boxShadow:"0 4px 12px rgba(0,0,0,0.15)", position:"relative", cursor:"pointer"},
  todayBadge:{position:"absolute", top:10, right:10, background:"gold", color:"#000", fontWeight:"bold", padding:"4px 10px", borderRadius:10, animation:"pulseBadge 1.5s infinite"},
  editBtn:{padding:"6px 12px", borderRadius:6, border:"none", background:"#1976D2", color:"#fff", cursor:"pointer"},
  deleteBtn:{padding:"6px 12px", borderRadius:6, border:"none", background:"#D32F2F", color:"#fff", cursor:"pointer"},
  actions:{display:"flex", gap:10, flexWrap:"wrap"},
  button:{padding:"10px 18px", background:"#6A1B9A", color:"#fff", border:"none", borderRadius:8, cursor:"pointer"},
};