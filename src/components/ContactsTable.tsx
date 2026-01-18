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
        <div className="p-6">
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-300">
                <table className="w-full text-sm text-gray-800">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold">שם</th>
                            <th className="px-6 py-3 text-left font-semibold">העלאת ת.ז</th>
                            <th className="px-6 py-3 text-left font-semibold">סטטוס</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {contacts.map((contact) => {
                            const lastAttachment =
                                contact.attachments?.[contact.attachments.length - 1];

                            return (
                                <tr key={contact.id} className="hover:bg-blue-50">
                                    <td className="px-6 py-4 font-medium">
                                        {contact.formattedName}
                                    </td>

                                    <td className="px-6 py-4">
                                        <input
                                            type="file"
                                            className="block w-full text-sm text-gray-700 border border-gray-300 
                                   rounded-lg cursor-pointer focus:outline-none"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    addFile(e.target.files[0], contact.id);
                                                }
                                            }}
                                        />


                                        {lastAttachment?.fileName && (
                                            <span className="text-sm text-gray-600">
                                                {lastAttachment.fileName}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-green-600">
                                        {contact.extensions?.TZ ? "Yes" : "No"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

    )
}
export default ContactsTable 