import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chatbot from "./Chatbot";
import Admin from "./Admin";

function App() {
  return (
    <Router>
      <div style={{ textAlign: "center", margin: "20px" }}>
        <Link to="/" style={styles.navLink}>
          💬 Chatbot
        </Link>{" "}
        |{" "}
        <Link to="/admin" style={styles.navLink}>
          🛠 Admin
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<Chatbot />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

const styles = {
  navLink: { textDecoration: "none", color: "#0078ff", fontWeight: "bold" },
};

export default App;
