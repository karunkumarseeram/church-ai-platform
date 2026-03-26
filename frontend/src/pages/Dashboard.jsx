import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { token } = useContext(AuthContext);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🙏 Welcome to FFT Dashboard</h2>
      <p style={styles.subtitle}>HIM We Proclaim</p>

      {/* 📊 Stats */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>👥 Members</h3>
          <p>120</p>
        </div>

        <div style={styles.card}>
          <h3>📅 Events</h3>
          <p>8 Upcoming</p>
        </div>

        <div style={styles.card}>
          <h3>💳 Donations</h3>
          <p>₹25,000</p>
        </div>
      </div>

      {/* ⛪ Upcoming Services */}
      <div style={styles.section}>
        <h3>Upcoming Services</h3>
        <ul>
          <li>Sunday Worship - 9:00 AM</li>
          <li>Prayer Meeting - Wednesday 7:00 PM</li>
          <li>Youth Fellowship - Friday 6:00 PM</li>
        </ul>
      </div>

      {/* ⚡ Quick Actions */}
      <div style={styles.section}>
        <h3>Quick Actions</h3>
        <div style={styles.actions}>
          <button style={styles.button}>Add Event</button>
          <button style={styles.button}>View Members</button>
          <button style={styles.button}>View Donations</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 30,
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  title: {
    color: "#6A1B9A",
  },
  subtitle: {
    marginBottom: 20,
    color: "#555",
  },
  grid: {
    display: "flex",
    gap: 20,
    marginBottom: 30,
  },
  card: {
    flex: 1,
    padding: 20,
    background: "#fff",
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  section: {
    marginTop: 20,
    padding: 20,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  button: {
    padding: 10,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};