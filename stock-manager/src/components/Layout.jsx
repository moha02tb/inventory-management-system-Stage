import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="relative min-h-screen bg-slate-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.14),transparent_32%)]" />
        <div className="absolute inset-10 rounded-3xl border border-white/50 bg-white/30 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur" />
      </div>
      <Navbar />
      <main className="relative max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
