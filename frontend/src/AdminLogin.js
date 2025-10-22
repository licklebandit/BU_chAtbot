// AdminLogin.js
import React, { useState } from "react";
import axios from "axios";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://bu-chatbot.onrender.com/admin/login", {
        email,
        password,
      });
      localStorage.setItem("adminToken", res.data.token);
      window.location.href = "/admin/dashboard"; // redirect after login
    } catch (err) {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#f0f4ff"
    }}>
      <h2>Admin Login</h2>
      <input
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ margin: "5px", padding: "10px", width: "250px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ margin: "5px", padding: "10px", width: "250px" }}
      />
      <button
        onClick={handleLogin}
        style={{ padding: "10px 20px", background: "#1257a5ff", color: "white", border: "none", borderRadius: "6px" }}
      >
        Login
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AdminLogin;
