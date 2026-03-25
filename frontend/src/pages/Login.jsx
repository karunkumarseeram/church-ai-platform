import { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Signup from "./Signup";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔹 Send OTP
  const sendOtp = async () => {
    try {
      const res = await API.post("/auth/send-otp", { email });

      if (res.data.error) {
        setError(res.data.error);
        return;
      }

      setStep(2);
      setError("");
    } catch (err) {
      setError("Failed to send OTP");
    }
  };

  // 🔹 Verify OTP
  const verifyOtp = async () => {
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });

      if (res.data.error) {
        setError(res.data.error);
        return;
      }

      login(res.data.access_token);

      // 🔥 Role-based redirect
      if (res.data.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard"); // later you can change to user page
      }

    } catch (err) {
      setError("Invalid OTP");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" width={70} />
        <h2>FFT Church</h2>
        <p>HIM We Proclaim</p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {step === 1 && (
          <>
            <input
              style={styles.input}
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={styles.button} onClick={sendOtp}>
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              style={styles.input}
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
            <button style={styles.button} onClick={verifyOtp}>
              Verify & Login
            </button>
          </>
        )}

        {/* 🔗 Navigation Links */}
        <div style={{ marginTop: 20 }}>
          <p style={styles.link} onClick={() =>{(navigate("/signup"))}}>
            New Member? Signup
          </p>

          <p style={styles.link} onClick={() => navigate("/forgot")}>
            Forgot Password?
          </p>
          {/* <Signup/> */}
        </div>
      </div>
    </div>
  );
}

// 🎨 Styles
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    padding: 30,
    width: 300,
    textAlign: "center",
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "10px 0",
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  link: {
    color: "#6A1B9A",
    cursor: "pointer",
    margin: 5,
  },
};

