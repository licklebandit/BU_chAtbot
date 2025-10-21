import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("https://bu-chatbot.onrender.com/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => (window.location.href = "/"), 1000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔐 Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Don’t have an account? <a href="/signup">Sign up here</a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "60px auto",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    background: "white",
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: 10, borderRadius: 8, border: "1px solid #ccc" },
  button: {
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px",
    cursor: "pointer",
  },
};

export default Login;
