"use client";

import { Contact } from "../../../types/contact";
import SortableHeader, { SortDirection } from "./SortableHeader";
import { FileCell } from "./FileCell";
import DownloadDocuments from "./DownloadDocuments";
import * as XLSX from "xlsx";

const FILE_FIELDS = [
  "Z_ID_File",
  "Z_A3_Agreement",
  "Z_A3_Agreement_Single_Owner",
  "Z_A4_Tax_Questionnaire",
  "Z_D_Planning_POA",
  "Z_D1_Tax_POA",
  "Z_D2_Joint_Building_POA",
  "Z_D3_Transfer_Rights_POA",
  "Z_D4_Caution_Note_POA",
  "Z_D5_Legal_Proceedings_POA",
  "Z_D6_Bank_Inquiry_POA",
  "Z_G_Representation_Appointment",
  "Z_K_Trustee_Instructions",
  "Z_Caution_Note_Request",
  "Z_Form_7009",
  "Z_Form_7005",
  "Z_Cancel_Prev_Agreement",
  "Z_Agreement_Addendum",
  "Z_Upgrade_Downgrade_Agreement",
] as const;

const FILE_FIELD_LABELS: Record<(typeof FILE_FIELDS)[number], string> = {
  Z_ID_File: "צילום ת.ז וספח",
  Z_A3_Agreement: "נספח א'3 כתב הסכמת בן/בת זוג",
  Z_A3_Agreement_Single_Owner: "נספח א'3 תצהיר בעלים יחיד",
  Z_A4_Tax_Questionnaire: "נספח א'4 שאלון מיסוי",
  Z_D_Planning_POA: "נספח ד' ייפוי כוח לתכנון",
  Z_D1_Tax_POA: "נספח ד'1 ייפוי כוח מס",
  Z_D2_Joint_Building_POA: "נספח ד'2 ייפוי כוח לרישום/מחיקה בית משותף",
  Z_D3_Transfer_Rights_POA: "נספח ד'3 ייפוי כוח העברת זכויות",
  Z_D4_Caution_Note_POA: "נספח ד'4 ייפוי כוח לרישום הע״א",
  Z_D5_Legal_Proceedings_POA: "נספח ד'5 ייפוי כוח הליכים משפטיים",
  Z_D6_Bank_Inquiry_POA: "נספח ד'6 ייפוי כוח לפנייה לבנק",
  Z_G_Representation_Appointment: "נספח ז' כתב מינוי נציגות",
  Z_K_Trustee_Instructions: "נספח יא' כתב הוראות לנאמן",
  Z_Caution_Note_Request: "בקשה לרישום הע״א",
  Z_Form_7009: "טופס 7009",
  Z_Form_7005: "טופס 7005",
  Z_Cancel_Prev_Agreement: "הסכם לביטול הסכם קודם",
  Z_Agreement_Addendum: "תוספות/ נספח להסכם",
  Z_Upgrade_Downgrade_Agreement: "הסכם שדרוג/ שנמוך",
};

const documentTypeOptions = FILE_FIELDS.map((field) => ({
  value: field,
  label: FILE_FIELD_LABELS[field],
}));

const isAllFilesSigned = (contact: Contact) =>
  FILE_FIELDS.every((field) => contact.extensions?.[field] === "1");

interface Option {
  value: string;
  label: string;
}

interface ContactsTableProps {
  contacts: Contact[];
  filteredContacts: Contact[];
  sortField: string | null;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
  accountId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  residentOptions: Option[];
  plotOptions: Option[];
  onDownloadZip: (filterType: string, value: string) => void;
  onUpload: (file: File, contactId: string, field: string, fieldLabel: string, accountId: string) => Promise<void>;
  onDelete: (contactId: string, field: string, accountId: string) => Promise<void>;
  onDownloadFile: (contactId: string, field: string) => Promise<void>;
  onUpdateSigned: (contactId: string, currentValue: string | undefined) => Promise<void>;
}

export default function ContactsTable({
  contacts,
  filteredContacts,
  sortField,
  sortDirection,
  onSort,
  accountId,
  searchQuery,
  onSearchChange,
  residentOptions,
  plotOptions,
  onDownloadZip,
  onUpload,
  onDelete,
  onDownloadFile,
  onUpdateSigned,
}: ContactsTableProps) {
  
  const exportToExcel = () => {
    const rows = contacts.map((contact) => {
      const row: Record<string, string> = {
        שם: contact.formattedName || "",
        "מס' ת.ז": contact.extensions?.Z_ID_Number || "",
        גוש: contact.extensions?.Z_Block || "",
        חלקה: contact.extensions?.Z_Part || "",
        "תת חלקה": contact.extensions?.Z_SubPlot || "",
        "חתום על הסכם": contact.extensions?.Z_Signed === "1" ? "כן" : "לא",
        קשיש: contact.extensions?.Z_Is_Senior === "1" ? "כן" : "לא",
      };
      FILE_FIELDS.forEach((field) => {
        row[FILE_FIELD_LABELS[field]] = contact.extensions?.[field] === "1" ? "כן" : "לא";
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!sheetViews"] = [{ rightToLeft: true }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "דיירים");
    XLSX.writeFile(workbook, "residents.xlsx");
  };

  return (
    <>
      {/* Search + Download row */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש לפי שם או ת.ז..."
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all text-sm w-80"
        />

        <div className="flex items-center gap-3">
          <DownloadDocuments
            residents={residentOptions}
            plots={plotOptions}
            documentTypes={documentTypeOptions}
            onDownload={onDownloadZip}
          />

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            ייצוא לאקסל
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative">
          <table className="w-full" dir="rtl">
            <thead>
              <tr className="bg-slate-700 sticky top-0 z-30">
                <th className="sticky right-0 z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[60px] min-w-[60px]">
                  #
                </th>
                <th className="sticky right-[60px] bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[150px] min-w-[150px] text-[11px]">
                  <SortableHeader label="שם" field="formattedName" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="sticky right-[210px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[80px] min-w-[80px]">
                  <SortableHeader label="גוש" field="Z_Block" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="sticky right-[290px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[80px] min-w-[80px]">
                  <SortableHeader label="חלקה" field="Z_Part" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="sticky right-[370px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[90px] min-w-[90px]">
                  <SortableHeader label="תת חלקה" field="Z_SubPlot" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="sticky right-[460px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[80px] min-w-[80px]">
                  <SortableHeader label="קשיש" field="Z_Is_Senior" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="sticky right-[540px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[120px] min-w-[120px] border-l-2 border-slate-500">
                  <SortableHeader label="מס' ת.ז" field="Z_ID_Number" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                  <SortableHeader label="חתום על הסכם" field="Z_Signed" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                  <SortableHeader label="חלק ברכוש המשותף" field="Z_Joint_Property_Share" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold text-white">
                  <SortableHeader label="תאריך חתימה על ההסכם" field="Z_Signing_Date" sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                </th>
                {FILE_FIELDS.map((field) => (
                  <th key={field} className="px-3 py-3 text-center text-xs font-bold text-white">
                    <SortableHeader label={FILE_FIELD_LABELS[field]} field={field} sortField={sortField} sortDirection={sortDirection} onSort={onSort} />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredContacts.map((contact, index) => {
                const allSigned = isAllFilesSigned(contact);
                const rowBg = allSigned ? "bg-green-100" : "bg-white";

                return (
                  <tr
                    key={contact.id}
                    className={`transition-colors duration-150 ${allSigned ? "bg-green-100 hover:bg-green-100" : "hover:bg-slate-50"}`}
                  >
                    <td className={`sticky right-0 z-10 ${rowBg} px-3 py-3 text-center w-[60px] min-w-[60px]`}>
                      <span className="text-slate-600 font-medium text-sm">{index + 1}</span>
                    </td>

                    <td className={`sticky right-[60px] z-10 ${rowBg} pl-3 pr-10 py-3 text-right w-[150px] min-w-[150px]`}>
                      <a
                        href={`https://my1002519.de1.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <span className="relative inline-block">
                          <span
                            className={`block truncate font-semibold text-[11px] hover:underline ${contact.extensions?.Z_Is_Senior === "1" ? "text-red-700" : "text-slate-800"}`}
                            title={contact.formattedName}
                          >
                            {contact.formattedName}
                          </span>
                          {!!contact.extensions?.Z_extra_documents && (
                            <span className="absolute top-0 -left-2 text-yellow-500 text-[10px]" title="מסמכים נוספים">
                              ★
                            </span>
                          )}
                        </span>
                      </a>
                    </td>

                    <td className={`sticky right-[210px] z-10 ${rowBg} pl-3 pr-6 py-3 text-right w-[80px] min-w-[80px]`}>
                      <span className="text-slate-600 text-[11px]">{contact.extensions?.Z_Block}</span>
                    </td>
                    <td className={`sticky right-[290px] z-10 ${rowBg} pl-3 pr-6 py-3 text-right w-[80px] min-w-[80px]`}>
                      <span className="text-slate-600 text-[11px]">{contact.extensions?.Z_Part}</span>
                    </td>
                    <td className={`sticky right-[370px] z-10 ${rowBg} pl-3 pr-6 py-3 text-right w-[90px] min-w-[90px]`}>
                      <span className="text-slate-600 text-[11px]">{contact.extensions?.Z_SubPlot}</span>
                    </td>
                    <td className={`sticky right-[460px] z-10 ${rowBg} px-3 py-3 text-center w-[80px] min-w-[80px]`}>
                      <span className="px-2.5 py-1 rounded text-xs font-semibold text-[11px]">
                        {contact.extensions?.Z_Is_Senior === "1" ? "כן" : "לא"}
                      </span>
                    </td>
                    <td className={`sticky right-[540px] z-10 ${rowBg} px-3 py-3 text-center w-[120px] min-w-[120px]`}>
                      <span className="text-slate-600 text-[11px]">{contact.extensions?.Z_ID_Number}</span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onUpdateSigned(contact.id, contact.extensions?.Z_Signed)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                            contact.extensions?.Z_Signed === "1"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                          title="לחץ לשינוי"
                        >
                          {contact.extensions?.Z_Signed === "1" ? "כן" : "לא"}
                        </button>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className="text-slate-600 text-sm">{contact.extensions?.Z_Joint_Property_Share}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-slate-600 text-sm">{contact.extensions?.Z_Signing_Date}</span>
                    </td>

                    {FILE_FIELDS.map((field) => (
                      <td key={field} className="px-3 py-3">
                        <FileCell
                          value={contact.extensions?.[field]}
                          contactId={contact.id}
                          field={field}
                          fieldLabel={FILE_FIELD_LABELS[field]}
                          accountId={accountId}
                          onUpload={onUpload}
                          onDelete={onDelete}
                          onDownloadFile={onDownloadFile}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 text-end">
        <div className="text-sm text-slate-500">
          מציג{" "}
          <span className="font-semibold text-slate-700">{filteredContacts.length}</span>{" "}
          רשומות מתוך{" "}
          <span className="font-semibold text-slate-700">{contacts.length}</span>{" "}
          רשומות
        </div>
        <div className="text-xs text-slate-400 mt-1">
          <span className="text-yellow-500">★</span> נדרשים מסמכים מיוחדים
        </div>
      </div>
    </>
  );
}
