// /frontend/src/components/LandingPage.js
import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/chat");
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.content}>
        <img src="/bot.png" alt="Bot" style={styles.image} />
        <h1 style={styles.title}>BU ChAtBot</h1>
        <p style={styles.subtitle}>Ask me about Bugema University..</p>

        <button style={styles.button} onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    height: "100vh",
    width: "100%",
    background: "linear-gradient(to bottom right, #001f3f, #0057ff)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    background: "rgba(0,0,50,0.3)",
  },
  content: {
    position: "relative",
    textAlign: "center",
    color: "white",
    zIndex: 2,
  },
  image: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    marginBottom: "20px",
    boxShadow: "0 0 25px rgba(255,255,255,0.2)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "25px",
  },
  button: {
    background: "#94edecff",
    color: "black",
    border: "none",
    padding: "12px 30px",
    borderRadius: "25px",
    fontSize: "1.2rem",
    cursor: "pointer",
    transition: "0.3s",
  },
};

export default LandingPage;
