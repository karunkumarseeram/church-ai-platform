import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* LEFT SIDE */}
      <div className="left">
        <img src="/logo.png" alt="FFT" className="big-logo" />
      </div>

      {/* RIGHT SIDE */}
      <div className="right">
        <div className="card">
          <img src="/logo.png" width={80} />
          <h2>FFT Faith Fellowship Temple</h2>
          <p>HIM We Proclaim</p>

          <button onClick={() => navigate("/login")} className="btn">
            Login as User
          </button>

          <button onClick={() => navigate("/admin-login")} className="btn secondary">
            Admin Login
          </button>

          <button onClick={() => navigate("/signup")} className="btn outline">
            New Member Signup
          </button>
        </div>
      </div>
    </div>
  );
}