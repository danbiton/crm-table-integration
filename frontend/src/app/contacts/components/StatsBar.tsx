interface StatsBarProps {
  signaturePercentage: string;
  signatureLen: number;
  totalFiltered: number;
  apartmentCount: number;
  onSignatureClick: () => void;
}

export default function StatsBar({
  signaturePercentage,
  signatureLen,
  totalFiltered,
  apartmentCount,
  onSignatureClick,
}: StatsBarProps) {
  const isAboveHalf = Number(signaturePercentage) >= 50;

  return (
    <div className="flex justify-end gap-4 mb-4">
      {/* אחוז חתימות */}
      <button
        type="button"
        onClick={onSignatureClick}
        className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-3 min-w-35.5 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
      >
        <div className={`p-2 rounded-lg ${isAboveHalf ? "bg-green-100" : "bg-red-100"}`}>
          <svg
            className={`w-5 h-5 ${isAboveHalf ? "text-green-500" : "text-red-500"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">% חתימות</div>
          <div className="text-2xl font-bold text-slate-800">{signaturePercentage}</div>
          <div dir="rtl" className="text-xs text-slate-400">
            {`${signatureLen} מתוך ${totalFiltered}`}
          </div>
        </div>
      </button>

      {/* מספר דיירים */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-3 min-w-32.5">
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">מספר דיירים</div>
          <div className="text-2xl font-bold text-slate-800">{totalFiltered}</div>
        </div>
      </div>

      {/* מספר דירות */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-3 min-w-32.5">
        <div className="bg-purple-100 p-2 rounded-lg">
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">מספר דירות</div>
          <div className="text-2xl font-bold text-slate-800">{apartmentCount}</div>
        </div>
      </div>
    </div>
  );
}
