import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import AdminDashboardHeader from "../components/AdminDashboardHeader";
import { useNavigate } from "react-router-dom";
import AddEventModal from "../components/AddEventModal";
import RaisePrayerModal from "../components/RaisePrayerModal";

export default function Dashboard() {
  const { userRole } = useContext(AuthContext);

  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    donations: 0,
    prayers: 0,
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  const [monthOffset, setMonthOffset] = useState(0);

  const [toast, setToast] = useState({ show: false, message: "" });

  const navigate = useNavigate();
  const isAdmin = userRole === "ADMIN" || userRole === "PASTOR";

  // ⭐ TOAST FIXED
  const showToast = (msg) => {
    setToast({ show: true, message: msg });

    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2500);
  };

  const openMap = (location) => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(location),
      "_blank"
    );
  };

  // 🎨 GRADIENTS (LAVENDER BLUE)
  const gradientColors = [
    "#7F7FD5, #86A8E7",
    "#6A11CB, #2575FC",
    "#8E2DE2, #4A00E0",
    "#5B86E5, #36D1DC",
    "#667EEA, #764BA2",
  ];

  const getGradientColor = (idx) =>
    gradientColors[idx % gradientColors.length];

  // 📅 DEFAULT EVENTS
  const getDynamicDefaultEvents = () => {
    const now = new Date();

    const baseMonth = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset,
      1
    );

    const sunday = new Date(baseMonth);
    sunday.setDate(baseMonth.getDate() + ((7 - baseMonth.getDay()) % 7));

    const friday = new Date(baseMonth);
    friday.setDate(baseMonth.getDate() + ((5 - baseMonth.getDay() + 7) % 7));

    return [
      {
        id: "d1",
        title: "Sunday Worship 1",
        description: "Morning Worship at Pallamraju Nagar",
        event_date: new Date(sunday.setHours(8, 0, 0, 0)),
        location: "Pallamraju Nagar",
      },
      {
        id: "d2",
        title: "Sunday Worship 2",
        description: "Morning Worship at Indrapalem",
        event_date: new Date(sunday.setHours(11, 0, 0, 0)),
        location: "Indrapalem",
      },
      {
        id: "d3",
        title: "Sunday Worship 3",
        description: "Afternoon Worship at Lakshmi Narasarpuram",
        event_date: new Date(sunday.setHours(14, 0, 0, 0)),
        location: "Lakshmi Narasarpuram",
      },
      {
        id: "d4",
        title: "Whole Night Prayer",
        description: "Friday Prayer Night",
        event_date: new Date(friday.setHours(19, 0, 0, 0)),
        location: "Pallamraju Nagar",
      },
      {
        id: "d5",
        title: "Youth Meet",
        description: "Every 2nd & 4th Sunday evening",
        event_date: new Date(
          new Date(baseMonth).setDate(baseMonth.getDate() + 14)
        ),
        location: "Community Hall",
      },
    ];
  };

  // 📡 LOAD DASHBOARD
  const loadDashboard = async () => {
    try {
      const [dashboardRes, eventsRes, prayersRes] = await Promise.all([
        API.get("/dashboard"),
        API.get("/events"),
        API.get("/prayers/count"),
      ]);

      setStats({
        ...dashboardRes.data,
        prayers: prayersRes.data.count,
      });

      setEvents(eventsRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // 📅 FILTER MONTHLY EVENTS
  const getMonthlyEvents = () => {
    const all = [...getDynamicDefaultEvents(), ...events];

    const now = new Date();

    const target = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset,
      1
    );

    const start = new Date(target.getFullYear(), target.getMonth(), 1);
    const end = new Date(target.getFullYear(), target.getMonth() + 1, 0);

    return all
      .filter((e) => {
        const d = new Date(e.event_date);
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  };

  // 🗑 DELETE EVENT FIXED
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await API.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast("🗑 Event deleted successfully");
    } catch (err) {
      showToast("❌ Delete failed");
    }
  };

  if (loading) return <h2 style={{ padding: 30 }}>Loading...</h2>;

  return (
    <div style={styles.container}>
      <AdminDashboardHeader userRole={userRole} />

      {/* ⭐ TOAST */}
      {toast.show && <div style={styles.toast}>{toast.message}</div>}

      {/* STATS */}
      <div style={styles.grid}>
        <div
          style={{ ...styles.card, background: "linear-gradient(135deg,#7F7FD5,#86A8E7)" }}
          onClick={() => navigate("/members")}
        >
          <h3>👥 Members</h3>
          <p>{stats.members}</p>
        </div>

        <div
          style={{ ...styles.card, background: "linear-gradient(135deg,#6A11CB,#2575FC)" }}
          onClick={() => navigate("/events")}
        >
          <h3>📅 Events</h3>
          <p>{stats.events}</p>
        </div>

        <div
          style={{ ...styles.card, background: "linear-gradient(135deg,#8E2DE2,#4A00E0)" }}
          onClick={() => navigate("/donations")}
        >
          <h3>💳 Donations</h3>
          <p>₹{stats.donations}</p>
        </div>

        <div
          style={{ ...styles.card, background: "linear-gradient(135deg,#5B86E5,#36D1DC)" }}
          onClick={() => navigate("/prayers")}
        >
          <h3>🙏 Prayers</h3>
          <p>{stats.prayers}</p>
        </div>
      </div>

      {/* MONTH NAV */}
      <div style={styles.monthNav}>
        <button onClick={() => setMonthOffset(monthOffset - 1)}>◀</button>
        <h3>
          {new Date(
            new Date().getFullYear(),
            new Date().getMonth() + monthOffset
          ).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button onClick={() => setMonthOffset(monthOffset + 1)}>▶</button>
      </div>

      {/* EVENTS */}
      <h2>📅 Upcoming Events</h2>

      <div style={styles.eventSection}>
        {getMonthlyEvents().map((e, idx) => (
          <div
            key={e.id}
            style={{
              ...styles.eventCard,
              background: `linear-gradient(135deg, ${getGradientColor(idx)})`,
            }}
          >
            <h4>{e.title}</h4>
            <p>{e.description}</p>
            <p>{new Date(e.event_date).toLocaleString()}</p>

            <p
              style={styles.location}
              onClick={() => openMap(e.location)}
            >
              📍 {e.location}
            </p>

            {isAdmin && (
              <div style={styles.adminRow}>
                <button onClick={() => {
                  setEditingEvent(e);
                  setShowEventModal(true);
                }}>
                  ✏️ Edit
                </button>

                <button onClick={() => handleDelete(e.id)}>
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS (NOT REMOVED) */}
      <div style={styles.section}>
        <h3>Quick Actions</h3>

        <div style={styles.actions}>
          {isAdmin ? (
            <>
              <button style={styles.button} onClick={() => setShowEventModal(true)}>Add Event</button>
              <button style={styles.button} onClick={() => navigate("/members")}>View Members</button>
              <button style={styles.button} onClick={() => navigate("/donations")}>View Donations</button>
              <button style={styles.button} onClick={() => setShowPrayerModal(true)}>Raise Prayer Request</button>
              <button style={styles.button} onClick={() => navigate("/prayers")}>Accept Prayer Requests</button>
            </>
          ) : (
            <>
              <button style={styles.button} onClick={() => setShowPrayerModal(true)}>Raise Prayer Request</button>
              <button style={styles.button} onClick={() => navigate("/donations")}>Donate</button>
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showEventModal && (
        <AddEventModal
          event={editingEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSave={() => {
            loadDashboard();
            setShowEventModal(false);
            setEditingEvent(null);
            showToast("🎉 Event saved successfully");
          }}
        />
      )}

      {showPrayerModal && (
        <RaisePrayerModal
          onClose={() => setShowPrayerModal(false)}
          onSave={() => {
            loadDashboard();
            showToast("🙏 Prayer submitted successfully");
          }}
        />
      )}
    </div>
  );
}

/* STYLES */
const styles = {
  container: { padding: 30, minHeight: "100vh", background: "#E6E6FA" },

  grid: { display: "flex", gap: 20, flexWrap: "wrap" },

  card: {
    flex: 1,
    padding: 20,
    color: "#fff",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },

  monthNav: {
    display: "flex",
    justifyContent: "space-between",
    margin: "15px 0",
  },

  eventSection: {
    background: "linear-gradient(135deg,#F3E5F5,#E1BEE7)",
    padding: 15,
    borderRadius: 12,
  },

  eventCard: {
    padding: 18,
    marginBottom: 10,
    borderRadius: 14,
    color: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },

  location: {
    cursor: "pointer",
    textDecoration: "underline",
  },

  adminRow: {
    marginTop: 10,
    display: "flex",
    gap: 10,
  },

  button: {
    padding: "10px 18px",
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
  },

  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    background: "#000",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 10,
    zIndex: 9999,
  },
};