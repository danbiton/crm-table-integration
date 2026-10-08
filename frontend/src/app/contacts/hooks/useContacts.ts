import { useState, useEffect } from "react";
import { Contact } from "../../../types/contact";
import { getContacts, getApartmentCount } from "../../services/contactService";

export function useContacts(accountId: string | null) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [apartmentCount, setApartmentCount] = useState<number>(0);

  const fetchContacts = async () => {
    if (!accountId) return;
    try {
      const data = await getContacts(accountId);
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchApartmentCount = async () => {
    if (!accountId) return;
    try {
      const count = await getApartmentCount(accountId);
      setApartmentCount(count);
    } catch (error) {
      console.error("Error fetching apartment count:", error);
    }
  };

  useEffect(() => {
    if (!accountId) return;
    fetchContacts();
    fetchApartmentCount();
  }, [accountId]);

  return { contacts, fetchContacts, apartmentCount };
}
