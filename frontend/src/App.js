import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

// FIX: Added .jsx extensions to resolve "Could not resolve" errors
import LandingPage from "./LandingPage.js"; 
import Chatbot from "./Chatbot.js";
import Admin from "./Admin.js";
import Login from "./Login.js";
import Signup from "./Signup.js";

// ✅ Admin Route Protection (Still required)
// Only allows users with role 'admin' to access the component.
function AdminRoute({ children }) {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/" />;
}

// NOTE: The UserRoute component is correctly removed, 
// allowing all users to access the Chatbot.

function MainApp() {
  const location = useLocation();

  // Hide navbar on Landing Page and Chat Page. 
  // Checks for the consistent path: /chatbot
  const hideNav = location.pathname === "/" || location.pathname === "/chatbot";

  return (
    <div>
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
        
        {/* The Chatbot route is correctly UNPROTECTED and functional */}
        <Route
          path="/chatbot"
          element={
            <Chatbot />
          }
        />
        
        {/* Admin route remains protected */}
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