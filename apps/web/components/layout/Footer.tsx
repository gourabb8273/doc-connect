import { Mail, MessageSquare, MapPin } from "lucide-react";

const HELP_EMAIL = "help@findmydoc.in";
const FEEDBACK_EMAIL = "feedback@findmydoc.in";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-zinc-900">Find Near Doctor</p>
            <p className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
              <MapPin className="w-3 h-3" />
              Mogra, West Bengal
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
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
          © {new Date().getFullYear()} Find Near Doctor
        </p>
      </div>
    </footer>
  );
}
