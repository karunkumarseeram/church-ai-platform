import { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid OTP");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/fft_logo.png" alt="fft_logo" style={styles.fft_logo} />
        {/* FFT Church bigger logo */}
        {/* <img src="/fft_logo.png" alt="FFT Church Logo" style={styles.fft_logo} /> */}
        <h2 style={styles.title}>FFT Church</h2>
        <p style={styles.subtitle}>HIM We Proclaim 🙏</p>

        {error && <p style={styles.error}>{error}</p>}

        {step === 1 && (
          <>
            <input
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              onChange={(e) => {setEmail(e.target.value),console.log(email)}}
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
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button style={styles.button} onClick={verifyOtp}>
              Verify & Login
            </button>
          </>
        )}

        {/* 🔗 Links */}
        <div style={styles.links}>
          <p style={styles.link} onClick={() => navigate("/signup")}>
            New Member? Signup
          </p>

          <p style={styles.link} onClick={() => navigate("/forgot")}>
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
}

// const styles = { container: { display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #6A1B9A, #87CEEB)", },
// 🎨 MODERN STYLES
// const styles = {
//   container: {
//     display: "flex",
//     height: "100vh",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundImage: "url('/bg-login.png')", // ✅ background image
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     backgroundRepeat: "no-repeat",
//   },
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `
      linear-gradient(135deg, rgba(106,27,154,0.7), rgba(135,206,235,0.7)), 
      url('/Bg-login_pige.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  card: {
    padding: 35,
    width: 340,
    textAlign: "center",
    background: "#fff",
    borderRadius: 15,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.6s ease",
  },
  fft_logo: {
    width: 120,        // scaled down from original 740x740
    height: 120,       // keeps square ratio
    marginBottom: 20,  // space below logo
    objectFit: "contain",
  },
  title: {
    margin: 5,
    color: "#6A1B9A",
  },
  subtitle: {
    marginBottom: 20,
    color: "#555",
    fontSize: 14,
  },
  input: {
    width: "100%",
    padding: 12,
    margin: "10px 0",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
    outline: "none",
    transition: "0.3s",
  },
  button: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
  links: {
    marginTop: 20,
  },
  link: {
    color: "#6A1B9A",
    cursor: "pointer",
    fontSize: 14,
    margin: 5,
  },
  error: {
    color: "red",
    fontSize: 13,
  },
};