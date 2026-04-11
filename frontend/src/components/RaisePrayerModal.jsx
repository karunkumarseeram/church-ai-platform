// src/components/RaisePrayerModal.jsx
import { useState } from "react";
import API from "../services/api";

export default function RaisePrayerModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!name || !message) return alert("Please fill in all fields!");
    try {
      await API.post("/prayers", { name, message });
      onSave();
    } catch (err) {
      console.error("Failed to submit prayer request", err);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Raise Prayer Request</h3>
        <input
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          style={{ ...styles.input, minHeight: 80 }}
          placeholder="Prayer Request"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSubmit}>Submit</button>
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
    background: "#f7f2ff", padding: 30, borderRadius: 12, width: 400, display: "flex", flexDirection: "column", gap: 15
  },
  input: { padding: 12, borderRadius: 8, border: "1px solid #ccc", width: "100%", boxSizing: "border-box" },
  buttons: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  saveBtn: { padding: "10px 18px", background: "#6A1B9A", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  cancelBtn: { padding: "10px 18px", background: "#ccc", color: "#000", border: "none", borderRadius: 8, cursor: "pointer" },
};