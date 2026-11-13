import React from "react";
import { Bookmark, Layers, Plus, RotateCcw, X } from "lucide-react";
import {
  ActiveView,
  GOVERNMENT_SOURCES,
  GovernmentSourceId,
  POLICY_TYPES,
  PolicyType,
  SECTORS,
  Sector,
} from "../types/policy";

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  selectedSources: GovernmentSourceId[];
  onToggleSource: (source: GovernmentSourceId | "ALL") => void;
  selectedSector: Sector | "ALL";
  onSelectSector: (sector: Sector | "ALL") => void;
  selectedPolicyType: PolicyType | "ALL";
  onSelectPolicyType: (type: PolicyType | "ALL") => void;
  onResetFilters: () => void;
  totalCount: number;
  bookmarkCount: number;
  sourceCounts: Record<GovernmentSourceId, number>;
  sectorCounts: Record<Sector, number>;
  typeCounts: Record<PolicyType, number>;
  hasActiveFilters: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  selectedSources,
  onToggleSource,
  selectedSector,
  onSelectSector,
  selectedPolicyType,
  onSelectPolicyType,
  onResetFilters,
  totalCount,
  bookmarkCount,
  sourceCounts,
  sectorCounts,
  typeCounts,
  hasActiveFilters,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleViewClick = (view: ActiveView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-5">
      {/* Primary Navigation */}
      <nav aria-label="Workspace views" className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => handleViewClick("feed")}
          className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === "feed"
              ? "bg-[#1A2438] text-white border border-[#2A374F]"
              : "text-slate-300 hover:bg-[#131A29] hover:text-white border border-transparent"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span>Intelligence Feed</span>
          </span>
          <span className="font-mono text-xs tabular-nums text-slate-400">{totalCount}</span>
        </button>

        <button
          type="button"
          onClick={() => handleViewClick("bookmarks")}
          className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === "bookmarks"
              ? "bg-[#1A2438] text-white border border-[#2A374F]"
              : "text-slate-300 hover:bg-[#131A29] hover:text-white border border-transparent"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Bookmark className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span>Bookmarked Briefs</span>
          </span>
          <span className="font-mono text-xs tabular-nums text-slate-400">{bookmarkCount}</span>
        </button>

        <button
          type="button"
          onClick={() => handleViewClick("admin")}
          className={`mt-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === "admin"
              ? "bg-emerald-500 text-slate-950 font-semibold"
              : "border border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
          }`}
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>+ Add New Policy (Admin)</span>
          </span>
        </button>
      </nav>

      <div className="border-t border-[#1E293B]" />

      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-slate-400">
          Regulatory Filters
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Government Sources Multi-Select */}
      <section aria-labelledby="filter-sources-heading" className="flex flex-col gap-2">
        <h2
          id="filter-sources-heading"
          className="text-xs font-medium text-slate-400"
        >
          Government Source
        </h2>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              onToggleSource("ALL");
              if (activeView === "admin") onSelectView("feed");
            }}
            className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
              selectedSources.length === 0
                ? "bg-[#1A2438] text-emerald-300 font-medium border border-emerald-500/30"
                : "text-slate-300 hover:bg-[#131A29] hover:text-white border border-transparent"
            }`}
          >
            <span className="truncate">All Portals</span>
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              {totalCount}
            </span>
          </button>

          {GOVERNMENT_SOURCES.map((source) => {
            const isSelected = selectedSources.includes(source.id);
            const count = sourceCounts[source.id] ?? 0;
            return (
              <button
                key={source.id}
                type="button"
                title={source.fullName}
                onClick={() => {
                  onToggleSource(source.id);
                  if (activeView === "admin") onSelectView("feed");
                }}
                className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "bg-[#1A2438] text-emerald-300 font-medium border border-emerald-500/30"
                    : "text-slate-300 hover:bg-[#131A29] hover:text-white border border-transparent"
                }`}
              >
                <span className="truncate">{source.label}</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sector Filter */}
      <section aria-labelledby="filter-sector-heading" className="flex flex-col gap-2">
        <h2 id="filter-sector-heading" className="text-xs font-medium text-slate-400">
          Sector
        </h2>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              onSelectSector("ALL");
              if (activeView === "admin") onSelectView("feed");
            }}
            className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
              selectedSector === "ALL"
                ? "bg-[#1A2438] text-emerald-300 font-medium border border-emerald-500/30"
                : "text-slate-300 hover:bg-[#131A29] hover:text-white border border-transparent"
            }`}
          >
            <span className="truncate">All Sectors</span>
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              {totalCount}
            </span>
          </button>

          {SECTORS.map((sector) => {
            const isSelected = selectedSector === sector;
            const count = sectorCounts[sector] ?? 0;
            return (
              <button
                key={sector}
                type="button"
                onClick={() => {
                  onSelectSector(sector);
                  if (activeView === "admin") onSelectView("feed");
                }}
                className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "bg-[#1A2438] text-emerald-300 font-medium border border-emerald-500/30"
                    : "text-slate-300 hover:bg-[#131A29] hover:text-white border border-transparent"
                }`}
              >
                <span className="truncate">{sector}</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Policy Type Filter */}
      <section aria-labelledby="filter-type-heading" className="flex flex-col gap-2 pb-6">
        <h2 id="filter-type-heading" className="text-xs font-medium text-slate-400">
          Policy Type
        </h2>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              onSelectPolicyType("ALL");
              if (activeView === "admin") onSelectView("feed");
            }}
            className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
              selectedPolicyType === "ALL"
                ? "bg-[#1A2438] text-emerald-300 font-medium border border-emerald-500/30"
                : "text-slate-300 hover:bg-[#131A29] hover:text-white border border-transparent"
            }`}
          >
            <span className="truncate">All Types</span>
            <span className="font-mono tabular-nums text-[11px] text-slate-400">
              {totalCount}
            </span>
          </button>

          {POLICY_TYPES.map((type) => {
            const isSelected = selectedPolicyType === type;
            const count = typeCounts[type] ?? 0;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onSelectPolicyType(type);
                  if (activeView === "admin") onSelectView("feed");
                }}
                className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "bg-[#1A2438] text-emerald-300 font-medium border border-emerald-500/30"
                    : "text-slate-300 hover:bg-[#131A29] hover:text-white border border-transparent"
                }`}
              >
                <span className="truncate">{type}</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden w-[272px] shrink-0 border-r border-[#1E293B] bg-[#0D121F] lg:block">
        <div className="sticky top-[65px] h-[calc(100vh-65px)]">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-[#1E293B] bg-[#0D121F]">
            <div className="flex items-center justify-between border-b border-[#1E293B] px-4 py-3">
              <span className="font-display text-sm font-semibold text-white">
                Navigation &amp; Filters
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation drawer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-[#1A2438] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">{sidebarContent}</div>
          </aside>
        </div>
      )}
    </>
  );
};
