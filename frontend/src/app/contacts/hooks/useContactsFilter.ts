
import { useMemo, useState } from "react";
import { Contact } from "../../../types/contact";
export default function useContactsFilter(sortedContacts: Contact[], searchQuery: string

) {

    return useMemo(() => {
        if (!searchQuery) return sortedContacts ?? [];

        return (sortedContacts ?? []).filter(contact =>
            contact.formattedName?.includes(searchQuery) ||
            contact.extensions?.Z_ID_Number?.includes(searchQuery)
        );
    }, [sortedContacts, searchQuery]);



}