"use client";

interface FileCellProps {
  value: string | undefined;
  contactId: string;
  field: string;
  fieldLabel: string;
  accountId: string;
  onUpload: (
    file: File,
    contactId: string,
    field: string,
    fieldLabel: string,
    accountId: string,
  ) => Promise<void>;
  onDelete: (
    contactId: string,
    field: string,
    accountId: string,
  ) => Promise<void>;
   onDownloadFile: (contactId: string, field: string) => Promise<void>;
}

export function FileCell({
  value,
  contactId,
  field,
  fieldLabel,
  accountId,
  onUpload,
  onDelete,
  onDownloadFile
}: FileCellProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {/* סיכה - תמיד מוצגת */}
      <label
        className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group"
        title="העלה קובץ"
      >
        <input
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0])
              onUpload(
                e.target.files[0],
                contactId,
                field,
                fieldLabel,
                accountId,
              );
          }}
        />
        <svg
          className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </label>

      {value === "1" ? (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDownloadFile(contactId, field)}
            className="p-1 hover:bg-blue-50 rounded inline-flex items-center justify-center group"
            title="הורד קובץ"
          >
            <svg
              className="w-4.5 h-4.5 text-blue-400 group-hover:text-blue-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(contactId, field, accountId)}
            className="p-1 hover:bg-red-50 rounded inline-flex items-center justify-center group"
            title="מחק קובץ"
          >
            <svg
              className="w-4.5 h-4.5 text-red-400 group-hover:text-red-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
            כן
          </span>
        </div>
      ) : (
        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
          לא
        </span>
      )}
    </div>
  );
}
