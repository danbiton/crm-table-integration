"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import { Contact } from "../../types/contact";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import SortableHeader, { SortDirection } from "./components/SortableHeader";
import { useContactSort } from "./hooks/useContactSort";
import useContactsFilter from "./hooks/useContactsFilter";
import { FileCell } from "./components/FileCell";

export default function ContactsPage() {

    const [contacts, setContacts] = useState<Contact[]>([]);

    const searchParams = useSearchParams();
    const accountId = searchParams.get('accountId') || searchParams.get('guid');


    //sort
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const handleSort = (field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
    };
    //filter
    const [searchQuery, setSearchQuery] = useState('');


    const fetchContacts = async () => {
        console.log("API_URL:", API_URL);
        console.log("accountId:", accountId);

        if (!accountId) {
            console.error("No accountId provided in URL!");
            return;
        }
        try {
            const url = `${API_URL}/contacts?accountId=${accountId}`;
            const response = await axios.get(url);
            console.log("Fetched contacts:", response.data);
            setContacts(response.data);
            console.log("contacts: ", contacts)
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };



    useEffect(() => {
        if (accountId) {
            fetchContacts();

        }

    }, [accountId]);

    //sort in client side

    const sortedContacts = useContactSort(contacts, sortField, sortDirection);
    console.log("sortContacts:", sortedContacts)



    //filter
    const filteredContacts = useContactsFilter(sortedContacts, searchQuery)

    //signaturePercentage
    const signatureLen = filteredContacts.filter(contact => contact.extensions?.Z_Agreement_Signed === '1').length
    const signaturePercentage = ((signatureLen / filteredContacts.length) * 100).toFixed(2)

    const addFile = async (file: File, contactId: string, field: string, fieldLabel: string, zIdNumber?: string) => {

        const formData = new FormData();
        formData.append("file", file);
        formData.append("contactId", contactId);
        formData.append("field", field)
        formData.append("fieldLabel", toFieldLabel(fieldLabel || ''));
        formData.append("zIdNumber", zIdNumber || '')
        console.log("formdata: ", formData);
        try {
            const response = await axios.post(`${API_URL}/upload-id`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            await fetchContacts();
            console.log("File uploading response:", response.data);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };


    const [appartmentCount, setAppartmentCount] = useState<number>(0);
    const fetchNumsApparts = async () => {

        try {
            const response = await axios.get(`${API_URL}/account?accountId=${accountId}`)
            const apartments = response.data?.[0]?.extensions?.Z_Appartments ?? 0;

            console.log("apartmentCount:", apartments);
            setAppartmentCount(apartments)

        }
        catch (error: any) {
            console.log("error: ", error)
        }
    }
    useEffect(() => {
        fetchNumsApparts()

    }, [])

    const deleteFileAndUpdateField = async (contactId: string, field: string) => {
        try {
            const res = await axios.get(`${API_URL}/delete-file/${contactId}/${field}`)
            await fetchContacts();
            console.log("fileDeleted: ", res.data)
        }
        catch (error: any) {
            console.log("error: ", error)

        }
    }

    const FILE_FIELDS = [
        'Z_ID_File', 'Z_A3_Agreement', 'Z_A3_Agreement_Single_Owner',
        'Z_A4_Tax_Questionnaire', 'Z_D_Planning_POA', 'Z_D1_Tax_POA',
        'Z_D2_Joint_Building_POA', 'Z_D3_Transfer_Rights_POA', 'Z_D4_Caution_Note_POA',
        'Z_D5_Legal_Proceedings_POA', 'Z_D6_Bank_Inquiry_POA', 'Z_G_Representation_Appointment',
        'Z_K_Trustee_Instructions', 'Z_Caution_Note_Request', 'Z_Form_7009',
        'Z_Form_7005', 'Z_Cancel_Prev_Agreement', 'Z_Agreement_Addendum',
        'Z_Upgrade_Downgrade_Agreement'
    ] as const;

    const FILE_FIELD_LABELS: Record<typeof FILE_FIELDS[number], string> = {
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
    const toFieldLabel = (label: string) => label.replace(/ /g, '_');

    const isAllFilesSigned = (contact: Contact) =>
        FILE_FIELDS.every(field => contact.extensions?.[field] === '1');



    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-6">
                    {/* Stats Bar */}
                    <div className="flex justify-end gap-4 mb-4">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-3 min-w-35.5">
                            <div
                                className={`p-2 rounded-lg ${Number(signaturePercentage) >= 50 ? 'bg-green-100' : 'bg-red-100'
                                    }`}
                            >
                                <svg
                                    className={`w-5 h-5 ${Number(signaturePercentage) >= 50 ? 'text-green-500' : 'text-red-500'
                                        }`}
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
                                <div dir="rtl"
                                    className="text-xs text-slate-400">{` ${signatureLen} מתוך ${filteredContacts.length}`}</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-3 min-w-32.5">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">מספר דיירים</div>
                                <div className="text-2xl font-bold text-slate-800">{filteredContacts.length}</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-3 min-w-32.5">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">מספר דירות</div>
                                <div className="text-2xl font-bold text-slate-800">{appartmentCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Search + Download row - unchanged */}
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="חיפוש לפי שם או ת.ז..."
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all text-sm w-80"
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                    <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative" >
                        <table className="w-full" dir="rtl" >
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-slate-700 sticky top-0 z-30">
                                    {/* # - width: 60px */}
                                    <th className="sticky right-0 z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[60px] min-w-[60px]">#</th>

                                    {/* שם - width: 150px, right: 60 */}
                                    <th className="sticky right-[60px] bg-slate-700 px-3
                                                     py-3 text-center text-xs font-bold
                                                    text-white w-[150px] min-w-[150px] text-[11px]">
                                        <SortableHeader label="שם" field="formattedName" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>

                                    {/* גוש - width: 80px, right: 210 */}
                                    <th className="sticky right-[210px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[80px] min-w-[80px]"><SortableHeader label="גוש"
                                        field="Z_Block" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>

                                    {/* חלקה - width: 80px, right: 290 */}
                                    <th className="sticky right-[290px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[80px] min-w-[80px]">
                                        <SortableHeader label="חלקה" field="Z_Plot" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>

                                    {/* תת חלקה - width: 90px, right: 370 */}
                                    <th className="sticky right-[370px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[90px] min-w-[90px]">
                                        <SortableHeader label="תת חלקה" field="Z_SubPlot" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>

                                    {/* קשיש - width: 80px, right: 460 */}
                                    <th className="sticky right-[460px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[80px] min-w-[80px]">
                                        <SortableHeader label="קשיש" field="Z_Is_Senior" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>

                                    {/* מס' ת.ז - width: 120px, right: 540 */}
                                    <th className="sticky right-[540px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[120px] min-w-[120px] border-l-2 border-slate-500">
                                        <SortableHeader label="מס' ת.ז" field="Z_ID_Number" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="חתום על הסכם" field="Z_Agreement_Signed" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="חלק ברכוש המשותף" field="Z_Joint_Property_Share" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="תאריך חתימה על ההסכם" field="Z_Signing_Date" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>

                                    {/* File column headers - generated from FILE_FIELDS */}
                                    {FILE_FIELDS.map(field => (
                                        <th key={field} className="px-3 py-3 text-center text-xs font-bold text-white">
                                            <SortableHeader label={FILE_FIELD_LABELS[field]} field={field} sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredContacts.map((contact, index) => {
                                    const allSigned = isAllFilesSigned(contact);
                                    const rowBg = allSigned ? 'bg-green-100' : 'bg-white';

                                    return (
                                        <tr
                                            key={contact.id}
                                            className={`transition-colors duration-150 ${allSigned ? 'bg-green-100 hover:bg-green-100' : 'hover:bg-slate-50'
                                                }`}
                                        >

                                            {/* # */}
                                            <td className={`sticky right-0 z-10 ${rowBg} px-3 py-3 text-center w-[60px] min-w-[60px]`}>
                                                <span className="text-slate-600 font-medium text-sm">{index + 1}</span>
                                            </td>


                                            {/* שם */}
                                            <td className={`sticky right-[60px] z-10 ${rowBg} pl-3 pr-10 py-3 text-right w-[150px] min-w-[150px]`}>
                                                <a
                                                    href={`https://my1002519.de1.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block"
                                                >
                                                    <span className="relative inline-block">
                                                        {contact.extensions?.Z_Is_Senior === '1' ? (
                                                            <span className="block truncate text-red-700 rounded text-[11px] font-semibold hover:underline" title={contact.formattedName}>
                                                                {contact.formattedName}
                                                            </span>
                                                        ) : (
                                                            <span className="block truncate font-semibold text-slate-800 text-[11px] hover:underline" title={contact.formattedName}>
                                                                {contact.formattedName}
                                                            </span>
                                                        )}
                                                        {!!contact.extensions?.Z_extra_documents && (
                                                            <span className="absolute top-0 -left-2 text-yellow-500 text-[10px]" title="מסמכים נוספים">★</span>
                                                        )}
                                                    </span>

                                                </a>
                                            </td>


                                            {/* גוש */}
                                            <td className={`sticky right-[210px] z-10 ${rowBg} pl-3 pr-6 py-3 text-right w-[80px] min-w-[80px]`}>
                                                <span className="text-slate-600  text-[11px]">{contact.extensions?.Z_Block}</span>
                                            </td>

                                            {/* חלקה */}
                                            <td className={`sticky right-[290px] z-10 ${rowBg} pl-3 pr-6 py-3 text-right w-[80px] min-w-[80px]`}>
                                                <span className="text-slate-600  text-[11px]">{contact.extensions?.Z_Plot}</span>
                                            </td>

                                            {/* תת חלקה */}
                                            <td className={`sticky right-[370px] z-10 ${rowBg} pl-3 pr-6 py-3 text-right w-[90px] min-w-[90px]`}>
                                                <span className="text-slate-600  text-[11px]">{contact.extensions?.Z_SubPlot}</span>
                                            </td>

                                            {/* קשיש */}
                                            <td className={`sticky right-[460px] z-10 ${rowBg} px-3 py-3 text-center w-[80px] min-w-[80px]`}>
                                                {contact.extensions?.Z_Is_Senior === '1' ? (
                                                    <span className="px-2.5 py-1 rounded text-xs font-semibold  text-[11px]">כן</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded text-xs font-semibold  text-[11px]">לא</span>
                                                )}
                                            </td>

                                            {/* מס' ת.ז */}
                                            <td className={`sticky right-[540px] z-10 ${rowBg} px-3 py-3 text-center w-[120px] min-w-[120px]`}>
                                                <span className="text-slate-600  text-[11px]">{contact.extensions?.Z_ID_Number}</span>
                                            </td>

                                            {/* חתום על הסכם */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    {contact.extensions?.Z_Agreement_Signed === '1' ? (
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    ) :
                                                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                    }
                                                </div>
                                            </td>

                                            {/* חלק ברכוש המשותף */}
                                            <td className="px-3 py-3 text-center">
                                                <span className="text-slate-600 text-sm">{contact.extensions?.Z_Joint_Property_Share}</span>
                                            </td>

                                            {/* תאריך חתימה */}
                                            <td className="px-3 py-3 text-center">
                                                <span className="text-slate-600 text-sm">{contact.extensions?.Z_Signing_Date}</span>
                                            </td>

                                            {/* File cells - generated from FILE_FIELDS */}
                                            {FILE_FIELDS.map(field => (
                                                <td key={field} className="px-3 py-3">
                                                    <FileCell
                                                        value={contact.extensions?.[field]}
                                                        contactId={contact.id}
                                                        field={field}
                                                        fieldLabel={FILE_FIELD_LABELS[field]}
                                                        zIdNumber={contact.extensions?.Z_ID_Number}
                                                        onUpload={addFile}
                                                        onDelete={deleteFileAndUpdateField}
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
                {/* Footer - Total Records */}
                <div className="mt-3 text-end">
                    <div className="text-sm text-slate-500">
                        מציג <span className="font-semibold text-slate-700">{filteredContacts.length}</span> רשומות מתוך <span className="font-semibold text-slate-700">{contacts.length}</span> רשומות
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        <span className="text-yellow-500">★</span> נדרשים מסמכים מיוחדים
                    </div>
                </div>
            </div >
        </div >
    );
}