import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <div>
        <Link href="/">PhonoPlay</Link>
      </div>

      <div>
        <Link href="/">Home</Link>
        <Link href="/wordle">Wordle</Link>
        <Link href="/word-search">Word Search</Link>
        <Link href="/about">About</Link>
        <Link href="/settings">Settings</Link>
      </div>
    </nav>
  );
}