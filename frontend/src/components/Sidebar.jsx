// import { Drawer, List, ListItem, ListItemText } from "@mui/material";
// import { Link } from "react-router-dom";

// export default function Sidebar() {
//   return (
//     <Drawer variant="permanent">
//       <div style={{ padding: 20, textAlign: "center" }}>
//         <img src="/logo.png" width={60} />
//         <h3>FFT Temple</h3>
//         <p>HIM We Proclaim</p>
//       </div>

//       <List>
//         <ListItem button component={Link} to="/dashboard">
//           <ListItemText primary="Dashboard" />
//         </ListItem>
//         <ListItem button component={Link} to="/members">
//           <ListItemText primary="Members" />
//         </ListItem>
//         <ListItem button component={Link} to="/events">
//           <ListItemText primary="Events" />
//         </ListItem>
//         <ListItem button component={Link} to="/donations">
//           <ListItemText primary="Donations" />
//         </ListItem>
//         <ListItem button component={Link} to="/live">
//           <ListItemText primary="Live" />
//         </ListItem>
//       </List>
//     </Drawer>
//   );
// }
import { Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import { Link } from "react-router-dom";

// 1. Define a constant width
const drawerWidth = 240; 

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth, // Sets the space it takes in the flex container
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: "border-box" 
        },
      }}
    >
      <Box sx={{ padding: 3, textAlign: "center" }}>
        <img src="/logo.png" width={60} alt="Logo" />
        <h3>FFT Temple</h3>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>HIM We Proclaim</p>
      </Box>

      <List>
        {["Dashboard", "Members", "Events", "Donations", "Live"].map((text) => (
          <ListItem key={text} button component={Link} to={`/${text.toLowerCase()}`}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}