import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { AUTH_BASE_URL } from "./config/api";
import { Button } from "./components/ui/Button";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // Normalize email: trim and lowercase
      const normalizedForm = {
        ...form,
        email: form.email.trim().toLowerCase()
      };
      
      const response = await axios.post(`${AUTH_BASE_URL}/login`, normalizedForm);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      setStatus({ type: "success", message: "Login successful. Redirecting…" });

      setTimeout(() => {
        navigate(response.data.user.role === "admin" ? "/admin" : "/chatbot", {
          replace: true,
        });
      }, 900);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_transparent_55%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/30 overflow-hidden">
        <div className="p-10 flex flex-col gap-6 bg-gradient-to-br from-slate-900 to-blue-900">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            Access your Bugema University chatbot dashboard.
          </h1>
          <p className="text-white/80 text-sm">
            Manage your saved conversations, receive personalized answers, and unlock
            admin insights with one secure login.
          </p>
          <div className="mt-auto text-sm text-white/70">
            Need an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-white font-semibold underline underline-offset-4"
            >
              Create one now
            </button>
          </div>
        </div>

        <div className="p-8 bg-white text-slate-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="inline-flex items-center gap-2 text-slate-500 text-xs uppercase tracking-[0.3em]">
              <LogIn className="w-4 h-4" />
              Login
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">Email address</label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 bg-white">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  className="w-full border-none outline-none text-sm"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">Password</label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 bg-white">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  className="w-full border-none outline-none text-sm"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {status && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {status.message}
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              loadingText="Signing in…"
              className="w-full justify-center"
            >
              Sign in to BU Chatbot
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
