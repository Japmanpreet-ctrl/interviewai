import React from "react";
import { HiMiniMoon, HiMiniSun } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800 ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <HiMiniSun size={16} /> : <HiMiniMoon size={16} />}
      {isDark ? "Light" : "Dark"}
    </button>
  );
}

export default ThemeToggle;
