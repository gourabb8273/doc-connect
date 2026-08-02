"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { setRole } from "@/lib/auth";

type Step = "phone" | "otp";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate OTP send
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1200);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate verification — for demo treat 123456 as valid
    setTimeout(() => {
      setLoading(false);
      if (otp === "123456") {
        setRole("doctor");
        router.push("/doctor/onboarding");
      } else {
        setError("Incorrect OTP. Use 123456 in demo mode.");
      }
    }, 1200);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Join Find Near Doctor
          </h1>
          <p className="text-slate-500 text-sm text-center mt-1.5 max-w-xs">
            List your practice. We manually verify every doctor before your
            profile goes live.
          </p>
        </div>

        {/* Trust line */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span className="text-xs text-slate-500">
            WBMC registration verified by our team
          </span>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile number
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98300 XXXXX"
                    className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send OTP <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Enter OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Change number
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Sent to +91-{phone} (demo: use 123456)
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit OTP"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg tracking-widest font-mono"
                />
                {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Verify & Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Already registered?{" "}
          <a href="/doctor/dashboard" className="text-indigo-600 hover:underline">
            Go to dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
