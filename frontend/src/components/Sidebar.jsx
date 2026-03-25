import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <Drawer variant="permanent">
      <div style={{ padding: 20, textAlign: "center" }}>
        <img src="/logo.png" width={60} />
        <h3>FFT Temple</h3>
        <p>HIM We Proclaim</p>
      </div>

      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/members">
          <ListItemText primary="Members" />
        </ListItem>
        <ListItem button component={Link} to="/events">
          <ListItemText primary="Events" />
        </ListItem>
        <ListItem button component={Link} to="/donations">
          <ListItemText primary="Donations" />
        </ListItem>
        <ListItem button component={Link} to="/live">
          <ListItemText primary="Live" />
        </ListItem>
      </List>
    </Drawer>
  );
}