import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.phone) {
      setError("All fields are required");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/signup", form);
      alert("Signup successful. Please login.");
      navigate("/"); // redirect to login
    } catch (err) {
      setError("Signup failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* <img src="/fft_logo.png" width={60} alt="fft_logo" /> */}
        <img src="/fft_logo.png" width={60} alt="FFT Church Logo" style={styles.fft_logo} />
        <h2 style={styles.title}>FFT Church Signup</h2>
        <p style={{ fontSize: 13 }}>HIM We Proclaim</p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          style={styles.input}
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Phone"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        <button style={styles.button} onClick={handleSignup}>
          Signup
        </button>

        <p style={styles.link} onClick={() => navigate("/")}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `
      linear-gradient(135deg, rgba(230,230,250,0.7), rgba(135,206,235,0.7)), 
      url('/bg-signup.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  card: {
    padding: 30,
    width: 320,
    textAlign: "center",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
  fft_logo: {
    width: 120,        // scaled down from original 740x740
    height: 120,       // keeps square ratio
    marginBottom: 0,  // space below logo
    objectFit: "contain",
  },
  title: {
    marginBottom: 0,
    color: "#6A1B9A", // deep lavender
    fontSize: 22,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    // width: "300px",
    boxSizing: "border-box",
    padding: 12,
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
  },
  inputFocus: {
    borderColor: "#87ceeb",
  },
  button: {
    width: "100%",
    padding: 12,
    marginTop: 15,
    background: "#6A1B9A",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  buttonHover: {
    background: "#4B0082", // darker indigo
  },
  link: {
    color: "#6A1B9A",
    cursor: "pointer",
    margin: 5,
    fontSize: 14,
  },
};