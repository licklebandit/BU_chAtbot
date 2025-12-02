import React from "react";

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 focus-visible:ring-blue-400",
  secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-300",
  accent: "bg-slate-900 text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800 focus-visible:ring-slate-900",
  outline: "border border-blue-300 text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-300",
  ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200",
  danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
  icon: "p-2",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText = "Processing…",
  ...props
}) {
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}
