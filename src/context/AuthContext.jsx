import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    console.log("🔍 AuthContext - Token from localStorage:", savedToken);
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      console.log("✅ AuthContext - Token restored from localStorage");
    } else {
      console.log("❌ AuthContext - No token found in localStorage");
      setIsAuthenticated(false);
    }
  }, []);

  const login = (jwtToken) => {
    console.log("🔐 AuthContext - Login called, saving token");
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("🔐 AuthContext - Logout called, removing token");
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
