import { useState, useEffect } from "react";
import API from "../services/api";

export default function AddEventModal({ onClose, onSave, event }) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [location, setLocation] = useState(event?.location || "");
  const [date, setDate] = useState(event?.event_date ? event.event_date.split("T")[0] : "");
  const [time, setTime] = useState(event?.event_date ? event.event_date.split("T")[1]?.slice(0,5) : "");

  const handleSave = async () => {
    if (!title || !date || !time) return alert("Title, date and time are required!");
    const eventData = {
      title,
      description,
      location,
      event_date: `${date}T${time}:00`,
    };

    try {
      if (event?.id) {
        await API.put(`/events/${event.id}`, eventData);
      } else {
        await API.post("/events", eventData);
      }
      onSave();
    } catch (err) {
      console.error("Failed to save event", err);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{event?.id ? "Edit Event" : "Add Event"}</h3>
        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            style={{ ...styles.input, resize: "vertical", minHeight: 60 }}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            style={styles.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            style={styles.input}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 1000
  },
  modal: {
    background: "#f7f2ff",
    padding: 30,
    borderRadius: 12,
    width: 450,
    display: "flex",
    flexDirection: "column",
    gap: 15,
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
  },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  },
  buttons: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  saveBtn: { padding: "10px 18px", background: "#6A1B9A", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  cancelBtn: { padding: "10px 18px", background: "#ccc", color: "#000", border: "none", borderRadius: 8, cursor: "pointer" },
};