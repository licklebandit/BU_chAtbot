import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { AUTH_BASE_URL } from "./config/api";
import { useTheme } from "./context/ThemeContext";

const PRIMARY_COLOR = "#0033A0";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  // Themed UI classes
  const backgroundClass = isDark
    ? "bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]"
    : "bg-gradient-to-br from-[#eaf1ff] via-white to-[#d9e5ff]";
  const overlayClass = isDark
    ? "bg-[radial-gradient(circle_at_28%_18%,_rgba(37,99,235,0.18),_transparent_60%)]"
    : "bg-[radial-gradient(circle_at_18%_16%,_rgba(0,51,160,0.18),_transparent_55%)]";
  const cardBorder = isDark ? "border-slate-800" : "border-[#becdff]";
  const cardBg = isDark ? "bg-slate-900/80" : "bg-white/95";
  const headingColor = isDark ? "text-slate-100" : "text-[#0f2a66]";
  const bodyColor = isDark ? "text-slate-300" : "text-[#2d3e73]";
  const labelColor = isDark ? "text-slate-300" : "text-[#4a5aa6]";
  const inputBorder = isDark
    ? "border-slate-700 bg-slate-900/70 text-slate-100"
    : "border-[#d6dfff] bg-white text-slate-900";
  const inputFocus = isDark
    ? "focus:border-[#9db8ff] focus:ring-[#1e3a8a]"
    : "focus:border-[#0033A0] focus:ring-[#c5d4ff]";
  const accentButton = isDark
    ? "bg-[#1b3b82] hover:bg-[#1a2f63]"
    : "bg-[color:var(--primary-color)] hover:bg-[#062a7a]";
  const supportText = isDark ? "text-slate-400" : "text-[#41518e]";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await axios.post(`${AUTH_BASE_URL}/forgot-password`, {
        email: email.trim().toLowerCase(),
      });

      setStatus({
        type: "success",
        message:
          "If an account exists for this email, password reset instructions have been sent.",
      });

      setEmail("");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "We couldn't process that request right now. Please verify your email and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${backgroundClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-md">

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`mb-6 inline-flex items-center gap-2 text-sm font-semibold transition ${
              isDark
                ? "text-[#9db8ff] hover:text-white"
                : "text-[#0033A0] hover:text-[#062a7a]"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Centered Page Heading */}
          <div className="text-center mb-10">
            <h1 className={`text-3xl font-semibold ${headingColor}`}>
              Reset your password
            </h1>
            <p className={`mt-2 text-sm ${bodyColor}`}>
              Enter your registered email and we’ll send you reset instructions.
            </p>
          </div>

          {/* Card */}
          <div
            className={`rounded-3xl border ${cardBorder} ${cardBg} p-8 shadow-2xl shadow-[#0033A0]/10 backdrop-blur`}
          >
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email input */}
              <div className="space-y-2">
                <label
                  className={`text-xs font-semibold uppercase tracking-[0.25em] ${labelColor}`}
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@bugema.ac.ug"
                    className={`w-full rounded-2xl border px-4 py-3 pl-11 text-sm transition focus:outline-none focus:ring-2 ${inputBorder} ${inputFocus}`}
                  />
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0033A0]/25 transition disabled:opacity-60 ${accentButton}`}
                style={{ "--primary-color": PRIMARY_COLOR }}
              >
                {loading ? "Sending instructions…" : "Send reset link"}
              </button>
            </form>

            {/* Bottom Link */}
            <div className="mt-6 text-center">
              <p className={`text-sm ${supportText}`}>
                Remembered your password?
              </p>
              <button
                onClick={() => navigate("/login")}
                className={`mt-3 inline-flex items-center justify-center rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  isDark
                    ? "border-slate-600 text-slate-200 hover:border-slate-400"
                    : "border-[#b8c8ff] text-[#0f2a66] hover:border-[#0033A0] hover:text-[#0033A0]"
                }`}
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
