import { useEffect, useState } from "react";
import API from "../services/api";

export default function Events() {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    try {
      const res = await API.get("/events?skip=0&limit=10");
      setEvents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 Auto load on page open
  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Church Events</h2>

      {events.map((e) => (
        <div key={e.id} style={{ marginBottom: 10 }}>
          <h3>{e.title}</h3>
          <p>{e.description}</p>
        </div>
      ))}
    </div>
  );
}