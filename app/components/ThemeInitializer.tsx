"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    const savedTheme = document.cookie
      .split("; ")
      .find((row) => row.startsWith("theme="))
      ?.split("=")[1];

    const theme = savedTheme === "dark" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return null;
}
