// pages/Signup.jsx
import { useState } from "react";
import API from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const handleSignup = async () => {
    await API.post("/auth/signup", form);
    alert("Request sent to admin");
  };

  return (
    // <div style={styles.container}>
    //   <h2>Signup</h2>
    //   <input placeholder="Name" onChange={(e)=>setForm({...form,name:e.target.value})}/>
    //   <input placeholder="Email" onChange={(e)=>setForm({...form,email:e.target.value})}/>
    //   <input placeholder="Phone" onChange={(e)=>setForm({...form,phone:e.target.value})}/>
    //   <button onClick={handleSignup}>Signup</button>
    // </div>
    <div style={styles.container}>
  <div style={styles.card}>
    <h2 style={styles.title}>Signup</h2>
    <input style={styles.input} placeholder="Name" />
    <input style={styles.input} placeholder="Email" />
    <input style={styles.input} placeholder="Phone" />
    <button style={styles.button}>Signup</button>
    <p style={styles.link}>Already have an account? Login</p>
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
    background: "linear-gradient(135deg, #e6e6fa, #87ceeb)", // lavender to blue
  },
  card: {
    padding: 30,
    width: 320,
    textAlign: "center",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
  title: {
    marginBottom: 20,
    color: "#6A1B9A", // deep lavender
    fontSize: 22,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
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