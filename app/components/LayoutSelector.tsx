"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = document.cookie
      .split("; ")
      .find((row) => row.startsWith("theme="))
      ?.split("=")[1] as Theme | undefined;

    const initialTheme =
      savedTheme === "dark" || savedTheme === "light" ? savedTheme : "light";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  function changeTheme(newTheme: Theme) {
    setTheme(newTheme);

    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`;

    document.documentElement.setAttribute("data-theme", newTheme);
  }

  return (
    <div className="theme-selector">
      <h2>Appearance</h2>

      <p>Choose the appearance of the PhonoPlay interface.</p>

      <div className="theme-options">
        <button
          className={theme === "light" ? "active" : ""}
          onClick={() => changeTheme("light")}
        >
          Light Mode
        </button>

        <button
          className={theme === "dark" ? "active" : ""}
          onClick={() => changeTheme("dark")}
        >
          Dark Mode
        </button>
      </div>

      <p className="setting-status">
        Current theme: <strong>{theme}</strong>
      </p>
    </div>
  );
}
