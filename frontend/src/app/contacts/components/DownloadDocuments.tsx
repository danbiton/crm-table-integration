"use client";

import { useState, useMemo } from "react";

type FilterType = "all" | "resident" | "plot" | "documentType";

interface Option {
  value: string;   // מה שנשלח ל-backend
  label: string;   // מה שמוצג למשתמש
}

interface DownloadDocumentsProps {
  residents: Option[];
  plots: Option[];
  documentTypes: Option[];
  onDownload: (filterType: FilterType, value: string) => void;
}

export default function DownloadDocuments({
  residents,
  plots,
  documentTypes,
  onDownload,
}: DownloadDocumentsProps) {
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Option | null>(null);

  // בוחר איזו רשימה להציג לפי סוג הסינון
  const options = useMemo<Option[]>(() => {
    if (filterType === "resident") return residents;
    if (filterType === "plot") return plots;
    if (filterType === "documentType") return documentTypes;
    return [];
  }, [filterType, residents, plots, documentTypes]);

  // סינון לפי החיפוש
  const filtered = useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );

  const filterLabels: Record<FilterType, string> = {
    all: "כל המסמכים",
    resident: "לפי דייר",
    plot: "לפי חלקה",
    documentType: "לפי סוג מסמך",
  };

  const handlePickFilter = (type: FilterType) => {
    if (type === "all") {
    onDownload("all", "");      
    setOpen(false);
    setFilterType(null);
    setSelected(null);
    return;
  }
    setFilterType(type);
    setSelected(null);
    setSearch("");
  };

  const handleDownload = () => {
    if (filterType && selected) {
      onDownload(filterType, selected.value);
      setOpen(false);
      setFilterType(null);
      setSelected(null);
    }
  };

  return (
    <div className="relative inline-block text-right" dir="rtl">
      {/* כפתור ראשי */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        הורדת מסמכים
      </button>

      {/* פאנל נפתח */}
      {open && (
        <div className="absolute z-50 mt-2 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* שלב 1: בחירת סוג סינון */}
          <div className="p-3 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-500 mb-2">סנן לפי</div>
            <div className="flex gap-2">
              {(["all", "resident", "plot", "documentType"] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handlePickFilter(type)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    filterType === type
                      ? "bg-slate-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filterLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* שלב 2: רשימה עם חיפוש */}
          {filterType && (
            <div className="p-3">
              {/* שדה חיפוש */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש..."
                className="w-full px-3 py-2 mb-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white"
                autoFocus
              />

              {/* רשימה גלילה */}
              <div className="max-h-56 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="text-center text-sm text-slate-400 py-4">
                    אין תוצאות
                  </div>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelected(opt)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
                        selected?.value === opt.value
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))
                )}
              </div>

              {/* כפתור הורדה */}
              <button
                onClick={handleDownload}
                disabled={!selected}
                className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                הורד כ-ZIP
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}