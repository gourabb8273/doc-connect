"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Users,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import { setRole } from "@/lib/auth";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Review pending doctors",
    desc: "Check registration, council number, and clinic details.",
  },
  {
    icon: CheckCircle2,
    title: "Approve or reject",
    desc: "Approved profiles go live in patient search. Rejected doctors get notified.",
  },
  {
    icon: Users,
    title: "Manage all listings",
    desc: "View verified doctors and keep the directory accurate.",
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      if (email === "admin@findmydoc.in" && pass === "admin123") {
        setRole("admin");
        router.push("/admin/verifications");
      } else {
        setError("Invalid email or password.");
      }
    }, 800);
  }

  return (
    <div className="min-h-[80vh] bg-zinc-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to FindMyDoc
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: what admin does */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                  Admin portal
                </h1>
                <p className="text-sm text-zinc-500">Verification team access only</p>
              </div>
            </div>

            <p className="text-sm text-zinc-600 leading-relaxed mb-8 max-w-md">
              Sign in to review doctor registrations, verify council credentials, and
              approve profiles before they appear in patient search.
            </p>

            <div className="space-y-4">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="flex gap-4 p-4 bg-white rounded-2xl border border-zinc-100">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-zinc-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      {i + 1}. {title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: login form */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Sign in</h2>
            <p className="text-xs text-zinc-500 mb-6">
              Use your FindMyDoc admin credentials
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@findmydoc.in"
                  required
                  className="w-full px-4 py-3 text-sm text-zinc-900 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 text-sm text-zinc-900 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Sign in to admin
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-zinc-400 mt-6 text-center leading-relaxed">
              Demo: admin@findmydoc.in / admin123
              <br />
              Need access? Write to{" "}
              <a href="mailto:help@findmydoc.in" className="text-brand hover:underline">
                help@findmydoc.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
