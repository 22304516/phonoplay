"use client";

import { useEffect, useState } from "react";

type LayoutDensity = "comfortable" | "compact";
type TextSize = "normal" | "large";

export default function LayoutSelector() {
  const [density, setDensity] = useState<LayoutDensity>("comfortable");

  const [textSize, setTextSize] = useState<TextSize>("normal");

  useEffect(() => {
    const cookies = document.cookie.split("; ");

    const densityCookie = cookies.find((cookie) =>
      cookie.startsWith("layoutDensity="),
    );

    const textSizeCookie = cookies.find((cookie) =>
      cookie.startsWith("textSize="),
    );

    if (densityCookie) {
      const value = densityCookie.split("=")[1];

      if (value === "comfortable" || value === "compact") {
        setDensity(value);
      }
    }

    if (textSizeCookie) {
      const value = textSizeCookie.split("=")[1];

      if (value === "normal" || value === "large") {
        setTextSize(value);
      }
    }

    document.documentElement.dataset.layout =
      densityCookie?.split("=")[1] || "comfortable";

    document.documentElement.dataset.textSize =
      textSizeCookie?.split("=")[1] || "normal";
  }, []);

  function changeDensity(value: LayoutDensity) {
    setDensity(value);

    document.cookie = `layoutDensity=${value}; path=/; max-age=31536000`;

    document.documentElement.dataset.layout = value;
  }

  function changeTextSize(value: TextSize) {
    setTextSize(value);

    document.cookie = `textSize=${value}; path=/; max-age=31536000`;

    document.documentElement.dataset.textSize = value;
  }

  return (
    <div className="layout-settings">
      <div className="setting-group">
        <h3>Layout density</h3>

        <p>Choose how much spacing is used throughout the interface.</p>

        <div className="setting-options">
          <label>
            <input
              type="radio"
              name="layout-density"
              value="comfortable"
              checked={density === "comfortable"}
              onChange={() => changeDensity("comfortable")}
            />
            Comfortable
          </label>

          <label>
            <input
              type="radio"
              name="layout-density"
              value="compact"
              checked={density === "compact"}
              onChange={() => changeDensity("compact")}
            />
            Compact
          </label>
        </div>
      </div>

      <div className="setting-group">
        <h3>Text size</h3>

        <p>Increase text size for improved readability.</p>

        <div className="setting-options">
          <label>
            <input
              type="radio"
              name="text-size"
              value="normal"
              checked={textSize === "normal"}
              onChange={() => changeTextSize("normal")}
            />
            Normal
          </label>

          <label>
            <input
              type="radio"
              name="text-size"
              value="large"
              checked={textSize === "large"}
              onChange={() => changeTextSize("large")}
            />
            Large
          </label>
        </div>
      </div>
    </div>
  );
}
