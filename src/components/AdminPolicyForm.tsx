import React, { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  FileUp,
  Loader2,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import {
  GOVERNMENT_SOURCES,
  GovernmentSourceId,
  PERSONAS,
  POLICY_TYPES,
  Persona,
  PolicyItem,
  PolicyType,
  SECTORS,
  Sector,
} from "../types/policy";

interface AdminPolicyFormProps {
  onAddPolicy: (policy: PolicyItem) => void;
  onCancel: () => void;
}

const MAX_PDF_BYTES = 15 * 1024 * 1024;

const createEmptyPersonaImpacts = (): Record<Persona, string> =>
  PERSONAS.reduce((acc, persona) => {
    acc[persona] = "";
    return acc;
  }, {} as Record<Persona, string>);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const AdminPolicyForm: React.FC<AdminPolicyFormProps> = ({
  onAddPolicy,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rawCircularText, setRawCircularText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState<{
    fileName: string;
    sizeBytes: number;
    url: string;
    base64Data: string;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [source, setSource] = useState<GovernmentSourceId>("MNRE");
  const [sector, setSector] = useState<Sector>("Solar & Manufacturing");
  const [policyType, setPolicyType] = useState<PolicyType>("Amendment");
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [relevanceScore, setRelevanceScore] = useState<number>(92);
  const [pdfUrl, setPdfUrl] = useState("https://mnre.gov.in/");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [bullet1, setBullet1] = useState("");
  const [bullet2, setBullet2] = useState("");
  const [bullet3, setBullet3] = useState("");

  const [isAmendment, setIsAmendment] = useState(false);
  const [oldRule, setOldRule] = useState("");
  const [newRule, setNewRule] = useState("");

  const [activePersonaTab, setActivePersonaTab] = useState<Persona>(
    "Investor / Family Office"
  );
  const [personaImpacts, setPersonaImpacts] = useState<Record<Persona, string>>(
    createEmptyPersonaImpacts
  );
  const [formError, setFormError] = useState<string | null>(null);

  const processPdfFile = (file: File) => {
    setPdfUploadError(null);
    setExtractError(null);

    const isPdfMime =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfMime) {
      setPdfUploadError("Please select a valid .pdf document.");
      return;
    }

    if (file.size === 0 || file.size > MAX_PDF_BYTES) {
      setPdfUploadError("PDF file must be non-empty and smaller than 15 MB.");
      return;
    }

    setIsUploadingPdf(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = typeof reader.result === "string" ? reader.result : "";
        if (!result) {
          throw new Error("Could not read selected PDF file.");
        }

        const response = await fetch("/api/upload-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            base64Data: result,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to upload PDF.");
        }

        setUploadedPdf({
          fileName: data.fileName || file.name,
          sizeBytes: data.sizeBytes || file.size,
          url: data.pdfUrl,
          base64Data: result,
        });
        setPdfUrl(data.pdfUrl);
      } catch (err) {
        setPdfUploadError(
          err instanceof Error ? err.message : "Failed to upload PDF."
        );
      } finally {
        setIsUploadingPdf(false);
      }
    };
    reader.onerror = () => {
      setPdfUploadError("Unable to read the PDF file from disk.");
      setIsUploadingPdf(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPdfFile(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processPdfFile(file);
    }
  };

  const handleRemoveUploadedPdf = () => {
    setUploadedPdf(null);
    setPdfUrl("https://mnre.gov.in/");
    setPdfUploadError(null);
  };

  const applyExtractedPolicy = (p: Record<string, unknown>) => {
    if (typeof p.title === "string" && p.title) setTitle(p.title);
    if (
      typeof p.source === "string" &&
      GOVERNMENT_SOURCES.some((s) => s.id === p.source)
    ) {
      setSource(p.source as GovernmentSourceId);
    }
    if (typeof p.sector === "string" && SECTORS.includes(p.sector as Sector)) {
      setSector(p.sector as Sector);
    }
    if (
      typeof p.policyType === "string" &&
      POLICY_TYPES.includes(p.policyType as PolicyType)
    ) {
      setPolicyType(p.policyType as PolicyType);
    }
    if (
      typeof p.publishedDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(p.publishedDate)
    ) {
      setPublishedDate(p.publishedDate);
    }
    if (typeof p.referenceNumber === "string" && p.referenceNumber) {
      setReferenceNumber(p.referenceNumber);
    }
    if (typeof p.relevanceScore === "number") {
      setRelevanceScore(Math.min(99, Math.max(50, Math.round(p.relevanceScore))));
    }
    if (Array.isArray(p.executiveSummary)) {
      setBullet1(String(p.executiveSummary[0] ?? ""));
      setBullet2(String(p.executiveSummary[1] ?? ""));
      setBullet3(String(p.executiveSummary[2] ?? ""));
    }
    if (typeof p.isAmendment === "boolean") {
      setIsAmendment(p.isAmendment);
    }
    if (typeof p.oldRule === "string" && p.oldRule) setOldRule(p.oldRule);
    if (typeof p.newRule === "string" && p.newRule) setNewRule(p.newRule);
    if (p.personaImpacts && typeof p.personaImpacts === "object") {
      const impactsObj = p.personaImpacts as Record<string, unknown>;
      const nextImpacts = createEmptyPersonaImpacts();
      PERSONAS.forEach((persona) => {
        if (typeof impactsObj[persona] === "string") {
          nextImpacts[persona] = impactsObj[persona] as string;
        }
      });
      setPersonaImpacts(nextImpacts);
    }
  };

  const handleAutoExtract = async (mode: "pdf" | "text") => {
    setExtractError(null);

    if (mode === "pdf" && !uploadedPdf?.base64Data) {
      setExtractError("Upload a PDF document first to extract fields from it.");
      return;
    }
    if (mode === "text" && rawCircularText.trim().length < 30) {
      setExtractError(
        "Paste at least 30 characters of a government circular or press release to extract."
      );
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch("/api/analyze-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "pdf"
            ? { pdfBase64: uploadedPdf?.base64Data, fileName: uploadedPdf?.fileName }
            : { rawText: rawCircularText }
        ),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to extract policy fields.");
      }

      if (data.policy) {
        applyExtractedPolicy(data.policy);
      }
    } catch (err) {
      setExtractError(
        err instanceof Error ? err.message : "Failed to extract policy fields."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const applyActiveImpactToAll = () => {
    const activeText = personaImpacts[activePersonaTab].trim();
    if (!activeText) return;
    const updated = { ...personaImpacts };
    PERSONAS.forEach((persona) => {
      if (!updated[persona].trim()) {
        updated[persona] = activeText;
      }
    });
    setPersonaImpacts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Policy Title is required.");
      return;
    }
    if (!bullet1.trim() || !bullet2.trim() || !bullet3.trim()) {
      setFormError("Please enter all 3 Executive Summary bullet points.");
      return;
    }
    if (isAmendment && (!oldRule.trim() || !newRule.trim())) {
      setFormError(
        "Please fill both Previous Rule and New Amended Rule when Amendment tracking is enabled."
      );
      return;
    }

    const firstFilledImpact =
      PERSONAS.map((p) => personaImpacts[p].trim()).find((v) => v.length > 0) || "";

    if (!firstFilledImpact) {
      setFormError(
        "Please enter at least one Persona Impact note (you can apply it across other personas or customize each)."
      );
      return;
    }

    const normalizedImpacts = PERSONAS.reduce((acc, persona) => {
      acc[persona] = personaImpacts[persona].trim() || firstFilledImpact;
      return acc;
    }, {} as Record<Persona, string>);

    const newPolicy: PolicyItem = {
      id: `pol-custom-${Date.now()}`,
      title: title.trim(),
      source,
      sector,
      policyType,
      publishedDate: publishedDate || new Date().toISOString().slice(0, 10),
      relevanceScore: Math.min(100, Math.max(1, Number(relevanceScore) || 90)),
      pdfUrl: uploadedPdf?.url || pdfUrl.trim() || "https://mnre.gov.in/",
      uploadedPdfName: uploadedPdf?.fileName,
      uploadedPdfSize: uploadedPdf?.sizeBytes,
      referenceNumber: referenceNumber.trim() || undefined,
      executiveSummary: [bullet1.trim(), bullet2.trim(), bullet3.trim()],
      isAmendment,
      oldRule: isAmendment ? oldRule.trim() : undefined,
      newRule: isAmendment ? newRule.trim() : undefined,
      personaImpacts: normalizedImpacts,
    };

    onAddPolicy(newPolicy);
  };

  const filledPersonaCount = PERSONAS.filter(
    (p) => personaImpacts[p].trim().length > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
            Add New Policy Brief
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload an official government PDF circular or enter policy intelligence to publish directly to the live feed.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#131A29] px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Feed</span>
        </button>
      </div>

      {/* Official PDF Document Upload & AI Extractor */}
      <section className="rounded-xl border border-emerald-500/25 bg-[#131A29] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <h2 className="font-display text-sm font-semibold text-slate-100">
              Attach Official Policy PDF
            </h2>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            PDF up to 15 MB · Stored on server &amp; linked to brief
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload official policy PDF"
        />

        {!uploadedPdf ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => !isUploadingPdf && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isUploadingPdf) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-7 text-center transition-colors ${
              isDraggingOver
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-[#2A374F] bg-[#0B0F19] hover:border-emerald-500/50 hover:bg-[#0E1422]"
            }`}
          >
            {isUploadingPdf ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" aria-hidden="true" />
                <p className="mt-2.5 text-sm font-medium text-slate-200">
                  Uploading PDF document...
                </p>
              </>
            ) : (
              <>
                <FileUp className="h-6 w-6 text-emerald-400" aria-hidden="true" />
                <p className="mt-2.5 text-sm font-medium text-slate-200">
                  Drag &amp; drop a government circular PDF here, or{" "}
                  <span className="text-emerald-400 underline underline-offset-2">
                    browse files
                  </span>
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  Supports MNRE, CERC, MoP, SECI, PIB, and e-Gazette PDFs (max 15 MB)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/35 bg-emerald-500/[0.06] p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">
                  {uploadedPdf.fileName}
                </p>
                <p className="font-mono text-xs tabular-nums text-slate-400">
                  {formatFileSize(uploadedPdf.sizeBytes)} · Attached to policy brief
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={uploadedPdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#2A374F] bg-[#182235] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>Open PDF</span>
              </a>

              <button
                type="button"
                onClick={() => handleAutoExtract("pdf")}
                disabled={isExtracting}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>Reading PDF...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Auto-Fill Fields from PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRemoveUploadedPdf}
                aria-label="Remove attached PDF"
                className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-950/30 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-950/50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}

        {pdfUploadError && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
            <span>{pdfUploadError}</span>
          </div>
        )}

        {/* Secondary Text Paste AI Extractor */}
        <div className="border-t border-[#1E293B] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-300">
              Or paste circular text to auto-draft fields with AI
            </span>
          </div>
          <textarea
            rows={2}
            value={rawCircularText}
            onChange={(e) => setRawCircularText(e.target.value)}
            placeholder="Paste raw text from an MNRE circular, CERC order, PIB press release, or e-Gazette notification..."
            className="mt-2 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none"
          />

          {extractError && (
            <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>{extractError}</span>
            </div>
          )}

          <div className="mt-2.5 flex justify-end">
            <button
              type="button"
              onClick={() => handleAutoExtract("text")}
              disabled={isExtracting}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A374F] bg-[#182235] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Extract Fields from Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Policy Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-[#1E293B] bg-[#131A29] p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3">
          <FileText className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Policy Metadata &amp; Classification
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="admin-title"
              className="block text-xs font-medium text-slate-300"
            >
              Policy Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="admin-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., MNRE National Bioenergy Programme Phase-II Revision"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-source"
              className="block text-xs font-medium text-slate-300"
            >
              Government Source <span className="text-rose-400">*</span>
            </label>
            <select
              id="admin-source"
              value={source}
              onChange={(e) => setSource(e.target.value as GovernmentSourceId)}
              className="mt-1.5 h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 text-sm text-slate-100 focus:border-emerald-500/60 focus:outline-none"
            >
              {GOVERNMENT_SOURCES.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.label} — {src.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="admin-sector"
              className="block text-xs font-medium text-slate-300"
            >
              Sector <span className="text-rose-400">*</span>
            </label>
            <select
              id="admin-sector"
              value={sector}
              onChange={(e) => setSector(e.target.value as Sector)}
              className="mt-1.5 h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 text-sm text-slate-100 focus:border-emerald-500/60 focus:outline-none"
            >
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="admin-type"
              className="block text-xs font-medium text-slate-300"
            >
              Policy Type <span className="text-rose-400">*</span>
            </label>
            <select
              id="admin-type"
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value as PolicyType)}
              className="mt-1.5 h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 text-sm text-slate-100 focus:border-emerald-500/60 focus:outline-none"
            >
              {POLICY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="admin-date"
                className="block text-xs font-medium text-slate-300"
              >
                Published Date
              </label>
              <input
                id="admin-date"
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 font-mono text-xs text-slate-100 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-score"
                className="block text-xs font-medium text-slate-300"
              >
                AI Impact Score (%)
              </label>
              <input
                id="admin-score"
                type="number"
                min={1}
                max={100}
                value={relevanceScore}
                onChange={(e) => setRelevanceScore(Number(e.target.value))}
                className="mt-1.5 h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 font-mono text-xs tabular-nums text-slate-100 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-pdf"
              className="block text-xs font-medium text-slate-300"
            >
              Official PDF URL {uploadedPdf ? "(Auto-linked to uploaded PDF)" : ""}
            </label>
            <input
              id="admin-pdf"
              type="text"
              value={pdfUrl}
              readOnly={Boolean(uploadedPdf)}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://mnre.gov.in/..."
              className={`mt-1.5 h-10 w-full rounded-lg border border-[#1E293B] px-3 text-sm focus:border-emerald-500/60 focus:outline-none ${
                uploadedPdf
                  ? "bg-[#182235] font-mono text-xs text-emerald-300 cursor-not-allowed"
                  : "bg-[#0B0F19] text-slate-100 placeholder:text-slate-500"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="admin-ref"
              className="block text-xs font-medium text-slate-300"
            >
              Circular / Notification Number (Optional)
            </label>
            <input
              id="admin-ref"
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g., F. No. 320/15/2026-BIO"
              className="mt-1.5 h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none"
            />
          </div>
        </div>

        {/* 3 Executive Summary Bullets */}
        <div className="space-y-3 border-t border-[#1E293B] pt-5">
          <h3 className="font-mono text-xs font-semibold text-slate-300">
            15-Second AI Executive Summary (3 Bullets) <span className="text-rose-400">*</span>
          </h3>
          <input
            type="text"
            required
            aria-label="Executive summary bullet 1"
            value={bullet1}
            onChange={(e) => setBullet1(e.target.value)}
            placeholder="Bullet 1: Core mandate, subsidy cap, or regulatory change..."
            className="h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none"
          />
          <input
            type="text"
            required
            aria-label="Executive summary bullet 2"
            value={bullet2}
            onChange={(e) => setBullet2(e.target.value)}
            placeholder="Bullet 2: Financial, capex, tariff, or compliance impact..."
            className="h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none"
          />
          <input
            type="text"
            required
            aria-label="Executive summary bullet 3"
            value={bullet3}
            onChange={(e) => setBullet3(e.target.value)}
            placeholder="Bullet 3: Effective deadline, grandfathering clause, or next milestone..."
            className="h-10 w-full rounded-lg border border-[#1E293B] bg-[#0B0F19] px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none"
          />
        </div>

        {/* Amendment Diff Toggle & Fields */}
        <div className="space-y-4 border-t border-[#1E293B] pt-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-100">
                Is Amendment (Enable Diff Tracker)
              </span>
              <p className="text-xs text-slate-400">
                Displays side-by-side Previous Rule vs. New Amended Rule comparison on the card.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAmendment}
              onClick={() => setIsAmendment((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
                isAmendment
                  ? "border-emerald-400 bg-emerald-500"
                  : "border-[#2A374F] bg-[#0B0F19]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  isAmendment ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {isAmendment && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="admin-old-rule"
                  className="block font-mono text-xs font-medium text-rose-300"
                >
                  Previous Rule <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="admin-old-rule"
                  rows={3}
                  value={oldRule}
                  onChange={(e) => setOldRule(e.target.value)}
                  placeholder="Describe the superseded regulatory provision..."
                  className="mt-1.5 w-full rounded-lg border border-rose-500/30 bg-rose-950/15 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-new-rule"
                  className="block font-mono text-xs font-medium text-emerald-300"
                >
                  New Amended Rule <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="admin-new-rule"
                  rows={3}
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Describe the new amended regulatory requirement..."
                  className="mt-1.5 w-full rounded-lg border border-emerald-500/30 bg-emerald-950/15 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Persona Impact Notes */}
        <div className="space-y-3 border-t border-[#1E293B] pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-mono text-xs font-semibold text-slate-200">
                Persona Impact Notes ({filledPersonaCount}/8 configured)
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Select a persona tab to tailor its callout. Any empty personas inherit your primary note on submit.
              </p>
            </div>
            <button
              type="button"
              onClick={applyActiveImpactToAll}
              className="rounded-md border border-[#2A374F] bg-[#182235] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
            >
              Fill empty personas with current note
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PERSONAS.map((persona) => {
              const isSelected = activePersonaTab === persona;
              const isFilled = personaImpacts[persona].trim().length > 0;
              return (
                <button
                  key={persona}
                  type="button"
                  onClick={() => setActivePersonaTab(persona)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-medium"
                      : isFilled
                        ? "border-[#2A374F] bg-[#182235] text-slate-200"
                        : "border-[#1E293B] bg-[#0B0F19] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {persona}
                </button>
              );
            })}
          </div>

          <div>
            <label
              htmlFor="admin-persona-impact"
              className="block font-mono text-xs text-emerald-400"
            >
              Business Impact for {activePersonaTab}
            </label>
            <textarea
              id="admin-persona-impact"
              rows={3}
              value={personaImpacts[activePersonaTab]}
              onChange={(e) =>
                setPersonaImpacts((prev) => ({
                  ...prev,
                  [activePersonaTab]: e.target.value,
                }))
              }
              placeholder={`Explain the concrete IRR, capex, compliance, or strategic action for ${activePersonaTab}...`}
              className="mt-1.5 w-full rounded-lg border border-emerald-500/30 bg-[#0B0F19] p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {formError && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3.5 py-2.5 text-xs text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#1E293B] pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#1E293B] bg-transparent px-4 py-2 text-sm font-medium text-slate-300 hover:bg-[#182235] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Publish to Intelligence Feed</span>
          </button>
        </div>
      </form>
    </div>
  );
};
