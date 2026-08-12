"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
        <div className="navbar-brand">
        <Link href="/" onClick={closeMenu}>
            PhonoPlay
        </Link>

        <span>Assessment 1</span>
        </div>

        <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={
            menuOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={menuOpen}
        aria-controls="navigation-menu"
        >
        {menuOpen ? "✕" : "☰"}
        </button>

      <div
        id="navigation-menu"
        className={`navigation-links ${
          menuOpen ? "navigation-open" : ""
        }`}
      >
        <Link href="/" onClick={closeMenu}>
          Home
        </Link>

        <Link href="/wordle" onClick={closeMenu}>
          Wordle
        </Link>

        <Link href="/word-search" onClick={closeMenu}>
          Word Search
        </Link>

        <Link href="/about" onClick={closeMenu}>
          About
        </Link>

        <Link href="/settings" onClick={closeMenu}>
          Settings
        </Link>
      </div>
    </nav>
  );
}