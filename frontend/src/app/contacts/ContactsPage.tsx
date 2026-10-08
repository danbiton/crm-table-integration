"use client";

import { useMemo, useState } from "react";
import { API_URL } from "../../lib/api";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { SortDirection } from "./components/SortableHeader";
import { useContactSort } from "./hooks/useContactSort";
import useContactsFilter from "./hooks/useContactsFilter";
import { useContacts } from "./hooks/useContacts";
import { useFileOperations } from "./hooks/useFileOperations";
import StatsBar from "./components/StatsBar";
import ContactsTable from "./components/ContactsTable";
import SignatureModal from "./components/SignatureModal";

export default function ContactsPage() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("accountId") || searchParams.get("guid");

  const { contacts, fetchContacts, apartmentCount } = useContacts(accountId);
  const { addFile, deleteFileAndUpdateField, downloadZip, downloadSingleFile } =
    useFileOperations(accountId, fetchContacts);

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const [searchQuery, setSearchQuery] = useState("");

  const sortedContacts = useContactSort(contacts, sortField, sortDirection);
  const filteredContacts = useContactsFilter(sortedContacts, searchQuery);

  const signatureLen = filteredContacts.filter(
    (c) => c.extensions?.Z_Signed === "1",
  ).length;
  const signaturePercentage =
    filteredContacts.length > 0
      ? ((signatureLen / filteredContacts.length) * 100).toFixed(2)
      : "0.00";
  
     
  const residentOptions = useMemo(
    () => contacts.map((c) => ({ value: c.id, label: c.formattedName })),
    [contacts],
  );

  const plotOptions = useMemo(
    () =>
      [
        ...new Set(
          contacts.map((c) => c.extensions?.Z_Part).filter(Boolean) as string[],
        ),
      ].map((plot) => ({ value: plot, label: `חלקה ${plot}` })),
    [contacts],
  );

  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const signatureByPlot = useMemo(() => {
    const result = plotOptions.map(({ value: plot }) => {
      const residentsInPlot = contacts.filter((c) => c.extensions?.Z_Part === plot);
      const total = residentsInPlot.length;
      const signed = residentsInPlot.filter((c) => c.extensions?.Z_Signed === "1").length;
      const percentage = total > 0 ? Math.round((signed / total) * 100) : 0;
      return { plot, total, signed, percentage };
    });
    return result.sort((a, b) => Number(a.plot) - Number(b.plot));
  }, [contacts, plotOptions]);

  const updateSignedField = async (
    contactId: string,
    currentValue: string | undefined,
  ) => {
    const newValue = currentValue === "1" ? "0" : "1";
    try {
      await axios.get(`${API_URL}/update-field/${contactId}/Z_Signed/${newValue}`);
      await fetchContacts();
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-full mx-auto">
        <StatsBar
          signaturePercentage={signaturePercentage}
          signatureLen={signatureLen}
          totalFiltered={filteredContacts.length}
          apartmentCount={apartmentCount}
          onSignatureClick={() => setShowSignatureModal(true)}
        />

        <ContactsTable
          contacts={contacts}
          filteredContacts={filteredContacts}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          accountId={accountId || ""}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          residentOptions={residentOptions}
          plotOptions={plotOptions}
          onDownloadZip={downloadZip}
          onUpload={addFile}
          onDelete={deleteFileAndUpdateField}
          onDownloadFile={downloadSingleFile}
          onUpdateSigned={updateSignedField}
        />

        {showSignatureModal && (
          <SignatureModal
            signatureByPlot={signatureByPlot}
            onClose={() => setShowSignatureModal(false)}
          />
        )}
      </div>
    </div>
  );
}
