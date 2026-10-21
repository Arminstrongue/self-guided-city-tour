import Link from "next/link";
export default function NotFound() {
  return (
    <main className="app"><div className="stack" style={{ paddingTop: 40 }}>
      <h1>404</h1><Link className="btn ghost" href="/">HelloTravell</Link>
    </div></main>
  );
}
