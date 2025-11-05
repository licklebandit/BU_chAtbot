import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Link, // Removed since the Navbar is removed
  useLocation,
  Navigate,
} from "react-router-dom";

// Pages
import LandingPage from "./LandingPage";
import Chatbot from "./Chatbot";
import Login from "./Login";
import Signup from "./Signup";
import AdminRoutes from "./pages/AdminRoutes"; 

// ✅ Admin Route Protection Component
function AdminRoute({ children }) {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/" replace />;
}

// Main component using React hooks like useLocation
function MainApp() {
  // useLocation is still needed by MainApp if you want to use it for other logic,
  // but it's no longer needed for hiding the nav bar.
  // const location = useLocation(); 
  
  // The logic for 'hideNav' and the entire <nav> block are removed.

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
    <Router>
      <MainApp />
    </Router>
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