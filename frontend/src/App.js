import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

// 🛠 FIX: Reverting imports to simple file paths without extensions 
// to resolve persistent "Could not resolve" errors.
import LandingPage from "./LandingPage"; 
import Chatbot from "./Chatbot";
import Admin from "./Admin";
import Login from "./Login";
import Signup from "./Signup";

// ✅ Admin Route Protection (Still required)
function AdminRoute({ children }) {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/" />;
}

function MainApp() {
  const location = useLocation();

  // The logic to hide the navbar on the specified paths remains correct.
  const hideNav = 
    location.pathname === "/" || 
    location.pathname === "/chatbot" || 
    location.pathname === "/login" || 
    location.pathname === "/admin" || 
    location.pathname === "/signup";

  return (
    <div>
      {/* Navbar is hidden if hideNav is true */}
      {!hideNav && (
        <div style={{ textAlign: "center", margin: "20px" }}>
          <Link to="/chatbot" style={styles.navLink}> 
            💬 Chatbot
          </Link>{" "}
          |{" "}
          <Link to="/admin" style={styles.navLink}>
            🛠 Admin
          </Link>{" "}
          |{" "}
          <Link to="/login" style={styles.navLink}>
            🔐 Login
          </Link>{" "}
          |{" "}
          <Link to="/signup" style={styles.navLink}>
            📝 Signup
          </Link>
        </div>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Unprotected Chatbot route */}
        <Route
          path="/chatbot"
          element={
            <Chatbot />
          }
        />
        
        {/* Protected Admin route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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

const styles = {
  navLink: {
    textDecoration: "none",
    color: "#0078ff",
    fontWeight: "bold",
    margin: "0 10px",
  },
};

export default App;