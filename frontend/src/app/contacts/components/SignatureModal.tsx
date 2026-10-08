interface SignaturePlotRow {
  plot: string;
  total: number;
  signed: number;
  percentage: number;
}

interface SignatureModalProps {
  signatureByPlot: SignaturePlotRow[];
  onClose: () => void;
}

export default function SignatureModal({ signatureByPlot, onClose }: SignatureModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        dir="rtl"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[400px] flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 text-2xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-slate-800">
            פירוט אחוז חתימות לפי חלקה
          </h2>
        </div>

        <div
          className="overflow-y-auto border border-slate-200 rounded-xl flex-1"
          dir="ltr"
        >
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-slate-700 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3">חלקה</th>
                <th className="px-4 py-3">מספר דיירים</th>
                <th className="px-4 py-3">דיירים חתומים</th>
                <th className="px-4 py-3">אחוז חתימות</th>
              </tr>
            </thead>

            <tbody>
              {signatureByPlot.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    אין נתונים להצגה
                  </td>
                </tr>
              ) : (
                signatureByPlot.map((row) => (
                  <tr key={row.plot} className="border-b">
                    <td className="px-4 py-3">{row.plot}</td>
                    <td className="px-4 py-3">{row.total}</td>
                    <td className="px-4 py-3">{row.signed}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          row.percentage >= 50
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
