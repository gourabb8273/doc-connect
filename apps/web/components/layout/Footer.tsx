import { Mail, MessageSquare, MapPin } from "lucide-react";

const HELP_EMAIL = "help@findmydoc.in";
const FEEDBACK_EMAIL = "feedback@findmydoc.in";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Vision */}
          <div className="max-w-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2">
              Vision
            </p>
            <blockquote>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Finding a doctor should not mean calling around or showing up blind.
                Prescriptions get lost, doctors change days, clinics move. FindMyDoc
                connects patients and doctors directly so you get real time status, date,
                and timings straight from the doctor. More accurate when it matters,
                especially in an emergency. I built this after facing that challenge
                myself.
              </p>
              <cite className="block mt-2 text-xs font-bold text-zinc-900 not-italic">
                Gourab Banerjee
              </cite>
            </blockquote>
            <p className="flex items-center gap-1 text-[11px] text-zinc-400 mt-3">
              <MapPin className="w-3 h-3" />
              Mogra, West Bengal
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-4 lg:items-end shrink-0">
            <a
              href={`mailto:${HELP_EMAIL}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-brand transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-brand" strokeWidth={2.5} />
              {HELP_EMAIL}
            </a>
            <a
              href={`mailto:${FEEDBACK_EMAIL}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-brand transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand" strokeWidth={2.5} />
              {FEEDBACK_EMAIL}
            </a>
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 mt-6 pt-4 border-t border-zinc-100">
          © {new Date().getFullYear()} FindMyDoc
        </p>
      </div>
    </footer>
  );
}
