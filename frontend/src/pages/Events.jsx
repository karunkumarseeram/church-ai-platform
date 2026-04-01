import { useEffect, useState } from "react";
import API from "../services/api";

// Helper: get next weekday date
const getNextWeekdayDate = (weekday, hour = 9, minute = 0, weekOffset = 0) => {
  const now = new Date();
  const day = now.getDay();
  let diff = (weekday + 7 - day) % 7;
  diff += weekOffset * 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(hour, minute, 0, 0);
  return next.toISOString();
};

// Repeat events for next n weeks
const generateRepeatingEvents = (eventTemplate, weeks = 4) => {
  const events = [];
  for (let w = 0; w < weeks; w++) {
    events.push({
      ...eventTemplate,
      id: `${eventTemplate.id}-w${w}`,
      event_date: getNextWeekdayDate(eventTemplate.weekday, eventTemplate.hour, eventTemplate.minute, w),
    });
  }
  return events;
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const defaultEventTemplates = [
    { id: "d1", title: "Sunday Worship 1", description: "Morning Worship at Pallamraju Nagar", weekday: 0, hour: 8, minute: 0, location: "Pallamraju Nagar" },
    { id: "d2", title: "Sunday Worship 2", description: "Morning Worship at Indrapalem", weekday: 0, hour: 11, minute: 0, location: "Indrapalem" },
    { id: "d3", title: "Sunday Worship 3", description: "Afternoon Worship at Lakshmi Narasarpuram", weekday: 0, hour: 14, minute: 0, location: "Lakshmi Narasarpuram" },
    { id: "d4", title: "Youth Meet", description: "Every 2nd & 4th Sunday evening", weekday: 0, hour: 17, minute: 0, location: "Community Hall" },
    { id: "d5", title: "Whole Night Prayer", description: "Every 2nd Friday night prayer", weekday: 5, hour: 19, minute: 0, location: "Pallamraju Nagar" },
  ];

  const loadEvents = async () => {
    try {
      const res = await API.get("/events?skip=0&limit=50");
      let dynamicDefaultEvents = [];
      defaultEventTemplates.forEach(template => {
        dynamicDefaultEvents.push(...generateRepeatingEvents(template, 4));
      });
      setEvents([...dynamicDefaultEvents, ...res.data]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + weekOffset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const weekRange = `${start.toLocaleDateString("en-US",{month:"short",day:"numeric"})} - ${end.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`;

  const getWeekEvents = () => {
    return events
      .filter(e => {
        const d = new Date(e.event_date);
        return d >= start && d <= end;
      })
      .sort((a,b)=> new Date(a.event_date) - new Date(b.event_date));
  };

  const gradientColors = [
    "#FF6B6B, #FFD93D",
    "#6BCB77, #4D96FF",
    "#FF6B6B, #FF8787",
    "#FFD93D, #FF6B6B",
    "#4D96FF, #6BCB77"
  ];

  const getGradientColor = (idx) =>
    gradientColors[idx % gradientColors.length].split(",").map(c => c.trim()).join(",");

  const openMap = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, "_blank");
  };

  const isToday = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Church Events</h2>
        <div style={styles.weekNav}>
          <button style={styles.chevron} onClick={()=>setWeekOffset(weekOffset-1)}>&lt;</button>
          <span style={styles.weekRange}>{weekRange}</span>
          <button style={styles.chevron} onClick={()=>setWeekOffset(weekOffset+1)}>&gt;</button>
        </div>
      </div>

      {getWeekEvents().length === 0 && <p style={{ color:"#fff" }}>No events this week</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {getWeekEvents().map((e, idx) => {
          const today = isToday(e.event_date);
          return (
            <div
              key={e.id}
              style={{
                position: "relative",
                padding: 20,
                borderRadius: 12,
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
                background: today
                  ? "linear-gradient(270deg, #FFD700, #FF69B4, #1E90FF, #32CD32, #FF8C00, #FFD700)"
                  : `linear-gradient(135deg, ${getGradientColor(idx)})`,
                border: today ? "2px solid #FFD700" : "none",
                backgroundSize: today ? "1200% 1200%" : "auto",
                animation: today ? "rainbowGradient 6s ease infinite, pulseGradient 3s infinite alternate" : "none",
                transition: "0.3s",
              }}
              className="eventCard"
            >
              {/* TODAY badge */}
              {today && (
                <div style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  background: "#FFD700",
                  color: "#6A1B9A",
                  padding: "4px 10px",
                  borderRadius: 12,
                  fontWeight: "bold",
                  fontSize: 12,
                  boxShadow: "0 0 10px #FFD700",
                  animation: "sparkle 1.5s infinite alternate"
                }}>
                  TODAY 🔥
                </div>
              )}

              <h3 style={{ margin: 0, fontWeight: "bold", fontFamily: "'Roboto Slab', serif" }}>{e.title}</h3>
              <p style={{ margin: "5px 0", fontStyle: "italic", fontFamily: "'Dancing Script', cursive" }}>{e.description}</p>
              <p style={{ margin: "5px 0", fontWeight: "500" }}>
                🕒 {new Date(e.event_date).toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p
                style={{ margin: "5px 0", textDecoration: "underline", cursor: "pointer", fontWeight: "bold" }}
                onClick={() => openMap(e.location)}
              >
                📍 {e.location}
              </p>
            </div>
          )
        })}
      </div>

      {/* Global styles for animations */}
      <style>
      {`
        @keyframes sparkle {
          0% { transform: rotate(-3deg) scale(1); box-shadow: 0 0 5px #FFD700; }
          50% { transform: rotate(3deg) scale(1.1); box-shadow: 0 0 20px #FFD700; }
          100% { transform: rotate(-3deg) scale(1); box-shadow: 0 0 5px #FFD700; }
        }

        @keyframes pulseGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes rainbowGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .eventCard {
          background-size: 200% 200%;
          transition: transform 0.3s;
        }

        .eventCard:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 12px 25px rgba(0,0,0,0.35);
        }
      `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: 30,
    background: "linear-gradient(135deg, #6A1B9A, #ADD8E6)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    background: "rgba(0,0,0,0.35)",
    padding: "8px 15px",
    borderRadius: 8,
    display: "inline-block",
    marginBottom: 10,
  },
  weekNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: 280,
    background: "rgba(255,255,255,0.2)",
    padding: "5px 10px",
    borderRadius: 8,
  },
  weekRange: {
    color: "#fff",
    fontWeight: "bold",
  },
  chevron: {
    padding:"6px 12px",
    borderRadius:6,
    border:"none",
    background:"#6A1B9A",
    color:"#fff",
    cursor:"pointer",
    fontWeight:"bold",
    fontSize:16,
    transition:"0.3s"
  }
};