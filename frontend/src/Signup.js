import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_BASE_URL } from "./config/api";
import { useTheme } from "./context/ThemeContext";

const PRIMARY_COLOR = "#0033A0";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { isDark } = useTheme();

  // Theme Classes
  const backgroundClass = isDark
    ? "bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]"
    : "bg-gradient-to-br from-[#eaf1ff] via-white to-[#d9e5ff]";

  const overlayClass = isDark
    ? "bg-[radial-gradient(circle_at_22%_20%,_rgba(37,99,235,0.18),_transparent_60%)]"
    : "bg-[radial-gradient(circle_at_12%_18%,_rgba(0,51,160,0.18),_transparent_55%)]";

  const headingColor = isDark ? "text-slate-100" : "text-[#0f2a66]";
  const subHeadingColor = isDark ? "text-slate-300" : "text-[#2d3e73]";
  const labelColor = isDark ? "text-slate-300" : "text-[#4a5aa6]";
  const supportText = isDark ? "text-slate-400" : "text-[#41518e]";

  const inputBorder = isDark
    ? "border-slate-700 bg-slate-900/70 text-slate-100"
    : "border-[#d6dfff] bg-white text-slate-900";

  const inputFocus = isDark
    ? "focus:border-[#9db8ff] focus:ring-[#1e3a8a]"
    : "focus:border-[#0033A0] focus:ring-[#c5d4ff]";

  const accentButton = isDark
    ? "bg-[#1b3b82] hover:bg-[#1a2f63]"
    : "bg-[color:var(--primary-color)] hover:bg-[#062a7a]";

  // Handlers
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (form.password !== form.confirmPassword) {
        setStatus({
          type: "error",
          message: "Passwords do not match.",
        });
        setLoading(false);
        return;
      }

      const normalizedForm = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
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
    <div className={`relative min-h-screen overflow-hidden ${backgroundClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-[0_40px_70px_rgba(4,7,25,0.4)] backdrop-blur">

          {/* CENTERED TITLE + SUBTITLE */}
          <div className="text-center">
            <h1 className={`text-3xl font-semibold ${headingColor}`}>
              Create account
            </h1>
            <p className={`mt-2 text-sm ${subHeadingColor}`}>
              Save conversations, personalize assistance, and access more resources.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">

            {/* Full Name */}
            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-[0.25em] ${labelColor}`}>
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
                className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${inputBorder} ${inputFocus}`}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-[0.25em] ${labelColor}`}>
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
              <label className={`text-xs font-semibold uppercase tracking-[0.25em] ${labelColor}`}>
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
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-[0.25em] ${labelColor}`}>
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat your password"
                  className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm transition focus:outline-none focus:ring-2 ${inputBorder} ${inputFocus}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Status Message */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0033A0]/25 transition disabled:opacity-60 ${accentButton}`}
              style={{ "--primary-color": PRIMARY_COLOR }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

          </form>

          {/* Login Redirect */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${supportText}`}>Already have an account?</p>
            <button
              onClick={() => navigate("/login")}
              className={`mt-3 inline-flex items-center justify-center rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                isDark
                  ? "border-slate-600 text-slate-200 hover:border-slate-400"
                  : "border-[#b8c8ff] text-[#0f2a66] hover:border-[#0033A0] hover:text-[#0033A0]"
              }`}
            >
              Log in
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;
