import { useEffect, useState, type FC } from "react";
import axios from "axios"
import { API_URL } from "../config/api";
interface Contacts {
    id: string
    formattedName: string
    extensions?: { TZ?: boolean }
    attachments?: { fileName?: string }[]
}

const baseUrl = API_URL
const ContactsTable: FC = () => {
    const [contacts, setContacts] = useState<Contacts[]>([])

    const getAccountId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('accountId') || params.get('guid');
    };
    const fetchContacts = async () => {
         const accountId = getAccountId(); 
         console.log("account:", accountId)
         if (!accountId) {
            console.error("No accountId provided in URL!");
            return;
        }
        try {
            const response = await axios.get<Contacts[]>(`${baseUrl}/contacts?accountId=${accountId}`)
            console.log("Fetched contacts:", response.data)
            setContacts(response.data)

        }
        catch (error) {
            console.error("Error fetching contacts:", error)
        }
    }
    useEffect(() => {
        fetchContacts()
    }, [])

    const addFile = async (file: File, contactId: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contactId", contactId)
        try {
            const response = await axios.post(`${baseUrl}/upload-id`, formData, {
                headers: {
                    "Content-Type": "multiport/form-data"

                }
            })
            await fetchContacts()



            console.log("File uploading response:", response.data)

        } catch (error) {
            console.error("Error uploading file:", error)
        }
    }




   return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            הורד קבצים
                        </button>

                        <input
                            type="text"
                            placeholder="חיפוש לפי שם או ת.ז..."
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white transition-all text-sm w-80"
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Table Header */}
                            <thead>
                                <tr className="bg-slate-700">
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">#</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-white">שם</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">ת.ז</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ חתימות על הסכם</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ חלק ברכוש המשותף</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">תאריך התחייבות</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ נרשמה חנ"א</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">דיווח</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ מאושר לשכירות</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ אצל</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ צילום ת.ז ופנה</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬆️ כח לירישום חנ"א</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ כח להליכים משפטיים</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ כח לפניה לבנק</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">רכתב מיני ביצוע</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ כתב הסכמה ב/כ בת זוג</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ תצהיר בעלים יחיד</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">שאלון מיסוי</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ כח לנכון</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ כח העברת זכויות</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">⬇️ כח למחיקה בית משותף</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">הוראות לנאמן</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-white">פעולות</th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody className="divide-y divide-slate-100">
                                {contacts.map((contact, index) => {
                                    const lastAttachment = contact.attachments?.[contact.attachments.length - 1];
                                    const hasTZ = contact.extensions?.TZ;

                                    return (
                                        <tr key={contact.id} className="hover:bg-slate-50 transition-colors duration-150">
                                            {/* Index */}
                                            <td className="px-3 py-3 text-center">
                                                <span className="text-slate-600 font-medium text-sm">{index + 1}</span>
                                            </td>

                                            {/* Name */}
                                            <td className="px-3 py-3">
                                                <span className="font-semibold text-slate-800 text-sm">{contact.formattedName}</span>
                                            </td>

                                            {/* ID with Eye Icon */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <span className="text-slate-600 text-xs">127267404</span>
                                                </div>
                                            </td>

                                            {/* חתימות על הסכם */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* חלק ברכוש המשותף */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* תאריך התחייבות */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="text-slate-600 text-xs">24.5.2025</span>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* נרשמה חנ"א */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* דיווח */}
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-slate-900 font-semibold text-xs">11%</span>
                                                    <span className="text-xs text-slate-500">הכל</span>
                                                </div>
                                            </td>

                                            {/* מאושר לשכירות */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* אצל */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* צילום ת.ז ופנה - Using your actual data */}
                                            <td className="px-3 py-3">
                                                <div className="space-y-1">
                                                    <label className="relative cursor-pointer">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files.length > 0) {
                                                                    addFile(e.target.files[0], contact.id);
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex items-center justify-center gap-1">
                                                            {hasTZ ? (
                                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">לא</span>
                                                            )}
                                                            <button className="p-1 hover:bg-slate-100 rounded">
                                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                            <button className="p-1 hover:bg-slate-100 rounded">
                                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </label>
                                                    {lastAttachment?.fileName && (
                                                        <div className="text-center">
                                                            <span className="text-xs text-green-700 truncate block max-w-xs">
                                                                {lastAttachment.fileName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* כח לירישום חנ"א */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">כן</span>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Remaining columns - all similar structure */}
                                            {[...Array(10)].map((_, i) => (
                                                <td key={i} className="px-3 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className={`px-2.5 py-1 ${i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded text-xs font-semibold`}>
                                                            {i % 2 === 0 ? 'כן' : 'לא'}
                                                        </span>
                                                        <button className="p-1 hover:bg-slate-100 rounded">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-1 hover:bg-slate-100 rounded">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            ))}

                                            {/* Actions - Download Row */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center justify-center">
                                                    <button className="p-1.5 hover:bg-slate-100 text-slate-500 rounded transition-colors" title="הורד שורה">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ContactsTable 