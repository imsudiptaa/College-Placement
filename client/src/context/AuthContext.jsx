import { createContext, useContext, useEffect, useState } from "react";

// 1. Create context
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// 2. Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from sessionStorage on first render
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login sets user in both state and sessionStorage
  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
    // Also store token if needed
    // sessionStorage.setItem("authToken", token);
  };

  // Logout clears everything
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
