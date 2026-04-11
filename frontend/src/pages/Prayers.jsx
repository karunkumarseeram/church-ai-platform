import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Prayers() {
  const { userRole } = useContext(AuthContext);

  const [prayers, setPrayers] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const isAdmin = userRole === "ADMIN" || userRole === "PASTOR";

  // ✅ DEFAULT COUNTRY PRAYERS
  const defaultPrayers = [
    { id: "d1", name: "Common Prayer", request: "Pray for peace and unity in our nation 🇮🇳" },
    { id: "d2", name: "Common Prayer", request: "Pray for our leaders to have wisdom and integrity" },
    { id: "d3", name: "Common Prayer", request: "Pray for jobs and financial stability for families" },
    { id: "d4", name: "Common Prayer", request: "Pray for protection from disasters and crises" },
    { id: "d5", name: "Scripture Prayer", request: "Heal our land and forgive our sins (2 Chronicles 7:14)" },
    { id: "d6", name: "Scripture Prayer", request: "Let justice flow like a river (Amos 5:24)" },
  ];

  const loadPrayers = async () => {
    try {
      setLoadingPage(true);
      const url = isAdmin ? "/prayers/admin" : "/prayers";
      const res = await API.get(url);
      setPrayers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load prayers");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadPrayers();
  }, [isAdmin]);

  const submitPrayer = async () => {
    if (!text.trim()) return alert("Write your prayer 🙏");

    try {
      setLoading(true);
      await API.post("/prayers", { name, request: text });
      setText("");
      setName("");
      loadPrayers();
    } catch (err) {
      console.error(err);
      alert("Failed to submit prayer");
    } finally {
      setLoading(false);
    }
  };

  const approvePrayer = async (id) => {
    try {
      await API.put(`/prayers/${id}/approve`);
      loadPrayers();
    } catch {
      alert("Failed to approve");
    }
  };

  const deletePrayer = async (id) => {
    if (!window.confirm("Delete this prayer?")) return;
    try {
      await API.delete(`/prayers/${id}`);
      loadPrayers();
    } catch {
      alert("Failed to delete");
    }
  };

  const isNew = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const now = new Date();
    return (now - d) / (1000 * 60 * 60) < 24;
  };

  if (loadingPage) return <h2 style={{ padding: 30 }}>Loading prayers...</h2>;

  // ✅ MERGE DEFAULT + API PRAYERS
  const allPrayers = [...defaultPrayers, ...prayers];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🙏 Prayer Requests</h2>

      {/* 🔥 FORM */}
      <div style={styles.formWrapper}>
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

          <button onClick={submitPrayer} style={styles.button} disabled={loading}>
            {loading ? "Submitting..." : "Submit Prayer"}
          </button>
        </div>
      </div>

      {/* 🔥 PRAYER GRID */}
      <div style={styles.grid}>
        {allPrayers.map((p, idx) => {
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
              {newPrayer && <span style={styles.newBadge}>NEW</span>}
              {isAdmin && p.id && !p.id.startsWith("d") && !p.is_approved && (
                <span style={styles.pendingBadge}>Pending</span>
              )}

              <h4 style={styles.name}>{p.name || "Anonymous"}</h4>
              <p style={styles.text}>{p.request}</p>

              <div style={styles.footer}>
                {p.created_at && (
                  <span style={styles.date}>
                    {new Date(p.created_at).toLocaleString()}
                  </span>
                )}

                {isAdmin && p.id && !p.id.startsWith("d") && (
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

      {/* 🔥 GLOBAL STYLES */}
      <style>{`
        input, textarea {
          display: block;
          font-family: inherit;
          box-sizing: border-box;
        }

        .prayer-card:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          transition: 0.3s;
        }

        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
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
    textAlign: "center",
  },

  formWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 40,
  },

  formCard: {
    width: "100%",
    maxWidth: 500,
    padding: 25,
    borderRadius: 16,
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: 14,
  },

  textarea: {
    width: "100%",
    height: 100,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
    resize: "none",
    fontSize: 14,
    lineHeight: "1.5",
  },

  button: {
    background: "linear-gradient(135deg, #6A1B9A, #9C27B0)",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
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