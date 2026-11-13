import React, { useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  GitCompare,
  X,
} from "lucide-react";
import { Persona, PolicyItem } from "../types/policy";

interface PolicyCardProps {
  policy: PolicyItem;
  selectedPersona: Persona;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onCopyBrief: (policy: PolicyItem) => void;
}

function formatDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  selectedPersona,
  isBookmarked,
  onToggleBookmark,
  onCopyBrief,
}) => {
  const [diffExpanded, setDiffExpanded] = useState(true);
  const [justCopied, setJustCopied] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  const handleCopy = () => {
    onCopyBrief(policy);
    setJustCopied(true);
    window.setTimeout(() => setJustCopied(false), 1800);
  };

  const impactColor =
    policy.relevanceScore >= 94
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : "text-amber-300 border-amber-500/30 bg-amber-500/10";

  const hasUploadedPdf = Boolean(policy.uploadedPdfName) || policy.pdfUrl.startsWith("/api/pdfs/");

  return (
    <article className="rounded-xl border border-[#1E293B] bg-[#131A29] p-5 sm:p-6 transition-colors hover:border-[#2A3952]">
      {/* Top Row: Source, Sector, Policy Type, Published Date, AI Relevance Score */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#1E293B]">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
          <span className="rounded-[4px] border border-[#2A374F] bg-[#1A2438] px-2 py-0.5 font-mono font-semibold text-slate-100 whitespace-nowrap">
            {policy.source}
          </span>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="font-medium text-slate-300 whitespace-nowrap">{policy.sector}</span>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <span
            className={`font-mono whitespace-nowrap ${
              policy.policyType === "Amendment" ? "text-amber-300" : "text-slate-300"
            }`}
          >
            {policy.policyType}
          </span>
          {policy.referenceNumber && (
            <>
              <span className="hidden text-slate-600 sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="hidden font-mono text-[11px] text-slate-500 sm:inline">
                {policy.referenceNumber}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <time
            dateTime={policy.publishedDate}
            className="font-mono text-xs tabular-nums text-slate-400 whitespace-nowrap"
          >
            {formatDate(policy.publishedDate)}
          </time>
          <span
            className={`rounded-[4px] border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums whitespace-nowrap ${impactColor}`}
          >
            {policy.relevanceScore}% Impact
          </span>
        </div>
      </div>

      {/* Policy Title */}
      <h2 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight text-slate-50 text-balance sm:text-xl">
        {policy.title}
      </h2>

      {/* 15-Second AI Executive Summary */}
      <div className="mt-4">
        <h3 className="font-mono text-xs font-medium tracking-wide text-slate-400">
          15-Second AI Executive Summary
        </h3>
        <ul className="mt-2.5 space-y-2">
          {policy.executiveSummary.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-300">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-[2px] bg-emerald-400/80"
                aria-hidden="true"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Amendment Diff Tracker (Only for Amendments) */}
      {policy.isAmendment && (policy.oldRule || policy.newRule) && (
        <div className="mt-5 pt-4 border-t border-[#1E293B]">
          <button
            type="button"
            onClick={() => setDiffExpanded((prev) => !prev)}
            aria-expanded={diffExpanded}
            className="flex w-full items-center justify-between text-left text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2 font-mono">
              <GitCompare className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              <span>Amendment Diff Tracker</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <span>{diffExpanded ? "Collapse" : "Expand"}</span>
              {diffExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </span>
          </button>

          {diffExpanded && (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-rose-500/25 bg-rose-950/20 p-3.5">
                <div className="font-mono text-[11px] font-semibold text-rose-300">
                  Previous Rule
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                  {policy.oldRule}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/20 p-3.5">
                <div className="font-mono text-[11px] font-semibold text-emerald-300">
                  New Amended Rule
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                  {policy.newRule}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tailored Impact Callout for Selected Persona */}
      <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
        <div className="font-mono text-xs font-semibold text-emerald-400">
          Tailored Impact for {selectedPersona}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
          {policy.personaImpacts[selectedPersona]}
        </p>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1E293B]">
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={policy.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#2A374F] bg-[#182235] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>View Official Govt PDF</span>
          </a>

          {hasUploadedPdf && (
            <button
              type="button"
              onClick={() => setPdfPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="max-w-[160px] truncate">
                Preview {policy.uploadedPdfName || "PDF"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2A374F] bg-[#182235] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-500/50 hover:text-emerald-300 whitespace-nowrap"
          >
            {justCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                <span className="text-emerald-300">Copied Brief</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>Copy Boardroom Brief</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onToggleBookmark(policy.id)}
          aria-pressed={isBookmarked}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
            isBookmarked
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : "border-[#1E293B] bg-transparent text-slate-400 hover:border-[#2A374F] hover:text-slate-200"
          }`}
        >
          <Bookmark
            className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`}
            aria-hidden="true"
          />
          <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
        </button>
      </div>

      {/* Inline Uploaded PDF Preview Modal */}
      {pdfPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`PDF Preview: ${policy.uploadedPdfName || policy.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#1E293B] bg-[#131A29] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#1E293B] px-5 py-3.5">
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-semibold text-slate-100">
                  {policy.uploadedPdfName || policy.title}
                </h3>
                <p className="font-mono text-[11px] text-slate-400">
                  {policy.source} · {policy.sector}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={policy.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A374F] bg-[#182235] px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPdfPreviewOpen(false)}
                  aria-label="Close PDF preview"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E293B] text-slate-400 hover:bg-[#182235] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <iframe
              src={policy.pdfUrl}
              title={policy.uploadedPdfName || policy.title}
              className="h-full w-full flex-1 bg-[#0B0F19]"
            />
          </div>
        </div>
      )}
    </article>
  );
};

