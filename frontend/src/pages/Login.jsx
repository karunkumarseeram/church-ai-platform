import { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const sendOtp = async () => {
    await API.post("/auth/send-otp", { email });
    setStep(2);
  };

  const verifyOtp = async () => {
    const res = await API.post("/auth/verify-otp", { email, otp });
    login(res.data.access_token);
    navigate("/dashboard");
  };

  return (
    <div style={{ padding: 50 }}>
      <h2>FFT Church Login</h2>

      {step === 1 && (
        <>
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input placeholder="OTP" onChange={(e) => setOtp(e.target.value)} />
          <button onClick={verifyOtp}>Verify</button>
        </>
      )}
    </div>
  );
}