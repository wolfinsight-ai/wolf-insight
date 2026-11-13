import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Menu, Search, UserCheck, X } from "lucide-react";
import { PERSONAS, Persona } from "../types/policy";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
  onOpenMobileSidebar: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedPersona,
  onSelectPersona,
  onOpenMobileSidebar,
  searchInputRef,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#1E293B] bg-[#0B0F19]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:flex-nowrap lg:gap-6 lg:px-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation and filters"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#1E293B] bg-[#131A29] text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-500 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-[#131A29] text-emerald-400"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 5l4 4 4-3 4 3 4-4v9l-8 6-8-6V5z" />
                <path d="M9 12l3 2 3-2" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-display text-base font-bold tracking-tight text-slate-50 whitespace-nowrap sm:text-lg">
                Wolf Insights
              </div>
              <p className="hidden text-xs text-slate-400 whitespace-nowrap sm:block">
                Indian Renewable &amp; Climate Policy Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Prominent Natural Language Search Bar */}
        <div className="order-3 w-full lg:order-2 lg:max-w-xl lg:flex-1">
          <label htmlFor="policy-search" className="sr-only">
            Ask or search policies
          </label>
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="policy-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ask or search policies (e.g., 'biogas subsidy', 'ALMM solar cells', 'ISTS waiver')..."
              className="h-10 w-full rounded-lg border border-[#1E293B] bg-[#131A29] pl-10 pr-16 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-emerald-500/60 focus:bg-[#161F31] focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search query"
                className="absolute right-2.5 inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 hidden rounded border border-[#1E293B] bg-[#0B0F19] px-1.5 py-0.5 font-mono text-[11px] text-slate-500 sm:inline-block">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Persona Selector Dropdown */}
        <div className="relative order-2 shrink-0 lg:order-3" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            className="flex h-10 items-center gap-2.5 rounded-lg border border-[#1E293B] bg-[#131A29] px-3.5 text-left transition-colors hover:border-emerald-500/40 focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <UserCheck className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <div className="flex flex-col leading-tight">
              <span className="hidden font-mono text-[10px] tracking-wide text-slate-400 sm:block">
                Impact Lens
              </span>
              <span className="max-w-[150px] truncate text-xs font-semibold text-slate-100 sm:max-w-[190px] sm:text-sm">
                {selectedPersona}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {dropdownOpen && (
            <div
              role="listbox"
              aria-label="Select executive persona"
              className="absolute right-0 mt-2 w-72 rounded-xl border border-[#1E293B] bg-[#131A29] p-1.5 shadow-2xl shadow-black/60 z-50"
            >
              <div className="px-2.5 py-1.5 text-[11px] font-mono text-slate-400 border-b border-[#1E293B] mb-1">
                Select Business Persona Lens
              </div>
              {PERSONAS.map((persona) => {
                const isSelected = persona === selectedPersona;
                return (
                  <button
                    key={persona}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelectPersona(persona);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-emerald-500/15 text-emerald-300 font-medium"
                        : "text-slate-300 hover:bg-[#1A2438] hover:text-white"
                    }`}
                  >
                    <span className="truncate">{persona}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
