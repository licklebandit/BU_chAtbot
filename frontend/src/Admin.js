import React, { useState } from "react";
import axios from "axios";

function Admin() {
  const [keyword, setKeyword] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!keyword.trim() || !answer.trim()) {
      setMessage("Please fill in both fields.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/ingest", {
        keyword,
        answer,
      });

      setMessage(res.data.message || "Knowledge saved!");
      setKeyword("");
      setAnswer("");
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Error saving data.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>📚 Bugema Chatbot Admin Panel</h2>
      <p style={{ color: "#555" }}>
        Add new question-answer pairs to the chatbot’s local knowledge.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter keyword (e.g., hostel information)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Enter chatbot's answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={styles.textarea}
        />

        <button type="submit" style={styles.button}>
          Add to Knowledge
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    background: "white",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 20,
  },
  input: {
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  textarea: {
    minHeight: 120,
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  button: {
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    marginTop: 15,
    color: "#0078ff",
  },
};

export default Admin;
