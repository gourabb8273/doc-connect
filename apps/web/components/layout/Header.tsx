"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Stethoscope, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRole, clearAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { Role } from "@/lib/auth";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    setRole(getRole());
  }, [pathname]);

  const isDoctorArea =
    pathname.startsWith("/doctor/") || pathname === "/doctor";
  const isAdminArea = pathname.startsWith("/admin");

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center shadow-md shadow-brand/25 group-hover:shadow-brand/40 transition-shadow">
            <Stethoscope className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-zinc-900 text-[15px] tracking-tight">
              FindMyDoc
            </span>
            <span className="text-[10px] font-medium text-zinc-400 tracking-wide">
              verified care
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5">
          {isAdminArea ? (
            <>
              <span className="text-xs font-semibold text-zinc-500 px-2.5 py-1 bg-zinc-100 rounded-lg">
                Admin
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : isDoctorArea && role === "doctor" ? (
            <>
              {[
                { href: "/doctor/dashboard", label: "Dashboard" },
                { href: "/doctor/profile", label: "Profile" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-sm font-semibold px-3.5 py-2 rounded-xl transition-all",
                    pathname === href
                      ? "text-brand bg-brand-light"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  )}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link
              href="/doctor/login"
              className="text-sm font-bold px-5 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-dark shadow-md shadow-brand/20 hover:shadow-brand/30 transition-all"
            >
              Join as Doctor
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
