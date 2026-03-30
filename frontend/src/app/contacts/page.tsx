"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../lib/api";
import { Contact } from "../../types/contact";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import SortableHeader, { SortDirection } from "./components/SortableHeader";
import { useContactSort } from "./hooks/useContactSort";
import useContactsFilter from "./hooks/useContactsFilter";

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



    // const fetchContacts = async (sortField?: string, sortDir?: string) => {


    //     console.log("account:", accountId);
    //     if (!accountId) {
    //         console.error("No accountId provided in URL!");
    //         return;
    //     }
    //     try {
    //         let url = `${API_URL}/contacts?accountId=${accountId}`;
    //         if (sortField && sortDir) {
    //             url += `&sortField=${sortField}&sortDir=${sortDir}`;
    //         }
    //         console.log("url: ", url)
    //         const response = await axios.get(url);
    //         console.log("Fetched contacts:", response.data);
    //         setContacts(response.data);
    //         console.log("contacts: ", contacts)
    //     } catch (error) {
    //         console.error("Error fetching contacts:", error);
    //     }
    // };
    const fetchContacts = async () => {


        console.log("account:", accountId);
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

    // useEffect(() => {
    //     if (sortField && sortDirection) {
    //         fetchContacts(sortField, sortDirection);
    //     }
    // }, [sortField, sortDirection]);

    useEffect(() => {
        fetchContacts();
    }, [searchParams]);

    //sort in client side

    const sortedContacts = useContactSort(contacts, sortField, sortDirection);
    console.log("sortContacts:", sortedContacts)

    // const residents = contacts.filter(contact => contact?.functionalTitle === '007')
    // console.log("totalResidents: ", residents)

    //filter
    const filteredContacts = useContactsFilter(sortedContacts, searchQuery)

    //signaturePercentage
    const signatureLen = filteredContacts.filter(contact => contact.extensions?.Z_Agreement_Signed === '1').length
    const signaturePercentage = ((signatureLen / filteredContacts.length) * 100).toFixed(2)

    const addFile = async (file: File, contactId: string, field: string, zIdNumber?: string) => {

        const formData = new FormData();
        formData.append("file", file);
        formData.append("contactId", contactId);
        formData.append("field", field)
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
                                <div className="text-xs text-slate-400">{`${signatureLen} מתוך ${filteredContacts.length}`}</div>
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
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-semibold transition-all text-sm hover:ring-2 hover:ring-blue-500 hover:ring-offset-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            הורד קבצים
                        </button>
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
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full" dir="rtl">
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-slate-700">
                                    {/* # - width: 60px */}
                                    <th className="sticky right-0 z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[60px] min-w-[60px]">#</th>

                                    {/* שם - width: 150px, right: 60 */}
                                    <th className="sticky right-[60px] bg-slate-700 px-3
                                                     py-3 text-center text-xs font-bold
                                                    text-white w-[150px] min-w-[150px]">
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
                                    <th className="sticky right-[540px] z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[120px] min-w-[120px]">
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
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="צילום ת.ז וספח" field="Z_ID_File" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח א'3 כתב הסכמת בן/בת זוג" field="Z_A3_Agreement" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח א'3 תצהיר בעלים יחיד" field="Z_A3_Agreement_Single_Owner" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח א'4 שאלון מיסוי" field="Z_A4_Tax_Questionnaire" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח ד' ייפוי כוח לתכנון" field="Z_D_Planning_POA" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח ד'1 ייפוי כוח מס" field="Z_D1_Tax_POA" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח ד'2 ייפוי כוח לרישום/מחיקה בית משותף" field="Z_D2_Joint_Building_POA" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח ד'3 ייפוי כוח העברת זכויות" field="Z_D3_Transfer_Rights_POA" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח ד'4 ייפוי כוח לרישום הע״א" field="Z_D4_Caution_Note_POA" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח ד'5 ייפוי כוח הליכים משפטיים" field="Z_D5_Legal_Proceedings_POA" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח ד'6 ייפוי כוח לפנייה לבנק" field="Z_D6_Bank_Inquiry_POA" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח ז' כתב מינוי נציגות" field="Z_G_Representation_Appointment" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="נספח יא' כתב הוראות לנאמן" field="Z_K_Trustee_Instructions" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="בקשה לרישום הע״א" field="Z_Caution_Note_Request" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="טופס 7009" field="Z_Form_7009" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="טופס 7005" field="Z_Form_7005" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="הסכם לביטול הסכם קודם" field="Z_Cancel_Prev_Agreement" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="תוספות/ נספח להסכם" field="Z_Agreement_Addendum" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">
                                        <SortableHeader label="הסכם שדרוג/ שנמוך" field="Z_Upgrade_Downgrade_Agreement" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                                    </th>
                                    <th className="sticky right-0 z-20 bg-slate-700 px-3 py-3 text-center text-xs font-bold text-white w-[60px] min-w-[60px]">
                                        הורדה
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredContacts.map((contact, index) => (
                                    <tr key={contact.id} className="hover:bg-slate-50 transition-colors duration-150">

                                        {/* # */}
                                        <td className="sticky right-0 z-10 bg-white px-3 py-3 text-center w-[60px] min-w-[60px]">
                                            <span className="text-slate-600 font-medium text-sm">{index + 1}</span>
                                        </td>


                                        {/* שם */}
                                        <td className="sticky right-[60px] z-10 bg-white pl-3 pr-10 py-3 text-right w-[150px] min-w-[150px]">
                                            <span className="font-semibold text-slate-800 text-sm">{contact.formattedName}</span>
                                        </td>


                                        {/* גוש */}
                                        <td className="sticky right-[210px] z-10 bg-white pl-3 pr-6 py-3 text-right w-[80px] min-w-[80px]">
                                            <span className="text-slate-600 text-sm">{contact.extensions?.Z_Block}</span>
                                        </td>

                                        {/* חלקה */}
                                        <td className="sticky right-[290px] z-10 bg-white pl-3 pr-6 py-3 text-right w-[80px] min-w-[80px]">
                                            <span className="text-slate-600 text-sm">{contact.extensions?.Z_Plot}</span>
                                        </td>

                                        {/* תת חלקה */}
                                        <td className="sticky right-[370px] z-10 bg-white pl-3 pr-6 py-3 text-right w-[90px] min-w-[90px]">
                                            <span className="text-slate-600 text-sm">{contact.extensions?.Z_SubPlot}</span>
                                        </td>

                                        {/* קשיש */}
                                        <td className="sticky right-[460px] z-10 bg-white px-3 py-3 text-center w-[80px] min-w-[80px]">
                                            {contact.extensions?.Z_Is_Senior === '1' ? (
                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                            )}
                                        </td>

                                        {/* מס' ת.ז */}
                                        <td className="sticky right-[540px] z-10 bg-white px-3 py-3 text-center w-[120px] min-w-[120px]">
                                            <span className="text-slate-600 text-sm">{contact.extensions?.Z_ID_Number}</span>
                                        </td>

                                        {/* {חתום על הסכם } */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {contact.extensions?.Z_Agreement_Signed === '1' ? (
                                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                ) :
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                }
                                            </div>
                                        </td>

                                        {/* חלק ברכוש המשותף - Z_Joint_Property_Share */}
                                        <td className="px-3 py-3 text-center">
                                            <span className="text-slate-600 text-sm">{contact.extensions?.Z_Joint_Property_Share}</span>
                                        </td>

                                        {/* תאריך חתימה - Z_Signing_Date */}
                                        <td className="px-3 py-3 text-center">
                                            <span className="text-slate-600 text-sm">{contact.extensions?.Z_Signing_Date}</span>
                                        </td>

                                        {/* צילום ת.ז וספח - Z_ID_File — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_ID_File", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_ID_File === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_ID_File")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח א'3 כתב הסכמת בן/בת זוג - Z_A3_Agreement — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_A3_Agreement", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_A3_Agreement === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_A3_Agreement")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח א'3 תצהיר בעלים יחיד - Z_A3_Agreement_Single_Owner — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_A3_Agreement_Single_Owner", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_A3_Agreement_Single_Owner === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_A3_Agreement_Single_Owner")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח א'4 שאלון מיסוי - Z_A4_Tax_Questionnaire — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_A4_Tax_Questionnaire", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_A4_Tax_Questionnaire === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_A4_Tax_Questionnaire")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח ד' ייפוי כוח לתכנון - Z_D_Planning_POA — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_D_Planning_POA", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_D_Planning_POA === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_D_Planning_POA")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח ד'1 ייפוי כוח מס - Z_D1_Tax_POA — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_D1_Tax_POA", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_D1_Tax_POA === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_D1_Tax_POA")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח ד'2 - Z_D2_Joint_Building_POA — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_D2_Joint_Building_POA", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_D2_Joint_Building_POA === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_D2_Joint_Building_POA")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח ד'3 - Z_D3_Transfer_Rights_POA — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_D3_Transfer_Rights_POA", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_D3_Transfer_Rights_POA === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_D3_Transfer_Rights_POA")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח ד'4 - Z_D4_Caution_Note_POA — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_D4_Caution_Note_POA", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_D4_Caution_Note_POA === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_D4_Caution_Note_POA")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח ד'5 - Z_D5_Legal_Proceedings_POA — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_D5_Legal_Proceedings_POA", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_D5_Legal_Proceedings_POA === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_D5_Legal_Proceedings_POA")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח ד'6 - Z_D6_Bank_Inquiry_POA — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_D6_Bank_Inquiry_POA", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_D6_Bank_Inquiry_POA === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_D6_Bank_Inquiry_POA")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח ז' - Z_G_Representation_Appointment — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_G_Representation_Appointment", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_G_Representation_Appointment === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_G_Representation_Appointment")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* נספח יא' - Z_K_Trustee_Instructions — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_K_Trustee_Instructions", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_K_Trustee_Instructions === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_K_Trustee_Instructions")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* בקשה לרישום הע"א - Z_Caution_Note_Request — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_Caution_Note_Request", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_Caution_Note_Request === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_Caution_Note_Request")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* טופס 7009 - Z_Form_7009 — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_Form_7009", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_Form_7009 === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_Form_7009")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* טופס 7005 - Z_Form_7005 — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_Form_7005", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_Form_7005 === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_Form_7005")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* הסכם לביטול הסכם קודם - Z_Cancel_Prev_Agreement — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_Cancel_Prev_Agreement", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_Cancel_Prev_Agreement === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_Cancel_Prev_Agreement")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* תוספות/ נספח להסכם - Z_Agreement_Addendum — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_Agreement_Addendum", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_Agreement_Addendum === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_Agreement_Addendum")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>

                                        {/* הסכם שדרוג/ שנמוך - Z_Upgrade_Downgrade_Agreement — Attachment: YES */}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">

                                                {/* סיכה - תמיד מוצגת */}
                                                <label className="p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center justify-center group" title="העלה קובץ">
                                                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addFile(e.target.files[0], contact.id, "Z_Upgrade_Downgrade_Agreement", contact.extensions?.Z_ID_Number); }} />
                                                    <svg className="w-4.5 h-4.5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </label>

                                                {contact.extensions?.Z_Upgrade_Downgrade_Agreement === '1' ? (
                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="צפה בקובץ"
                                                            className="p-1 hover:bg-slate-100 rounded inline-flex"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-green-600"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteFileAndUpdateField(contact.id, "Z_Upgrade_Downgrade_Agreement")}
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
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                )}

                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <a
                                                href={`https://my1002465.de1.test.crm.cloud.sap/go/detail/mdcontact?nodeid=${contact.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="הורד כל הקבצים"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors group"
                                            >
                                                <svg
                                                    className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
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
                                                <span className="text-xs font-semibold">הורד</span>
                                            </a>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        </div >
    );
}