import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_BASE_URL } from "./config/api";
import { useTheme } from "./context/ThemeContext";

const PRIMARY_COLOR = "#0033A0";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { isDark } = useTheme();

  const backgroundClass = isDark
    ? "bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]"
    : "bg-gradient-to-br from-[#eaf1ff] via-white to-[#d9e5ff]";
  const overlayClass = isDark
    ? "bg-[radial-gradient(circle_at_25%_20%,_rgba(37,99,235,0.18),_transparent_60%)]"
    : "bg-[radial-gradient(circle_at_15%_20%,_rgba(0,51,160,0.18),_transparent_55%)]";
  const cardBg = isDark ? "bg-slate-900/80" : "bg-white/95";

  const headingColor = isDark ? "text-slate-100" : "text-[#0f2a66]";
  const subHeadingColor = isDark ? "text-slate-300" : "text-[#2d3e73]";
  const labelColor = isDark ? "text-slate-300" : "text-[#4a5aa6]";
  const inputBorder = isDark
    ? "border-slate-700 bg-slate-900/70 text-slate-100"
    : "border-[#d6dfff] bg-white text-slate-900";
  const inputFocus = isDark
    ? "focus:border-[#9db8ff] focus:ring-[#1e3a8a]"
    : "focus:border-[#0033A0] focus:ring-[#c5d4ff]";
  const supportText = isDark ? "text-slate-400" : "text-[#41518e]";
  const accentButton = isDark
    ? "bg-[#1b3b82] hover:bg-[#1a2f63]"
    : "bg-[color:var(--primary-color)] hover:bg-[#062a7a]";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const normalizedForm = {
        ...form,
        email: form.email.trim().toLowerCase(),
      };

      const response = await axios.post(
        `${AUTH_BASE_URL}/login`,
        normalizedForm,
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);

      setStatus({
        type: "success",
        message: "Login successful. Redirecting…",
      });

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
    <div className={`relative min-h-screen overflow-hidden ${backgroundClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-3 lg:px-8">
        <div
          className={`mx-auto w-full max-w-md rounded-3xl border border-white/10 ${cardBg} p-8 shadow-[0_40px_70px_rgba(4,7,25,0.4)] backdrop-blur`}
        >
          {/* Centered heading block */}
          <div className="text-center mb-4">
            <h1 className={`text-3xl font-semibold ${headingColor}`}>Login</h1>
            <p className={`mt-2 text-sm ${subHeadingColor}`}>
              Access your conversations and manage your support intakes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${labelColor}`}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@bugema.ac.ug"
                className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${inputBorder} ${inputFocus}`}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${labelColor}`}
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm transition focus:outline-none focus:ring-2 ${inputBorder} ${inputFocus}`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Status message */}
            {status && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "bg-[#e5f6f3] text-[#0f5132] border border-[#b6e4d8]"
                    : "bg-[#fce8eb] text-[#7b1e2d] border border-[#f3bcc6]"
                }`}
              >
                {status.message}
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0033A0]/25 transition disabled:opacity-60 ${accentButton}`}
              style={{ "--primary-color": PRIMARY_COLOR }}
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          {/* Bottom links */}
          <div className="mt-8 space-y-4 text-center">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className={`text-sm font-semibold transition ${
                isDark
                  ? "text-[#9db8ff] hover:text-white"
                  : "text-[#0033A0] hover:text-[#062a7a]"
              }`}
            >
              Forgot password?
            </button>

            <div className="flex items-center justify-between">
              <p className={`text-sm ${supportText}`}>Don't have an account?</p>

              <button
                onClick={() => navigate("/signup")}
                className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  isDark
                    ? "border-slate-600 text-slate-200 hover:border-slate-400"
                    : "border-[#b8c8ff] text-[#0f2a66] hover:border-[#0033A0] hover:text-[#0033A0]"
                }`}
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
