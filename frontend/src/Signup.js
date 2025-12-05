import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { AUTH_BASE_URL } from "./config/api";
import { Button } from "./components/ui/Button";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
        email: form.email.trim().toLowerCase(),
        name: form.name.trim()
      };
      
      await axios.post(`${AUTH_BASE_URL}/signup`, normalizedForm);
      setStatus({
        type: "success",
        message: "Account created! Redirecting to login…",
      });
      setTimeout(() => navigate("/login", { replace: true }), 1000);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Signup failed. Please review your details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.3),_transparent_55%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 bg-white/5 border border-white/10 rounded-3xl shadow-2xl shadow-indigo-900/30 overflow-hidden">
        <div className="p-10 flex flex-col gap-6 bg-gradient-to-br from-indigo-900 to-purple-900">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Create account
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            Join the Bugema University chatbot experience.
          </h1>
          <p className="text-white/80 text-sm">
            Save your conversations, get personalized updates, and collaborate with admin
            teams in one secure space.
          </p>
          <div className="mt-auto text-sm text-white/70">
            Already registered?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-white font-semibold underline underline-offset-4"
            >
              Log in instead
            </button>
          </div>
        </div>

        <div className="p-8 bg-white text-slate-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="inline-flex items-center gap-2 text-slate-500 text-xs uppercase tracking-[0.3em]">
              <UserPlus className="w-4 h-4" />
              Signup
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">Full name</label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 bg-white">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  className="w-full border-none outline-none text-sm"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
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
              loadingText="Creating account…"
              className="w-full justify-center"
            >
              Create BU Chatbot account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
