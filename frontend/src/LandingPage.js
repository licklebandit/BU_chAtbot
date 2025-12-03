import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Clock,
  Moon,
  Sun,
  GraduationCap,
  BookOpen,
  CalendarDays,
  MapPin,
  Wallet,
  LifeBuoy,
  CheckCircle,
  Lock,
  Menu, // New icon for mobile menu
  X, // New icon for closing mobile menu
} from "lucide-react";

import { useTheme } from "./context/ThemeContext";

const PRIMARY_COLOR = "#0033A0";

// --- Data Definitions ---

const featureCards = [
  {
    title: "Admissions guidance",
    description:
      "Navigate entry requirements, deadlines, and application status with confidence.",
    icon: GraduationCap,
  },
  {
    title: "Program information",
    description:
      "Compare faculties, majors, and course offerings tailored to your goals.",
    icon: BookOpen,
  },
  {
    title: "Timetable & exam support",
    description:
      "Stay on top of academic calendars, exam schedules, and registration windows.",
    icon: CalendarDays,
  },
  {
    title: "Campus navigation",
    description:
      "Find lecture halls, offices, cafeteria and student services wherever you are on campus.",
    icon: MapPin,
  },
  {
    title: "Fees & financial aid",
    description:
      "Understand tuition, payment plans, bursaries, and sponsorship requirements.",
    icon: Wallet,
  },
  {
    title: "Student & visitor support",
    description:
      "Get answers to your various questions about Bugema and its community.",
    icon: LifeBuoy,
  },
];

const valueHighlights = [
  "Available 24/7 with lightning-fast answers",
  "Reduces support queues for busy university teams",
  "Delivers responses sourced from approved Bugema knowledge",
  "Tailored for prospective, current, and alumni audiences",
  "Keeps every conversation contextual for seamless follow-ups",
];

const metrics = [
  { label: "Students helped", value: "2k+" },
  { label: "Avg. response time", value: "< 2s" },
  { label: "Knowledge articles", value: "150+" },
];

const quickTopics = [
  "How do I apply?",
  "What are the term dates?",
  "Where is the library?",
  "How do I access the portal?",
  "What are the housing options?",
  "Who can I talk to for wellbeing support?",
];

const howItWorks = [
  {
    step: "Ask a question",
    detail:
      "Type your admissions, academics, or campus question in natural language.",
  },
  {
    step: "AI understands your intent",
    detail:
      "Our assistant interprets the request and consults Bugema-approved sources.",
  },
  {
    step: "Get accurate answers",
    detail:
      "Receive a clear, university-approved response or a guided handoff to staff.",
  },
];

const securityHighlights = [
  "FERPA & GDPR aligned data practices",
  "Secure data handling with encrypted storage",
  "Responses sourced from university-approved knowledge",
];

const testimonials = [
  {
    quote:
      "Students finally get one consistent source of truth. Our support load dropped dramatically in the first month.",
    author: "Admissions Office",
  },
  {
    quote:
      "Trusted by thousands of learners every intake — onboarding has never been smoother.",
    author: "Student Services Team",
  },
];

const faqs = [
  {
    question: "Is the chatbot accurate?",
    answer:
      "Yes. Every response is generated from Bugema University's verified knowledge base and continuously reviewed by staff.",
  },
  {
    question: "How long is a Bachelor's Degree in Software Engineering?",
    answer:
      "This Degree is accomplished within 3 years which cover 6 semesters, an internship session and various short certificates.",
  },
  {
    question: "Can it handle admissions questions?",
    answer:
      "Absolutely. From entry requirements to application status, the chatbot provides step-by-step admissions guidance.",
  },
  {
    question: "Does it replace human staff?",
    answer:
      "No. It handles routine questions instantly and loops in advisors with full context when personal support is needed.",
  },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

// --- Component Start ---

function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  // 1. Mobile Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle function
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const themeClasses = isDark
    ? "bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] text-slate-100"
    : "bg-gradient-to-br from-[#eff4ff] via-white to-[#d9e5ff] text-slate-900";

  // --- Theme Classes (Used for styling) ---
  const cardBorder = isDark ? "border-[#1e293b]" : "border-[#d6dfff]";
  const cardBackground = isDark ? "bg-slate-900/80" : "bg-white";
  const cardShadow = isDark
    ? "shadow-lg shadow-slate-900/50"
    : "shadow-lg shadow-[#0033A0]/10";
  const overlayClass = isDark
    ? "bg-[radial-gradient(circle_at_30%_20%,_rgba(37,99,235,0.25),_transparent_60%)]"
    : "bg-[radial-gradient(circle_at_20%_20%,_rgba(0,51,160,0.16),_transparent_55%)]";
  const headerClasses = isDark
    ? "sticky top-0 z-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur"
    : "sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur";
  const navLinkClass = isDark
    ? "transition text-slate-300 hover:text-white"
    : "transition text-slate-600 hover:text-[#0033A0]";
  const headlineColor = isDark ? "text-slate-100" : "text-[#0b2254]";
  const bodyColor = isDark ? "text-slate-300" : "text-[#2d3e73]";
  const mutedColor = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-500 ${themeClasses}`}
    >
      <div className={`pointer-events-none absolute inset-0 ${overlayClass}`} />

      {/* --- Header Section --- */}
      <header className={headerClasses}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-5">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-initial">
            <img
              src={"/bot.png"}
              alt="BUchatbot logo"
              className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
            />
            <p
              className={`text-lg font-semibold truncate ${isDark ? "text-slate-100" : "text-[#102863]"}`}
            >
              BUchatbot
            </p>
          </div>

          {/* Desktop Navigation (Hidden on small screens) */}
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex lg:gap-10">
            {navLinks.map((link) => (
              <a key={link.label} className={navLinkClass} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Utility and CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1 sm:gap-2 rounded-full border px-2 sm:px-3 py-2 text-xs font-semibold backdrop-blur transition md:text-sm flex-shrink-0 ${isDark ? "border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-900" : "border-white/60 bg-white/70 text-[#0033A0] hover:bg-white"}`}
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Light mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Dark mode</span>
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/login")}
              className={`hidden rounded-full border px-4 py-2 text-sm font-medium transition md:inline-flex ${isDark ? "border-slate-700 text-slate-200 hover:border-white hover:text-white" : "border-[#b8c8ff] text-[#0f2a66] hover:border-[#0033A0] hover:text-[#0033A0]"}`}
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center gap-1 sm:gap-2 rounded-full bg-[#0033A0] px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0033A0]/30 transition hover:bg-[#062a7a] sm:px-5 flex-shrink-0"
            >
              <span className="hidden sm:inline">Get started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </button>
            {/* Mobile Menu Toggle Button (Visible on small screens) */}
            <button
              onClick={toggleMenu}
              className={`md:hidden p-2 rounded-lg transition ${isDark ? "text-slate-100 hover:bg-slate-800" : "text-[#0033A0] hover:bg-slate-100"}`}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- Mobile Navigation Drawer with Backdrop --- */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
          />

          {/* Mobile Menu */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden fixed top-[73px] left-0 right-0 w-full p-6 space-y-4 shadow-xl z-50 ${isDark ? "bg-slate-900 border-b border-slate-800" : "bg-white border-b border-slate-200"}`}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMenu}
                className={`block text-lg font-medium py-2 transition ${isDark ? "text-slate-300 hover:text-white" : "text-[#0f2a66] hover:text-[#0033A0]"}`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-dashed">
              <button
                onClick={() => {
                  closeMenu();
                  navigate("/login");
                }}
                className={`w-full rounded-full border px-4 py-2 text-sm font-medium transition ${isDark ? "border-slate-700 text-slate-200 hover:border-white hover:text-white" : "border-[#b8c8ff] text-[#0f2a66] hover:border-[#0033A0] hover:text-[#0033A0]"}`}
              >
                Log in
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* --- Main Content --- */}
      <main className="relative z-0">
        <section className="mx-auto flex max-w-6xl flex-col gap-14 px-6 pb-16 pt-20 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-7">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className={`text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl ${headlineColor}`}
            >
              Your Personal University Assistant.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className={`text-lg leading-relaxed ${bodyColor}`}
            >
              Get instant answers about admissions, registration, fees, housing,
              and campus services—all sourced from Bugema University's verified
              sources so you never get stranded, miss a deadline or update.
            </motion.p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/chatbot")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--primary-color)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0033A0]/30 transition hover:shadow-xl"
                style={{ "--primary-color": PRIMARY_COLOR }}
              >
                Start Chatting
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className={`inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition ${isDark ? "border-slate-700 text-slate-200 hover:border-white hover:text-white" : "border-[#b8c8ff] text-[#0f2a66] hover:border-[#0033A0] hover:text-[#0033A0]"}`}
              >
                Learn more
              </a>
            </div>
            <div
              className="grid gap-2 grid-cols-2 sm:grid-cols-3 pt-2"
              id="outcomes"
            >
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className={`rounded-2xl border ${isDark ? "border-slate-800 bg-slate-900/60" : "border-[#d7e1ff] bg-white/80"} px-4 py-3 shadow-sm`}
                >
                  <p
                    className={`text-2xl font-semibold ${isDark ? "text-white" : "text-[#0b2254]"}`}
                  >
                    {metric.value}
                  </p>
                  <p
                    className={`text-sm ${isDark ? "text-slate-400" : "text-[#4f5e92]"}`}
                  >
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
            <div
              className={`rounded-3xl border p-6 shadow-lg shadow-[#0033A0]/10 ${isDark ? "border-slate-800 bg-slate-900/70" : "border-[#becdff] bg-white/90"}`}
            >
              <p
                className={`text-xs uppercase tracking-[0.25em] ${isDark ? "text-slate-300" : "text-[#4a5aa6]"}`}
              >
                Popular topics
              </p>
              <div className="mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2">
                {quickTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() =>
                      navigate("/chatbot", { state: { prompt: topic } })
                    }
                    className={`w-full rounded-2xl border px-4 py-2 text-left text-sm font-medium transition ${isDark ? "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-white hover:text-white" : "border-[#d6dfff] bg-white text-[#0f2a66] hover:border-[#0033A0] hover:text-[#0033A0]"}`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-1 justify-center"
          >
            <div
              className={`w-full max-w-sm sm:max-w-lg rounded-3xl border p-6 shadow-xl ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white"}`}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <p
                      className={`text-xs uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-[#4a5aa6]"}`}
                    >
                      BUchatbot
                    </p>
                    <p
                      className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-[#0b2254]"}`}
                    >
                      Here to help 24/7
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}
                >
                  Secure
                </span>
              </div>
              <div>
                <p
                  className={`text-xs uppercase tracking-[0.3em] ${mutedColor}`}
                >
                  Preview
                </p>
                <p className={`mt-2 text-lg font-semibold ${headlineColor}`}>
                  Chat transcript
                </p>
              </div>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="space-y-2">
                  <p className={`font-semibold ${headlineColor}`}>Student</p>
                  <p>How do I get tuition assistance in Bugema university?</p>
                </div>
                <div
                  className={`space-y-2 rounded-2xl p-4 ${isDark ? "bg-slate-800/80" : "bg-slate-50"}`}
                >
                  <p className={`font-semibold ${headlineColor}`}>BUchatbot</p>
                  <p>
                    You can apply for various bursaries offered by the
                    university or join work program. Through the university's
                    work program office, students get chance to work in their
                    desired fields and get paid through their student accounts.
                    You can as well get other private sponsorships to help you
                    raise the required tuition. For any inquiries, please make
                    an on-campus research to get more specified information.
                  </p>
                </div>
                <div
                  className={`rounded-2xl p-4 ${isDark ? "bg-slate-800" : "bg-slate-900 text-white"}`}
                >
                  <p
                    className={`text-xs uppercase tracking-[0.3em] ${isDark ? "text-slate-300" : "text-white/60"}`}
                  >
                    Admin insight
                  </p>
                  <p className="mt-2 text-sm">
                    This response was approved by the university's Quality
                    Assurance office on Oct 18 and is tracked for follow-up.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section
          id="features"
          className={`border-t py-16 ${isDark ? "border-slate-800 bg-slate-950/60" : "border-white/60 bg-white/95"}`}
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-4 text-center">
              <p
                className={`text-xs uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-[#4a5aa6]"}`}
              >
                What BUchatbot covers
              </p>
              <h2
                className={`text-3xl font-semibold sm:text-4xl ${headlineColor}`}
              >
                Everything students ask about most
              </h2>
              <p className={`mx-auto max-w-2xl text-base ${bodyColor}`}>
                From admissions and academics to wellbeing and campus logistics,
                every topic is grounded in accurate university knowledge for
                confident decision-making.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map(({ title, description, icon: Icon }) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35 }}
                  className={`flex h-full flex-col gap-4 rounded-2xl border p-6 transition ${isDark ? "border-slate-800 bg-slate-900/70 hover:bg-slate-900" : "border-[#d6dfff] bg-white hover:border-[#b5c6ff]"}`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${isDark ? "bg-[#0033A0]/30 text-[#9db8ff]" : "bg-[#0033A0] text-white"}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`text-lg font-semibold ${headlineColor}`}>
                    {title}
                  </h3>
                  <p className={`text-sm leading-6 ${bodyColor}`}>
                    {description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="value" className="mx-auto max-w-6xl px-6 py-16">
          <div
            className={`rounded-3xl border p-8 shadow-2xl backdrop-blur ${isDark ? "border-slate-800 bg-slate-900/70" : "border-[#becdff] bg-white/95 shadow-[#0033A0]/10"}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <p
                  className={`text-xs uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-[#4a5aa6]"}`}
                >
                  Why it matters
                </p>
                <h2
                  className={`text-3xl font-semibold sm:text-4xl ${headlineColor}`}
                >
                  Designed to lighten your support load
                </h2>
                <p className={`mx-auto max-w-2xl text-base ${bodyColor}`}>
                  Students receive immediate clarity, while staff gain time to
                  focus on the high-touch conversations that matter most.
                </p>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {valueHighlights.map((item) => (
                  <div
                    key={item}
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${isDark ? "border-slate-800 bg-slate-900/60" : "border-[#d6dfff] bg-white"}`}
                  >
                    <CheckCircle
                      className={`mt-1 h-4 w-4 ${isDark ? "text-[#97b5ff]" : "text-[#0033A0]"}`}
                    />
                    <p className={`text-sm ${bodyColor}`}>{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
          <div
            className={`rounded-3xl border p-8 shadow-2xl backdrop-blur ${isDark ? "border-slate-800 bg-slate-900/70" : "border-[#becdff] bg-white/95 shadow-[#0033A0]/10"}`}
          >
            <div className="flex flex-col gap-6 text-center">
              <p
                className={`text-xs uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-[#4a5aa6]"}`}
              >
                How it works
              </p>
              <h2
                className={`text-3xl font-semibold sm:text-4xl ${headlineColor}`}
              >
                Get answers in three easy steps
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {howItWorks.map(({ step, detail }, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className={`flex flex-col gap-3 rounded-2xl border p-6 text-left ${isDark ? "border-slate-800 bg-slate-900/70" : "border-[#d6dfff] bg-white"}`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isDark ? "bg-[#0033A0]/30 text-[#a5befc]" : "bg-[#0033A0]/10 text-[#0033A0]"}`}
                    >
                      {index + 1}
                    </span>
                    <h3 className={`text-base font-semibold ${headlineColor}`}>
                      {step}
                    </h3>
                    <p className={`text-sm leading-6 ${bodyColor}`}>{detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div
              className={`rounded-3xl border p-8 shadow-lg ${isDark ? "border-slate-800 bg-slate-900/70" : "border-[#d6dfff] bg-white"}`}
            >
              <h3 className={`text-lg font-semibold ${headlineColor}`}>
                Security, privacy & reliability
              </h3>
              <p className={`mt-2 text-sm leading-6 ${bodyColor}`}>
                Built with university compliance in mind. Every interaction
                follows Bugema University's governance for data protection and
                information accuracy.
              </p>
              <div className="mt-4 space-y-3">
                {securityHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Lock
                      className={`mt-1 h-4 w-4 ${isDark ? "text-[#98b4ff]" : "text-[#0033A0]"}`}
                    />
                    <p className={`text-sm ${bodyColor}`}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`rounded-3xl border p-8 shadow-lg ${isDark ? "border-slate-800 bg-slate-900/70" : "border-[#d6dfff] bg-white"}`}
            >
              <h3 className={`text-lg font-semibold ${headlineColor}`}>
                Need human help?
              </h3>
              <p className={`mt-3 text-sm leading-6 ${bodyColor}`}>
                The Student Support Desk is available if you need more personal
                assistance.
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <p className={`${headlineColor}`}>
                  Email:{" "}
                  <span className="font-semibold">support@bugema.ac.ug</span>
                </p>
                <p className={`${headlineColor}`}>
                  Phone: <span className="font-semibold">+256 123 456 789</span>
                </p>
                <p className={`${mutedColor}`}>Monday–Friday · 8am–5pm EAT</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div
            className={`rounded-3xl border p-8 shadow-xl ${isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}
          >
            <div className="flex flex-col gap-6 text-center">
              <p className={`text-xs uppercase tracking-[0.3em] ${mutedColor}`}>
                Testimonials
              </p>
              {testimonials.map((item) => (
                <blockquote key={item.author} className="space-y-6">
                  <p
                    className={`text-2xl font-semibold leading-relaxed ${headlineColor}`}
                  >
                    “{item.quote}”
                  </p>
                  <footer className={`text-sm font-medium ${mutedColor}`}>
                    — {item.author}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-6 pb-16">
          <div
            className={`rounded-3xl border p-8 shadow-lg ${isDark ? "border-slate-800 bg-slate-900/70" : "border-[#d6dfff] bg-white"}`}
          >
            <div className="space-y-4">
              <p
                className={`text-xs uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-[#4a5aa6]"}`}
              >
                FAQ
              </p>
              <h2 className={`text-3xl font-semibold ${headlineColor}`}>
                Answers to common questions
              </h2>
            </div>
            <div className="mt-6 space-y-4">
              {faqs.map(({ question, answer }) => (
                <details
                  key={question}
                  className={`group rounded-2xl border p-4 transition ${isDark ? "border-slate-800 bg-slate-900/60" : "border-[#d6dfff] bg-white"}`}
                >
                  <summary
                    className={`flex cursor-pointer items-center justify-between text-sm font-semibold ${headlineColor}`}
                  >
                    {question}
                    <span className="text-xs font-normal text-slate-400 group-open:hidden">
                      +
                    </span>
                    <span className="hidden text-xs font-normal text-slate-400 group-open:inline">
                      −
                    </span>
                  </summary>
                  <p className={`mt-3 text-sm leading-6 ${bodyColor}`}>
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer
          className={`border-t px-6 py-10 ${isDark ? "border-slate-800 bg-slate-950/70" : "border-white/60 bg-white/95"}`}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img
                src={"/bot.png"}
                alt="BUchatbot logo"
                className="h-10 w-10 rounded-xl object-cover"
              />
              <div className="space-y-1">
                <p className={`text-lg font-semibold ${headlineColor}`}>
                  BUchatbot
                </p>
                <p className={`text-xs ${mutedColor}`}>
                  Conversational support for every student journey.
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-center md:text-right">
              <p className={`${mutedColor}`}>
                Need help? Email{" "}
                <a
                  href="mailto:support@bugema.ac.ug"
                  className={`font-semibold ${isDark ? "text-slate-200" : "text-[#102863]"}`}
                >
                  support@bugema.ac.ug
                </a>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
                <a
                  href="/privacy"
                  className={`text-sm font-semibold transition ${isDark ? "text-[#9db8ff] hover:text-white" : "text-[#0033A0] hover:text-[#062a7a]"}`}
                >
                  Privacy policy
                </a>
                <a
                  href="/chatbot"
                  className={`text-sm font-semibold transition ${isDark ? "text-[#9db8ff] hover:text-white" : "text-[#0033A0] hover:text-[#062a7a]"}`}
                >
                  Launch assistant
                </a>
              </div>
              <p className={`text-xs ${mutedColor}`}>
                © {new Date().getFullYear()} BUchatbot. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;
