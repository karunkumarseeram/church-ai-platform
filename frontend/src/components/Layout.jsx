import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}> 
        <Navbar />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
// const Layout = ({ children }) => {
//   return (
//     <>
//       <Sidebar /> 
//       <main style={{ flex: 1, minWidth: 0 }}>
//         {children}
//       </main>
//     </>
//   );
// };

// export default Layout;