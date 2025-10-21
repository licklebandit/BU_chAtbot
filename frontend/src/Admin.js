import React, { useEffect, useState } from "react";
import axios from "axios";
import Login from "./Login";

function Admin() {
  const [knowledge, setKnowledge] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const token = localStorage.getItem("token");

  const fetchKnowledge = async () => {
    try {
      const res = await axios.get("https://bu-chatbot.onrender.com/ingest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKnowledge(res.data);
    } catch (err) {
      console.error("Error fetching knowledge:", err);
    }
  };

  useEffect(() => {
    if (loggedIn) fetchKnowledge();
  }, [loggedIn]);

  const handleSave = async () => {
    try {
      await axios.post(
        "https://bu-chatbot.onrender.com/ingest",
        { keyword, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setKeyword("");
      setAnswer("");
      setEditingId(null);
      fetchKnowledge();
    } catch (err) {
      console.error(err);
      alert("❌ Error saving knowledge");
    }
  };

  const handleEdit = (item) => {
    setKeyword(item.keyword);
    setAnswer(item.answer);
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`https://bu-chatbot.onrender.com/ingest/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchKnowledge();
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting entry");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={styles.container}>
      <h2>🛠 Bugema University Admin Panel</h2>
      <button style={styles.logout} onClick={handleLogout}>
        Logout
      </button>

      <div style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button style={styles.button} onClick={handleSave}>
          💾 {editingId ? "Update" : "Add"} Knowledge
        </button>
      </div>

      <h3>📚 Current Knowledge</h3>
      <ul style={styles.list}>
        {knowledge.map((item) => (
          <li key={item._id} style={styles.item}>
            <strong>{item.keyword}</strong> — {item.answer}
            <div>
              <button style={styles.editBtn} onClick={() => handleEdit(item)}>
                ✏️ Edit
              </button>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(item._id)}
              >
                🗑️ Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: { maxWidth: 700, margin: "30px auto", padding: 20 },
  logout: {
    float: "right",
    background: "red",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 5,
    cursor: "pointer",
  },
  form: { marginBottom: 20 },
  input: { width: "100%", padding: 8, marginBottom: 10 },
  textarea: { width: "100%", padding: 8, minHeight: 80, marginBottom: 10 },
  button: {
    background: "#0078ff",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: 6,
  },
  list: { listStyle: "none", padding: 0 },
  item: {
    background: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: 6,
    marginBottom: 8,
    padding: 10,
  },
  editBtn: {
    background: "#0078ff",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    marginRight: 5,
    cursor: "pointer",
  },
  deleteBtn: {
    background: "crimson",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
};

export default Admin;
