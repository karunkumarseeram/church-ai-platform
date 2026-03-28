import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import AdminDashboardHeader from "../components/AdminDashboardHeader";

export default function Dashboard() {
  const { token, userRole } = useContext(AuthContext);

  const [stats, setStats] = useState({ members: 0, events: 0, donations: 0 });
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      setStats(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <h2 style={{ padding: 30 }}>Loading dashboard...</h2>;

  const isAdmin = userRole === "ADMIN";

  return (
    <div style={styles.container}>
      {/* 🔔 Header */}
      <AdminDashboardHeader userRole={userRole} />

      {/* 📊 Stats */}
      <div style={styles.grid}>
        {isAdmin && (
          <div style={styles.card}>
            <h3>👥 Members</h3>
            <p style={styles.statNumber}>{stats.members}</p>
          </div>
        )}
        <div style={styles.card}>
          <h3>📅 Events</h3>
          <p style={styles.statNumber}>{stats.events}</p>
        </div>
        <div style={styles.card}>
          <h3>💳 Donations</h3>
          <p style={styles.statNumber}>₹{stats.donations}</p>
        </div>
      </div>

      {/* ⛪ Services */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Upcoming Services</h3>
        <ul style={styles.list}>
          <li>Sunday Worship - 9:00 AM</li>
          <li>Prayer Meeting - Wednesday 7:00 PM</li>
          <li>Youth Fellowship - Friday 6:00 PM</li>
        </ul>
      </div>

      {/* ⚡ Quick Actions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Quick Actions</h3>
        <div style={styles.actions}>
          {isAdmin ? (
            <>
              <button style={styles.button}>Add Event</button>
              <button style={styles.button}>View Members</button>
              <button style={styles.button}>View Donations</button>
              <button style={styles.button}>Raise Prayer Request</button>
              <button style={styles.button}>Accept Prayer Requests</button>
            </>
          ) : (
            <>
              <button style={styles.button}>Raise Prayer Request</button>
              <button style={styles.button}>View Upcoming Events</button>
              <button style={styles.button}>Donate</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 30, minHeight: "100vh", background: "linear-gradient(135deg, #E6E6FA, #ADD8E6)" },
  grid: { display: "flex", gap: 20, marginBottom: 30, flexWrap: "wrap" },
  card: {
    flex: "1 1 250px",
    padding: 25,
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  statNumber: { fontSize: 28, fontWeight: "bold", color: "#6A1B9A" },
  section: { marginTop: 20, padding: 25, background: "rgba(255, 255, 255, 0.9)", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" },
  sectionTitle: { marginBottom: 15, color: "#6A1B9A" },
  list: { lineHeight: 1.8, color: "#444" },
  actions: { display: "flex", gap: 15, marginTop: 15, flexWrap: "wrap" },
  button: { padding: "10px 18px", background: "linear-gradient(135deg, #6A1B9A, #4B0082)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" },
};