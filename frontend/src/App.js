import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

import LandingPage from "./LandingPage";
import Chatbot from "./Chatbot";
import Admin from "./Admin";
import Login from "./Login";
import Signup from "./Signup";

// ✅ Route protection components
function AdminRoute({ children }) {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/" />;
}

function UserRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function MainApp() {
  const location = useLocation();

  // Hide navbar on Landing Page and Chat Page
  const hideNav = location.pathname === "/" || location.pathname === "/chat";

  return (
    <div>
      {!hideNav && (
        <div style={{ textAlign: "center", margin: "20px" }}>
          <Link to="/chat" style={styles.navLink}>
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
        <Route
          path="/chat"
          element={
            <UserRoute>
              <Chatbot />
            </UserRoute>
          }
        />
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
