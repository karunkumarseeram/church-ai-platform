import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div style={mainContainer}>

        {/* TOP RIGHT BUTTON */}
        <div style={topRight}>
          {isAuthenticated ? (
            <button style={btnPurple} onClick={() => { logout(); navigate("/login"); }}>
              Logout
            </button>
          ) : (
            <button style={btnBlue} onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>

        {/* HERO SECTION */}
        <div style={heroWrapper}>

          <div style={heroCard}>
            <h1 style={title}>
              Welcome to <br /> Faith Fellowship Temple
            </h1>

            <p style={subtitle}>HIM We Proclaim 🙏</p>

            <div style={divider} />

            <p style={verse}>
              "The Lord is my shepherd; I shall not want." — Psalm 23:1
            </p>

            {!isAuthenticated && (
              <div style={loginNote}>
                Please login to access all features
              </div>
            )}
          </div>

          {/* EVENTS TITLE */}
          <div style={eventBadge}>
            <h2 style={eventTitle}>Upcoming Events</h2>
          </div>

        </div>

        {/* EVENTS SECTION PLACEHOLDER */}
        <div style={{ marginTop: 30 }}>
          <div style={!isAuthenticated ? blurStyle : {}}>
            <h3 style={{ textAlign: "center" }}>Events will load here...</h3>
          </div>
        </div>

        {/* BIBLE POPUP */}
        {showPopup && !isAuthenticated && (
          <div style={overlay}>
            <div style={modal}>

              <button onClick={() => setShowPopup(false)} style={closeBtn}>
                ✖
              </button>

              <h2 style={{ color: "#6A1B9A" }}>📖 Word of God</h2>

              <p style={versePopup}>
                “For I know the plans I have for you,” declares the Lord,
                “plans to prosper you and not to harm you, plans to give you hope and a future.”
              </p>

              <p style={{ fontWeight: "bold" }}>— Jeremiah 29:11</p>

              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate("/login");
                }}
                style={ctaBtn}
              >
                ✨ Login to Continue
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const mainContainer = {
  flex: 1,
  position: "relative",
  padding: 20,
  background: "linear-gradient(135deg,#f3f0ff,#e6f0ff)",
};

const topRight = {
  position: "absolute",
  top: 20,
  right: 20,
  zIndex: 10,
};

const btnPurple = {
  padding: "10px 20px",
  background: "#6A1B9A",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const btnBlue = {
  padding: "10px 20px",
  background: "#6A5ACD",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const heroWrapper = {
  marginTop: 100,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 25,
};

const heroCard = {
  width: "80%",
  maxWidth: 750,
  padding: "40px 30px",
  borderRadius: 20,
  background: "linear-gradient(135deg,#6A1B9A,#3F51B5)",
  boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
  color: "#fff",
};

const title = {
  fontSize: "2.3rem",
  fontFamily: "'Cinzel', serif",
  margin: 0,
};

const subtitle = {
  marginTop: 10,
  fontStyle: "italic",
  opacity: 0.9,
};

const divider = {
  width: 60,
  height: 3,
  background: "#FFD700",
  margin: "15px auto",
  borderRadius: 5,
};

const verse = {
  fontStyle: "italic",
  marginTop: 15,
  lineHeight: 1.6,
  opacity: 0.9,
};

const loginNote = {
  marginTop: 20,
  padding: 10,
  background: "rgba(255,255,255,0.15)",
  borderRadius: 10,
};

const eventBadge = {
  padding: "10px 25px",
  borderRadius: 12,
  background: "linear-gradient(90deg,#FFD700,#FFB300)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
};

const eventTitle = {
  margin: 0,
  color: "#222",
};

const blurStyle = {
  filter: "blur(3px)",
  pointerEvents: "none",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  width: 420,
  background: "linear-gradient(135deg,#E6E6FA,#B3C6FF)",
  padding: 25,
  borderRadius: 16,
  textAlign: "center",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
};

const versePopup = {
  fontStyle: "italic",
  lineHeight: 1.6,
};

const ctaBtn = {
  marginTop: 15,
  padding: "10px 18px",
  background: "#6A1B9A",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};