import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboardHeader({ userRole }) {
  const { token } = useContext(AuthContext);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]); // 🔔 Event notifications

  // 🔥 Dynamic title function
  const getTitle = () => {
    switch (userRole) {
      case "ADMIN":
        return "Admin Dashboard";
      case "PASTOR":
        return "Pastor Dashboard";
      default:
        return "Member Dashboard";
    }
  };

  // ============================
  // 🔔 WEBSOCKET FOR NEW EVENTS
  // ============================
  useEffect(() => {
    if (!token) return;

    // Pass token as query param for authentication
    const ws = new WebSocket(`ws://localhost:8000/ws/events?token=${token}`);

    ws.onopen = () => console.log("WebSocket connected ✅");
    ws.onclose = () => console.log("WebSocket closed ❌");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_EVENT") {
        setNotifications((prev) => [data.event, ...prev]);
      }
    };

    return () => ws.close();
  }, [token]);

  // ============================
  // 🔔 PENDING USERS (ADMIN)
  // ============================
  const loadPending = async () => {
    if (!token || userRole !== "ADMIN") return;
    try {
      const res = await API.get("/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load pending users:", err);
    }
  };

  useEffect(() => {
    if (!token || userRole !== "ADMIN") return;

    loadPending();
    const interval = setInterval(loadPending, 900000); // refresh every 15 min
    return () => clearInterval(interval);
  }, [token, userRole]);

  // Approve / Revoke user
  const handleAction = async (userId, action) => {
    try {
      await API.put(`/admin/members/${userId}/${action}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPending();
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={styles.header}>
      <h2>{getTitle()}</h2>

      {userRole === "ADMIN" && (
        <div ref={dropdownRef} style={styles.bellWrapper}>
          <div
            onClick={() => setShowDropdown((prev) => !prev)}
            style={styles.bellIcon}
          >
            🔔
            {/* Badge showing total notifications */}
            {(pendingUsers.length + notifications.length) > 0 && (
              <span style={styles.badge}>
                {pendingUsers.length + notifications.length}
              </span>
            )}
          </div>

          {showDropdown && (
            <div style={styles.dropdown}>
              {/* ===================== */}
              {/* 📢 EVENT NOTIFICATIONS */}
              {/* ===================== */}
              {notifications.length > 0 && (
                <>
                  <div style={styles.sectionTitle}>📢 New Events</div>
                  {notifications.map((event, index) => (
                    <div key={index} style={styles.notificationItem}>
                      📅 {event.title} - {new Date(event.event_date).toLocaleString()}
                    </div>
                  ))}
                  <hr />
                </>
              )}

              {/* ===================== */}
              {/* 👤 PENDING USERS */}
              {/* ===================== */}
              {pendingUsers.slice(0, 5).map((user) => {
                const isRecent =
                  new Date() - new Date(user.created_at) < 1000 * 60 * 60; // 1 hour

                return (
                  <div
                    key={user.id}
                    style={{
                      ...styles.userRow,
                      ...(isRecent ? styles.recent : {}),
                    }}
                    title={user.email}
                  >
                    <span>{user.name}</span>
                    <div>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleAction(user.id, "approve")}
                      >
                        ✅
                      </button>
                      <button
                        style={styles.revokeBtn}
                        onClick={() => handleAction(user.id, "revoke")}
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                );
              })}

              {pendingUsers.length > 5 && (
                <div
                  style={styles.viewMore}
                  onClick={() => navigate("/members")}
                >
                  View More...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#6A1B9A",
    color: "#fff",
    position: "relative",
  },
  bellWrapper: {
    position: "relative",
  },
  bellIcon: {
    cursor: "pointer",
    fontSize: 24,
    position: "relative",
    userSelect: "none",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -10,
    background: "red",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  dropdown: {
    position: "absolute",
    top: 35,
    right: 0,
    width: 300,
    maxHeight: 300,
    overflowY: "auto",
    background: "#fff",
    color: "#000",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1000,
    padding: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#6A1B9A",
  },
  notificationItem: {
    padding: "5px 0",
    fontSize: 14,
    color: "#333",
  },
  userRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 5px",
    borderBottom: "1px solid #eee",
  },
  recent: {
    background: "#F0E6FF",
  },
  approveBtn: {
    marginRight: 5,
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "2px 6px",
  },
  revokeBtn: {
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "2px 6px",
  },
  viewMore: {
    textAlign: "center",
    marginTop: 5,
    color: "#6A1B9A",
    fontWeight: "bold",
    cursor: "pointer",
  },
};