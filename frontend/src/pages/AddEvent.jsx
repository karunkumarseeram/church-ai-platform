import { useState, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AddEvent() {
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    event_date: null,
  });

  const [error, setError] = useState("");

  if (role !== "ADMIN" && role !== "PASTOR") {
    return <h2>Unauthorized</h2>;
  }

  const handleSubmit = async () => {
    if (!form.title || !form.event_date) {
      setError("Title & Date required");
      return;
    }

    try {
      await API.post("/events", form);
      navigate("/dashboard");
    } catch {
      setError("Failed to create event");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Add Event</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Title"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <input
        placeholder="Location"
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />

      <textarea
        placeholder="Description"
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <DatePicker
        selected={form.event_date}
        onChange={(date) => setForm({ ...form, event_date: date })}
        showTimeSelect
        dateFormat="Pp"
      />

      <button onClick={handleSubmit}>Create</button>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", marginTop: 50 },
  card: { padding: 30, background: "#fff", borderRadius: 10, width: 350 },
  input: { width: "100%", padding: 10, margin: "10px 0" },
  button: { padding: 10, background: "#6A1B9A", color: "#fff", border: "none" },
  error: { color: "red" },
};