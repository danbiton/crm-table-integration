import { Suspense } from "react";
import ContactsPage from "./ContactsPage";

export default function Page() {
    return (
        <Suspense fallback={<div>טוען...</div>}>
            <ContactsPage />
        </Suspense>
    );
}