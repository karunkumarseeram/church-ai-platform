import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Prayers() {
  const { userRole } = useContext(AuthContext);

  const [prayers, setPrayers] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = userRole === "ADMIN" || userRole === "PASTOR";

  const loadPrayers = async () => {
    const url = isAdmin ? "/prayers/admin" : "/prayers";
    const res = await API.get(url);
    setPrayers(res.data);
  };

  useEffect(() => {
    loadPrayers();
  }, []);

  const submitPrayer = async () => {
    if (!text) return alert("Write your prayer 🙏");

    setLoading(true);
    await API.post("/prayers", { name, request: text });
    setText("");
    setName("");
    setLoading(false);
    loadPrayers();
  };

  const approvePrayer = async (id) => {
    await API.put(`/prayers/${id}/approve`);
    loadPrayers();
  };

  const deletePrayer = async (id) => {
    if (!window.confirm("Delete this prayer?")) return;
    await API.delete(`/prayers/${id}`);
    loadPrayers();
  };

  const isNew = (date) => {
    const d = new Date(date);
    const now = new Date();
    return (now - d) / (1000 * 60 * 60) < 24; // within 24h
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🙏 Prayer Requests</h2>

      {/* 🔥 FORM */}
      <div style={styles.formCard}>
        <h3>Share Your Prayer</h3>

        <input
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Write your prayer..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={submitPrayer} style={styles.button}>
          {loading ? "Submitting..." : "Submit Prayer"}
        </button>
      </div>

      {/* 🔥 GRID */}
      <div style={styles.grid}>
        {prayers.map((p, idx) => {
          const newPrayer = isNew(p.created_at);

          return (
            <div
              key={p.id}
              className="prayer-card"
              style={{
                ...styles.card,
                background: gradients[idx % gradients.length],
                border: newPrayer ? "3px solid gold" : "none",
                animation: newPrayer ? "glow 2s infinite" : "none",
              }}
            >
              {/* BADGES */}
              {newPrayer && <span style={styles.newBadge}>NEW</span>}
              {isAdmin && !p.is_approved && (
                <span style={styles.pendingBadge}>Pending</span>
              )}

              {/* CONTENT */}
              <h4 style={styles.name}>{p.name || "Anonymous"}</h4>
              <p style={styles.text}>{p.request}</p>

              {/* FOOTER */}
              <div style={styles.footer}>
                <span style={styles.date}>
                  {new Date(p.created_at).toLocaleString()}
                </span>

                {isAdmin && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {!p.is_approved && (
                      <button
                        onClick={() => approvePrayer(p.id)}
                        style={styles.approveBtn}
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => deletePrayer(p.id)}
                      style={styles.deleteBtn}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 ANIMATIONS */}
      <style>{`
        .prayer-card:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          transition: 0.3s;
        }

        @keyframes glow {
          0% { box-shadow: 0 0 10px gold; }
          50% { box-shadow: 0 0 25px gold; }
          100% { box-shadow: 0 0 10px gold; }
        }
      `}</style>
    </div>
  );
}

const gradients = [
  "linear-gradient(135deg, #6A1B9A, #9C27B0)",
  "linear-gradient(135deg, #4D96FF, #6BCB77)",
  "linear-gradient(135deg, #FF6B6B, #FFD93D)",
  "linear-gradient(135deg, #FF9800, #FFC107)",
  "linear-gradient(135deg, #3F51B5, #5C6BC0)",
];

const styles = {
  container: {
    padding: 30,
    minHeight: "100vh",
    background: "linear-gradient(135deg, #E6E6FA, #ADD8E6)",
  },
  title: {
    color: "#6A1B9A",
    marginBottom: 20,
  },
  formCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    height: 90,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 10,
  },
  button: {
    background: "#6A1B9A",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 15,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    color: "#fff",
    position: "relative",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
  },
  name: {
    margin: 0,
    fontWeight: "bold",
  },
  text: {
    margin: "10px 0",
    fontStyle: "italic",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    opacity: 0.8,
  },
  approveBtn: {
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: 6,
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#f44336",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: 6,
    cursor: "pointer",
  },
  pendingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "orange",
    padding: "3px 8px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "gold",
    color: "#000",
    padding: "3px 8px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
};