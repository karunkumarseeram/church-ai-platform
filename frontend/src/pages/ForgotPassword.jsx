// pages/ForgotPassword.jsx
import { useState } from "react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const send = async () => {
    await API.post("/auth/forgot-password", { email });
    alert("Reset link sent");
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <input onChange={(e)=>setEmail(e.target.value)} />
      <button onClick={send}>Send Link</button>
    </div>
  );
}