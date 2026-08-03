"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { setRole } from "@/lib/auth";
import { apiPost } from "@/lib/api/client";

type Step = "phone" | "otp";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpWarning, setOtpWarning] = useState("");

  async function sendOtpToPhone() {
    const fullPhone = `+91${phone}`;
    const res = await apiPost<{ ok: boolean; warning?: string }>(
      "/api/auth/doctor/otp/send",
      {
        phone: fullPhone,
        purpose: "doctor_signup",
      }
    );
    setOtpWarning(res.warning ?? "");
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendOtpToPhone();
      setStep("otp");
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      await sendOtpToPhone();
      setResendCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const res = await apiPost<{
        ok: boolean;
        doctorId: string | null;
        hasProfile: boolean;
        status: string | null;
      }>("/api/auth/doctor/otp/verify", {
        phone: fullPhone,
        code: otp,
        purpose: "doctor_signup",
      });

      setRole("doctor");

      if (res.hasProfile && res.status === "verified") {
        router.push("/doctor/dashboard");
      } else if (res.hasProfile && res.status === "pending") {
        router.push("/doctor/dashboard");
      } else if (res.hasProfile && res.status === "rejected") {
        router.push("/doctor/onboarding");
      } else {
        router.push("/doctor/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
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

        <div className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span className="text-xs text-slate-500">
            WBMC registration verified by our team
          </span>
        </div>

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
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Change number
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Sent to +91-{phone}. SMS can take up to 30 seconds.
                </p>
                {otpWarning && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 mb-3 leading-relaxed">
                    {otpWarning}
                  </p>
                )}
                <p className="text-xs text-amber-700/90 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2 mb-3 leading-relaxed">
                  No SMS? Check spam, then MSG91 dashboard → <strong>Logs</strong> (delivery may fail if wallet is empty or DLT template is not set). Top up wallet and map your OTP widget SMS template.
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
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 disabled:text-slate-400"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                </button>
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
