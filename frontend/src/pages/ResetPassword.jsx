// pages/ResetPassword.jsx
import { useState } from "react";
import API from "../services/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");

  const reset = async () => {
    await API.post("/auth/reset-password", { password });
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={reset}>Update</button>
    </div>
  );
}