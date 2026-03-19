export interface Contact {
    id: string;
    formattedName: string;
    extensions?: {
        TZ?: boolean;
    };
    attachments?: {
        fileName?: string;
    }[];
}