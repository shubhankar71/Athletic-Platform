import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import "./ThemeToggle.css";

export default function ThemeToggle({ className = "", compact = false }) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        className={`theme-toggle-btn ${className}`}
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? (
          <>
            <Sun size={15} className="theme-icon sun" />
            <span className="theme-toggle-btn__label">Light</span>
          </>
        ) : (
          <>
            <Moon size={15} className="theme-icon moon" />
            <span className="theme-toggle-btn__label">Dark</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`theme-toggle-segmented ${className}`} role="radiogroup" aria-label="Theme mode switcher">
      <button
        type="button"
        role="radio"
        aria-checked={!isDark}
        className={`theme-toggle-option ${!isDark ? "active" : ""}`}
        onClick={() => setTheme("light")}
        title="Switch to Light Mode"
      >
        <Sun size={14} className="theme-icon sun" />
        <span>Light</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={isDark}
        className={`theme-toggle-option ${isDark ? "active" : ""}`}
        onClick={() => setTheme("dark")}
        title="Switch to Dark Mode"
      >
        <Moon size={14} className="theme-icon moon" />
        <span>Dark</span>
      </button>
    </div>
  );
}
