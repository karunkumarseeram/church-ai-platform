import { createContext, useState, useEffect } from "react";
// import jwtDecode from "jwt-decode"; // fixed import
import jwtDecode from "jwt-decode"; // must match usage below

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const storedToken = localStorage.getItem("token");
  const [token, setToken] = useState(storedToken);
  const [userRole, setUserRole] = useState(null);

  // On initial load, decode token if exists
  useEffect(() => {
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken); // fixed usage
        setUserRole(decoded.role);
      } catch (err) {
        console.error("Invalid token", err);
        setToken(null);
        setUserRole(null);
      }
    }
  }, [storedToken]);

  const login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
    try {
      const decoded = jwtDecode(token); // fixed usage
      setUserRole(decoded.role);
    } catch (err) {
      console.error("Failed to decode token", err);
      setUserRole(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};