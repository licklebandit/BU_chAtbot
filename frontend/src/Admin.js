import React, { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
  const [knowledge, setKnowledge] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  // Load data from backend
  const fetchKnowledge = async () => {
    try {
      const res = await axios.get(`${API_BASE}/ingest`);
      setKnowledge(res.data);
    } catch (err) {
      console.error("Error fetching knowledge:", err);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  // Add or update knowledge
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || !answer) return alert("Please fill in both fields");

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/ingest`, { question, answer });
      setQuestion("");
      setAnswer("");
      fetchKnowledge(); // refresh list
    } catch (err) {
      alert("Failed to upload knowledge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🛠 Admin Dashboard</h2>
      <p>Manage Bugema University chatbot knowledge base.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={styles.input}
        />
        <textarea
          placeholder="Enter answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={styles.textarea}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Saving..." : "Save Knowledge"}
        </button>
      </form>

      <h3>📚 Knowledge Base</h3>
      <div style={styles.list}>
        {knowledge.map((item, i) => (
          <div key={i} style={styles.item}>
            <strong>Q:</strong> {item.question}
            <br />
            <strong>A:</strong> {item.answer}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "30px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    minHeight: "80px",
  },
  button: {
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    cursor: "pointer",
  },
  list: {
    textAlign: "left",
  },
  item: {
    background: "#f9f9f9",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "10px",
  },
};

export default Admin;
