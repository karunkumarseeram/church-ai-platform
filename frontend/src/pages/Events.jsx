import { useEffect, useState } from "react";
import API from "../services/api";

/* ================================
   REPEAT EVENT GENERATOR
================================ */
const getNextWeekdayDate = (weekday, hour = 9, minute = 0, monthOffset = 0) => {
  const now = new Date();

  const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

  const firstDayOfMonth = new Date(base);
  const day = firstDayOfMonth.getDay();

  let diff = (weekday + 7 - day) % 7;
  firstDayOfMonth.setDate(firstDayOfMonth.getDate() + diff);

  firstDayOfMonth.setHours(hour, minute, 0, 0);

  return firstDayOfMonth.toISOString();
};

const generateRepeatingEvents = (template, months = 3) => {
  const events = [];

  for (let m = 0; m < months; m++) {
    events.push({
      ...template,
      id: `${template.id}-m${m}`,
      event_date: getNextWeekdayDate(
        template.weekday,
        template.hour,
        template.minute,
        m
      ),
    });
  }

  return events;
};

/* ================================
   MAIN COMPONENT
================================ */
export default function Events() {
  const [events, setEvents] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);

  const defaultEventTemplates = [
    { id: "d1", title: "Sunday Worship 1", description: "Morning Worship at Pallamraju Nagar", weekday: 0, hour: 8, minute: 0, location: "Pallamraju Nagar" },
    { id: "d2", title: "Sunday Worship 2", description: "Morning Worship at Indrapalem", weekday: 0, hour: 11, minute: 0, location: "Indrapalem" },
    { id: "d3", title: "Sunday Worship 3", description: "Afternoon Worship at Lakshmi Narasarpuram", weekday: 0, hour: 14, minute: 0, location: "Lakshmi Narasarpuram" },
    { id: "d4", title: "Youth Meet", description: "Every 2nd & 4th Sunday evening", weekday: 0, hour: 17, minute: 0, location: "Community Hall" },
    { id: "d5", title: "Whole Night Prayer", description: "Every 2nd Friday night prayer", weekday: 5, hour: 19, minute: 0, location: "Pallamraju Nagar" },
  ];

  /* ================================
     LOAD EVENTS
  ================================= */
  const loadEvents = async () => {
    try {
      const res = await API.get("/events?skip=0&limit=100");

      let generated = [];
      defaultEventTemplates.forEach(t => {
        generated.push(...generateRepeatingEvents(t, 6));
      });

      setEvents([...generated, ...res.data]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  /* ================================
     MONTH RANGE
  ================================= */
  const now = new Date();
  const currentMonth = new Date(
    now.getFullYear(),
    now.getMonth() + monthOffset,
    1
  );

  const start = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const end = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );

  const monthLabel = start.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  /* ================================
     FILTER MONTH EVENTS
  ================================= */
  const getMonthEvents = () => {
    return events
      .filter((e) => {
        const d = new Date(e.event_date);
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  };

  /* ================================
     HELPERS
  ================================= */
  const isToday = (date) =>
    new Date(date).toDateString() === new Date().toDateString();

  const isUpcoming = (date) => new Date(date) > new Date();

  const openMap = (location) => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(location),
      "_blank"
    );
  };

  const gradientColors = [
    "#FF6B6B, #FFD93D",
    "#6BCB77, #4D96FF",
    "#FF8787, #FF6B6B",
    "#FFD93D, #FF8C42",
    "#4D96FF, #6BCB77",
  ];

  const getGradientColor = (idx) =>
    gradientColors[idx % gradientColors.length]
      .split(",")
      .map((c) => c.trim())
      .join(",");

  /* ================================
     FINAL EVENTS
  ================================= */
  const monthEvents = getMonthEvents();

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>📅 Upcoming Events</h2>

        <div style={styles.nav}>
          <button onClick={() => setMonthOffset(monthOffset - 1)}>◀</button>
          <h3>{monthLabel}</h3>
          <button onClick={() => setMonthOffset(monthOffset + 1)}>▶</button>
        </div>
      </div>

      {/* EVENTS */}
      <div style={styles.list}>
        {monthEvents.map((e, idx) => {
          const today = isToday(e.event_date);
          const upcoming = isUpcoming(e.event_date);

          return (
            <div
              key={e.id}
              style={{
                ...styles.card,
                background: today
                  ? "linear-gradient(270deg,#FFD700,#FF69B4,#1E90FF)"
                  : `linear-gradient(135deg, ${getGradientColor(idx)})`,
                border: today ? "2px solid gold" : "none",
              }}
            >

              {/* BADGES */}
              {today && <div style={styles.today}>TODAY 🔥</div>}
              {!today && upcoming && (
                <div style={styles.upcoming}>UPCOMING</div>
              )}

              <h3>{e.title}</h3>
              <p>{e.description}</p>

              <p>
                🕒 {new Date(e.event_date).toLocaleString()}
              </p>

              <p
                style={styles.location}
                onClick={() => openMap(e.location)}
              >
                📍 {e.location}
              </p>

            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================
   STYLES (UNCHANGED FEEL)
================================ */
const styles = {
  container: {
    padding: 30,
    minHeight: "100vh",
    background: "linear-gradient(135deg,#6A1B9A,#ADD8E6)",
    color: "#fff",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  nav: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },

  card: {
    padding: 18,
    borderRadius: 12,
    color: "#fff",
    position: "relative",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  },

  today: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "gold",
    color: "#000",
    padding: "4px 10px",
    borderRadius: 10,
    fontWeight: "bold",
  },

  upcoming: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "#00E5FF",
    color: "#000",
    padding: "4px 10px",
    borderRadius: 10,
    fontWeight: "bold",
  },

  location: {
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: "bold",
  },
};