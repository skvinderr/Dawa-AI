"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Sparkles, ArrowRight, Pill, History } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface SuggestionItem {
  name: string;
  category: string;
  isJanAushadhiGeneric: boolean;
}

const COMMON_SUGGESTIONS: SuggestionItem[] = [
  { name: "Paracetamol 650mg (Dolo / Crocin)", category: "Fever & Pain", isJanAushadhiGeneric: true },
  { name: "Metformin 500mg SR (Glycomet)", category: "Diabetes", isJanAushadhiGeneric: true },
  { name: "Azithromycin 500mg (Azithral)", category: "Antibiotic", isJanAushadhiGeneric: true },
  { name: "Oral Rehydration Salts (Electral ORS)", category: "Dehydration", isJanAushadhiGeneric: true },
  { name: "Amoxicillin + Clavulanate (Augmentin 625)", category: "Antibiotic", isJanAushadhiGeneric: false },
  { name: "Telmisartan 40mg (Telma 40)", category: "Blood Pressure", isJanAushadhiGeneric: true },
  { name: "Pantoprazole 40mg (Pan 40)", category: "Gastric & Acidity", isJanAushadhiGeneric: true },
  { name: "Cetirizine 10mg (Cetzine)", category: "Allergy & Cold", isJanAushadhiGeneric: true },
];

export function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder,
  className = "",
  size = "normal",
}: {
  value: string;
  onChange: (val: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  size?: "normal" | "large";
}) {
  const { language } = useTranslation();
  const hi = language === "hi";
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLarge = size === "large";

  const filteredSuggestions = value.trim()
    ? COMMON_SUGGESTIONS.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase()) ||
      item.category.toLowerCase().includes(value.toLowerCase())
    )
    : COMMON_SUGGESTIONS.slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = (name: string) => {
    const query = name.split(" ")[0];
    onChange(query);
    onSearch(query);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!isOpen) setIsOpen(true);
      event.preventDefault();
      if (event.key === "ArrowDown") setActiveIndex((current) => current < filteredSuggestions.length - 1 ? current + 1 : 0);
      else setActiveIndex((current) => current > 0 ? current - 1 : filteredSuggestions.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && filteredSuggestions[activeIndex]) selectSuggestion(filteredSuggestions[activeIndex].name);
      else { onSearch(value); setIsOpen(false); }
    }
    if (event.key === "Escape") { setIsOpen(false); setActiveIndex(-1); }
  };

  const inputPlaceholder = placeholder || (hi
    ? "दवा का नाम, सॉल्ट या बीमारी खोजें…"
    : "Search a medicine, active ingredient, or condition…");

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className={`relative flex items-center gap-2 rounded-[1rem] border bg-white transition-all duration-200 ${isOpen ? "border-[#d9b5db] shadow-[0_0_0_4px_rgba(226,38,145,.08)]" : "border-slate-200 hover:border-slate-300"} ${isLarge ? "p-1.5 sm:p-2" : "p-1"}`}>
        <label htmlFor="search-autocomplete-input" className="sr-only">{inputPlaceholder}</label>
        <span className={`ml-2 grid shrink-0 place-items-center rounded-xl bg-[#f5eff8] text-[#7b5792] ${isLarge ? "h-10 w-10 sm:h-11 sm:w-11" : "h-8 w-8"}`}>
          <Search className={isLarge ? "h-[18px] w-[18px]" : "h-4 w-4"} aria-hidden="true" />
        </span>
        <input
          id="search-autocomplete-input"
          ref={inputRef}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && filteredSuggestions.length > 0}
          aria-controls="search-suggestions-listbox"
          aria-activedescendant={activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined}
          aria-label={inputPlaceholder}
          value={value}
          onChange={(event) => { onChange(event.target.value); setIsOpen(true); setActiveIndex(-1); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          className={`min-w-0 flex-1 border-0 bg-transparent text-[#251b32] outline-none placeholder:text-slate-400 focus:ring-0 ${isLarge ? "h-11 text-xs font-medium sm:h-12 sm:text-sm" : "h-9 text-xs"}`}
        />
        <button
          type="button"
          onClick={() => { onSearch(value); setIsOpen(false); }}
          aria-label={hi ? "दवा खोजें" : "Search medicines"}
          className={`group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e42691] to-[#bd2b9d] font-extrabold text-white shadow-[0_6px_16px_-8px_rgba(196,31,135,.75)] transition duration-200 hover:-translate-y-0.5 hover:from-[#ce1b7e] hover:to-[#9e258a] active:translate-y-0 active:scale-[.98] ${isLarge ? "h-10 px-3.5 text-xs sm:h-11 sm:px-5 sm:text-sm" : "h-8 px-3 text-xs"}`}
        >
          <span>{hi ? "खोजें" : "Search"}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[1.25rem] border border-[#e9e1ed] bg-white shadow-[0_24px_60px_-24px_rgba(32,12,55,.32)] animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 bg-[#fcfafd] px-4 py-3">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.13em] text-[#70557e]"><Sparkles className="h-3.5 w-3.5 text-[#df3797]" />{hi ? "आपके लिए सुझाव" : value.trim() ? "Matching medicines" : "Popular searches"}</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-400"><History className="h-3 w-3" />↑↓ {hi ? "चुनें" : "to navigate"} · Esc</span>
          </div>
          <ul id="search-suggestions-listbox" role="listbox" aria-label={hi ? "दवा खोज सुझाव" : "Medicine search suggestions"} className="max-h-[min(22rem,55vh)] divide-y divide-slate-100 overflow-y-auto p-1.5">
            {filteredSuggestions.map((item, index) => {
              const highlighted = index === activeIndex;
              return (
                <li key={item.name} id={`search-suggestion-${index}`} role="option" aria-selected={highlighted} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectSuggestion(item.name)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors ${highlighted ? "bg-[#f9edf5]" : "hover:bg-[#faf8fb]"}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${highlighted ? "bg-white text-[#d52b8a] shadow-sm" : "bg-[#f5eff8] text-[#795993]"}`}><Pill className="h-4 w-4" /></span>
                    <span className="min-w-0"><span className={`block truncate text-xs font-bold sm:text-sm ${highlighted ? "text-[#51204b]" : "text-slate-800"}`}>{item.name}</span><span className="mt-1 block text-[10px] font-medium text-slate-400">{item.category}</span></span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.isJanAushadhiGeneric && <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-extrabold text-emerald-700 sm:inline-flex">Jan Aushadhi</span>}
                    <ArrowRight className={`h-4 w-4 transition ${highlighted ? "translate-x-0 text-[#d52b8a]" : "-translate-x-1 text-slate-300 opacity-0"}`} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-100 px-4 py-2 text-[9px] text-slate-400">{hi ? "सटीक सॉल्ट-मिलान के लिए दवा का नाम या सक्रिय घटक लिखें" : "Search by medicine name or active ingredient for an exact match"}</div>
        </div>
      )}
    </div>
  );
}