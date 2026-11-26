"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = value.trim()
    ? COMMON_SUGGESTIONS.filter(
        (s) =>
          s.name.toLowerCase().includes(value.toLowerCase()) ||
          s.category.toLowerCase().includes(value.toLowerCase())
      )
    : COMMON_SUGGESTIONS.slice(0, 5);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
          const selected = filteredSuggestions[activeIndex].name.split(" ")[0];
          onChange(selected);
          onSearch(selected);
        } else {
          onSearch(value);
        }
        setIsOpen(false);
        break;

      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;

      default:
        break;
    }
  };

  const handleSelectSuggestion = (name: string) => {
    const cleanName = name.split(" ")[0];
    onChange(cleanName);
    onSearch(cleanName);
    setIsOpen(false);
  };

  const isLarge = size === "large";

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <div className="relative flex items-center">
        <label htmlFor="search-autocomplete-input" className="sr-only">
          {placeholder || "Search medicines"}
        </label>
        <Search
          className={`absolute left-4 text-slate-400 pointer-events-none ${
            isLarge ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4"
          }`}
          aria-hidden="true"
        />
        <input
          id="search-autocomplete-input"
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-suggestions-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined
          }
          aria-label={placeholder || "Search medicine name, active salt, or disease"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (language === "hi"
              ? "दवा का नाम, साल्ट या बीमारी खोजें (उदा. पैरासिटामोल, मेटफॉर्मिन)..."
              : "Search medicine name, salt, or disease (e.g. Paracetamol, Metformin)...")
          }
          className={`w-full rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-health-500/30 focus:border-health-600 transition-all shadow-soft ${
            isLarge
              ? "pl-12 sm:pl-14 pr-32 py-4 sm:py-5 text-sm sm:text-base font-medium"
              : "pl-10 pr-24 py-2.5 text-xs font-normal"
          }`}
        />

        <button
          type="button"
          onClick={() => onSearch(value)}
          aria-label="Search"
          className={`absolute right-2 px-5 rounded-xl bg-health-700 hover:bg-health-800 active:scale-95 text-white font-extrabold transition-all shadow-xs flex items-center gap-1.5 ${
            isLarge ? "py-2.5 sm:py-3.5 text-xs sm:text-sm" : "py-1.5 text-xs"
          }`}
        >
          <span>{language === "hi" ? "खोजें" : "Search"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Autocomplete Dropdown Listbox */}
      {isOpen && filteredSuggestions.length > 0 && (
        <ul
          id="search-suggestions-listbox"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 divide-y divide-slate-100 max-h-72 overflow-y-auto"
        >
          <li className="px-4 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{language === "hi" ? "सुझाव (कीबोर्ड से चुनें)" : "Suggestions (Use ↑↓ arrows)"}</span>
            <span className="font-mono text-[9px]">ESC to close</span>
          </li>
          {filteredSuggestions.map((item, idx) => {
            const isHighlighted = idx === activeIndex;
            return (
              <li
                key={item.name}
                id={`search-suggestion-${idx}`}
                role="option"
                aria-selected={isHighlighted}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelectSuggestion(item.name)}
                className={`px-4 py-2.5 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors ${
                  isHighlighted ? "bg-health-50 text-health-950 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Pill className="w-3.5 h-3.5 text-health-600 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.isJanAushadhiGeneric && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      Jan Aushadhi
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.category}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
