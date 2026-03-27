import { Box, List, ListItem, ListItemText } from "@mui/material";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Members", path: "/members" },
  { name: "Events", path: "/events" },
  { name: "Donations", path: "/donations" },
  { name: "Live", path: "/live" },
];

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "#fff",
        borderRight: "1px solid #e5e4e7",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ p: 3, fontWeight: "bold", fontSize: 20, color: "#6A1B9A" }}>
        FFT Menu
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.name}
            button
            component={NavLink}
            to={item.path}
            sx={{
              "&.active": { backgroundColor: "rgba(170,59,255,0.1)", color: "#aa3bff" },
            }}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}