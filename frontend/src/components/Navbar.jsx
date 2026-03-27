import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // ✅ removes token from state & localStorage
    navigate("/");     // ✅ redirect to login page
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 64,
        px: 3,
        background: "linear-gradient(135deg, #FF7E5F, #FEB47B)", // Header gradient
        color: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Faith Fellowship Temple
      </Typography>

      <Button
        onClick={handleLogout}  // ✅ trigger logout
        sx={{
          background: "linear-gradient(135deg, #FF4B2B, #FF416C)", // Logout gradient
          color: "#fff",
          borderRadius: 2,
          px: 3,
          py: 1,
          fontWeight: "bold",
          textTransform: "none",
          "&:hover": {
            opacity: 0.9,
          },
        }}
      >
        Logout
      </Button>
    </Box>
  );
}