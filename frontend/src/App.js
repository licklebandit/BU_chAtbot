import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import LandingPage from "./LandingPage";
import Chatbot from "./Chatbot";
import Login from "./Login";
import Signup from "./Signup";
import AdminRoutes from "./pages/AdminRoutes";
import ForgotPassword from "./ForgotPassword";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";

// ✅ Admin Route Protection Component
function AdminRoute({ children }) {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/" replace />;
}

function MainApp() {
  return (
    <div>
      {/* The Navbar block was here, but has been entirely removed
      to hide it from all pages, as requested.
      */}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected admin routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminRoutes />
            </AdminRoute>
          }
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <Router>
          <MainApp />
        </Router>
      </SocketProvider>
    </ThemeProvider>
  );
}

// The styles object is no longer needed since it only styled the removed navbar.
/*
const styles = {
  navContainer: {
    textAlign: "center",
    margin: "20px 0",
    padding: "10px 0",
    borderBottom: "1px solid #ccc",
  },
  navLink: {
    textDecoration: "none",
    color: "#0078ff",
    fontWeight: "bold",
    margin: "0 10px",
  },
};
*/

export default App;
