import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Bookmark, FileSearch, Plus, RotateCcw } from "lucide-react";
import { AdminPolicyForm } from "./components/AdminPolicyForm";
import { Header } from "./components/Header";
import { PolicyCard } from "./components/PolicyCard";
import { Sidebar } from "./components/Sidebar";
import { Toast } from "./components/Toast";
import { INITIAL_POLICIES } from "./data/initialPolicies";
import {
  ActiveView,
  GOVERNMENT_SOURCES,
  GovernmentSourceId,
  PERSONAS,
  POLICY_TYPES,
  Persona,
  PolicyItem,
  PolicyType,
  SECTORS,
  Sector,
  SortOrder,
} from "./types/policy";

const STORAGE_KEYS = {
  POLICIES: "wolf_insights_policies_v1",
  BOOKMARKS: "wolf_insights_bookmarks_v1",
  PERSONA: "wolf_insights_persona_v1",
};

function loadStoredPolicies(): PolicyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POLICIES);
    if (!raw) return INITIAL_POLICIES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_POLICIES;
  } catch {
    return INITIAL_POLICIES;
  }
}

function loadStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadStoredPersona(): Persona {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONA) as Persona | null;
    if (raw && PERSONAS.includes(raw)) {
      return raw;
    }
    return "Investor / Family Office";
  } catch {
    return "Investor / Family Office";
  }
}

export default function App() {
  const [policies, setPolicies] = useState<PolicyItem[]>(loadStoredPolicies);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(loadStoredBookmarks);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(loadStoredPersona);

  const [activeView, setActiveView] = useState<ActiveView>("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState<GovernmentSourceId[]>([]);
  const [selectedSector, setSelectedSector] = useState<Sector | "ALL">("ALL");
  const [selectedPolicyType, setSelectedPolicyType] = useState<PolicyType | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
    } catch {
      // Ignore storage quota errors
    }
  }, [policies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PERSONA, selectedPersona);
    } catch {
      // Ignore storage quota errors
    }
  }, [selectedPersona]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/") return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleToggleSource = (source: GovernmentSourceId | "ALL") => {
    if (source === "ALL") {
      setSelectedSources([]);
      return;
    }
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((item) => item !== source) : [...prev, source]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSources([]);
    setSelectedSector("ALL");
    setSelectedPolicyType("ALL");
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? "Removed from Bookmarked Briefs" : "Saved to Bookmarked Briefs");
      return next;
    });
  };

  const handleCopyBrief = async (policy: PolicyItem) => {
    const diffSection =
      policy.isAmendment && (policy.oldRule || policy.newRule)
        ? `\nAMENDMENT DIFF:\n- Previous Rule: ${policy.oldRule}\n- New Amended Rule: ${policy.newRule}\n`
        : "";

    const formattedBrief = `WOLF INSIGHTS — EXECUTIVE POLICY BRIEF
Title: ${policy.title}
Source: ${policy.source} | Sector: ${policy.sector} | Type: ${policy.policyType}
Published: ${policy.publishedDate} | AI Impact Score: ${policy.relevanceScore}%

15-SECOND AI EXECUTIVE SUMMARY:
• ${policy.executiveSummary[0]}
• ${policy.executiveSummary[1]}
• ${policy.executiveSummary[2]}
${diffSection}
TAILORED IMPACT (${selectedPersona.toUpperCase()}):
${policy.personaImpacts[selectedPersona]}

Official Source: ${policy.pdfUrl}`;

    try {
      await navigator.clipboard.writeText(formattedBrief);
      showToast(`Boardroom brief copied for ${selectedPersona}`);
    } catch {
      showToast("Brief formatted (clipboard permission unavailable)");
    }
  };

  const handleAddPolicy = (newPolicy: PolicyItem) => {
    setPolicies((prev) => [newPolicy, ...prev]);
    handleResetFilters();
    setActiveView("feed");
    showToast("New policy published to the live intelligence feed");
  };

  // Facet counts computed across all policies
  const sourceCounts = useMemo(() => {
    const counts = {} as Record<GovernmentSourceId, number>;
    GOVERNMENT_SOURCES.forEach((s) => {
      counts[s.id] = 0;
    });
    policies.forEach((p) => {
      counts[p.source] = (counts[p.source] ?? 0) + 1;
    });
    return counts;
  }, [policies]);

  const sectorCounts = useMemo(() => {
    const counts = {} as Record<Sector, number>;
    SECTORS.forEach((s) => {
      counts[s] = 0;
    });
    policies.forEach((p) => {
      counts[p.sector] = (counts[p.sector] ?? 0) + 1;
    });
    return counts;
  }, [policies]);

  const typeCounts = useMemo(() => {
    const counts = {} as Record<PolicyType, number>;
    POLICY_TYPES.forEach((t) => {
      counts[t] = 0;
    });
    policies.forEach((p) => {
      counts[p.policyType] = (counts[p.policyType] ?? 0) + 1;
    });
    return counts;
  }, [policies]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedSources.length > 0 ||
    selectedSector !== "ALL" ||
    selectedPolicyType !== "ALL";

  const filteredPolicies = useMemo(() => {
    const queryTokens = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const matching = policies.filter((policy) => {
      if (activeView === "bookmarks" && !bookmarkedIds.includes(policy.id)) {
        return false;
      }
      if (selectedSources.length > 0 && !selectedSources.includes(policy.source)) {
        return false;
      }
      if (selectedSector !== "ALL" && policy.sector !== selectedSector) {
        return false;
      }
      if (selectedPolicyType !== "ALL" && policy.policyType !== selectedPolicyType) {
        return false;
      }

      if (queryTokens.length > 0) {
        const searchableBlob = [
          policy.title,
          policy.source,
          policy.sector,
          policy.policyType,
          policy.referenceNumber ?? "",
          ...policy.executiveSummary,
          policy.oldRule ?? "",
          policy.newRule ?? "",
          ...Object.values(policy.personaImpacts),
        ]
          .join(" ")
          .toLowerCase();

        return queryTokens.every((token) => searchableBlob.includes(token));
      }

      return true;
    });

    return [...matching].sort((a, b) => {
      if (sortOrder === "impact") {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.publishedDate.localeCompare(a.publishedDate);
    });
  }, [
    policies,
    activeView,
    bookmarkedIds,
    selectedSources,
    selectedSector,
    selectedPolicyType,
    searchQuery,
    sortOrder,
  ]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100">
      <Header
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          if (activeView === "admin") setActiveView("feed");
        }}
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        searchInputRef={searchInputRef}
      />

      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          selectedSources={selectedSources}
          onToggleSource={handleToggleSource}
          selectedSector={selectedSector}
          onSelectSector={setSelectedSector}
          selectedPolicyType={selectedPolicyType}
          onSelectPolicyType={setSelectedPolicyType}
          onResetFilters={handleResetFilters}
          totalCount={policies.length}
          bookmarkCount={bookmarkedIds.length}
          sourceCounts={sourceCounts}
          sectorCounts={sectorCounts}
          typeCounts={typeCounts}
          hasActiveFilters={hasActiveFilters}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {activeView === "admin" ? (
              <AdminPolicyForm
                onAddPolicy={handleAddPolicy}
                onCancel={() => setActiveView("feed")}
              />
            ) : (
              <>
                {/* Feed Context Toolbar */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
                  <div>
                    <h1 className="font-display text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
                      {activeView === "bookmarks"
                        ? "Bookmarked Policy Briefs"
                        : "Regulatory Intelligence Feed"}
                    </h1>
                    <p className="mt-1 font-mono text-xs tabular-nums text-slate-400">
                      Showing {filteredPolicies.length} of {policies.length} briefs · Active lens:{" "}
                      <span className="text-emerald-400">{selectedPersona}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#131A29] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Clear Filters</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#131A29] px-2.5 py-1.5">
                      <ArrowUpDown
                        className="h-3.5 w-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <label htmlFor="feed-sort" className="sr-only">
                        Sort policies
                      </label>
                      <select
                        id="feed-sort"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                        className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none"
                      >
                        <option value="latest" className="bg-[#131A29]">
                          Latest First
                        </option>
                        <option value="impact" className="bg-[#131A29]">
                          Highest Impact Score
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Policy Cards or Empty State */}
                {filteredPolicies.length > 0 ? (
                  <div className="space-y-5">
                    {filteredPolicies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        policy={policy}
                        selectedPersona={selectedPersona}
                        isBookmarked={bookmarkedIds.includes(policy.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onCopyBrief={handleCopyBrief}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#1E293B] bg-[#131A29] px-6 py-14 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-[#2A374F] bg-[#182235] text-slate-400">
                      {activeView === "bookmarks" ? (
                        <Bookmark className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <FileSearch className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>
                    <h2 className="mt-4 font-display text-base font-semibold text-slate-100">
                      {activeView === "bookmarks"
                        ? "No bookmarked policy briefs yet"
                        : "No matching regulatory policies found"}
                    </h2>
                    <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-400">
                      {activeView === "bookmarks"
                        ? "Bookmark high-priority circulars from the Intelligence Feed to keep them ready for investment committee or board reviews."
                        : "Adjust your search keywords, portal filters, or publish a new policy brief directly in the Admin tab."}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      {activeView === "bookmarks" ? (
                        <button
                          type="button"
                          onClick={() => setActiveView("feed")}
                          className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
                        >
                          Browse Intelligence Feed
                        </button>
                      ) : (
                        <>
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A374F] bg-[#182235] px-4 py-2 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                            >
                              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Reset All Filters</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveView("admin")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Add New Policy</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
