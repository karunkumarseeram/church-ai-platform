import { useState, useContext, useRef } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  const inputsRef = useRef([]);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 🔹 Send OTP
  const sendOtp = async () => {
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    try {
      await API.post("/auth/send-otp", { email });

      setStep(2);
      setError("");
      startTimer();

    } catch (err) {
      setError("Failed to send OTP");
    }
  };

  // 🔹 Timer
  const startTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🔹 Resend OTP
  const resendOtp = async () => {
    if (timer > 0) return;

    try {
      await API.post("/auth/send-otp", { email });
      setError("");
      startTimer();
    } catch {
      setError("Failed to resend OTP");
    }
  };

  // 🔹 Handle OTP input
  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move forward
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // 🔹 Handle Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // 🔹 Handle Paste
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = pasteData.split("");
    setOtp(newOtp);

    newOtp.forEach((digit, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = digit;
      }
    });
  };

  // 🔹 Verify OTP
  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Enter complete OTP");
      return;
    }

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp: finalOtp,
      });

      login(res.data.access_token);
      navigate("/dashboard");

    } catch {
      setError("Invalid OTP");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/fft_logo.png" alt="fft_logo" style={styles.logo} />
        <h2 style={styles.title}>FFT</h2>
        <p style={styles.subtitle}>HIM We Proclaim 🙏</p>

        {error && <p style={styles.error}>{error}</p>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button style={styles.button} onClick={sendOtp}>
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div style={styles.otpContainer} onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  style={styles.otpInput}
                  value={digit}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>

            <button style={styles.button} onClick={verifyOtp}>
              Verify & Login
            </button>

            <p
              style={{
                ...styles.link,
                opacity: timer > 0 ? 0.5 : 1,
                cursor: timer > 0 ? "not-allowed" : "pointer",
              }}
              onClick={resendOtp}
            >
              {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </p>
          </>
        )}

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

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `
      linear-gradient(135deg, rgba(106,27,154,0.7), rgba(135,206,235,0.7)), 
      url('/bg-login.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(138, 43, 226, 0.3)", // lavender overlay with low opacity
    zIndex: 1,
  },
  card: {
    position: "relative",
    zIndex: 2,
    padding: 40,
    width: 360,
    textAlign: "center",
    background: "rgba(255,255,255,0.95)", // slightly transparent card
    borderRadius: 15,
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logo: {
    width: 100,
    marginBottom: 10,
  },
  title: {
    color: "#6A1B9A",
    fontSize: 28,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    margin: "10px 0",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    boxSizing: "border-box", // ensures padding does not break width
  },
  button: {
    width: "100%",
    padding: 14,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 16,
    marginTop: 10,
  },
  otpContainer: {
    display: "flex",
    justifyContent: "center",
    gap:10,
    margin: "20px 0",
  },
  otpInput: {
    width: 45,
    height: 50,
    textAlign: "center",
    fontSize: 18,
    borderRadius: 8,
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  link: {
    color: "#6A1B9A",
    cursor: "pointer",
    marginTop: 10,
    fontSize: 14,
  },
  links: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },
  error: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
  },
};