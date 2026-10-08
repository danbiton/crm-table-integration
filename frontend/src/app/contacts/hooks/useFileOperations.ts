import { toast } from "sonner";
import { uploadFile, deleteFile, fetchZip, downloadSingleFile as downloadSingleFileService } from "../../services/contactService";

const toFieldLabel = (label: string) => label.replace(/ /g, "_");

export function useFileOperations(
  accountId: string | null,
  onRefresh: () => Promise<void>,
) {
  const addFile = async (
    file: File,
    contactId: string,
    field: string,
    fieldLabel: string,
    accountId: string,
  ) => {
    try {
      await uploadFile(file, contactId, field, toFieldLabel(fieldLabel || ""), accountId || "");
      await onRefresh();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const deleteFileAndUpdateField = async (
    contactId: string,
    field: string,
    accountId: string,
  ) => {
    try {
      await deleteFile(contactId, field, accountId);
      await onRefresh();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const downloadZip = async (filterType: string, value: string) => {
    if (!accountId) return;
    try {
      const blob = await fetchZip(accountId, filterType, value);
      if (blob.size === 0) {
        toast.error("לא נמצאו מסמכים להורדה");
        return;
      }
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "documents.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("הקובץ הורד בהצלחה");
    } catch (error) {
      toast.error("אירעה שגיאה בהורדת הקובץ");
      console.error("Error downloading zip:", error);
    }
  };

  const downloadSingleFile = async (contactId: string, field: string) => {
    try {
      const blob = await downloadSingleFileService(contactId, field, accountId || "");
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${field}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return { addFile, deleteFileAndUpdateField, downloadZip, downloadSingleFile };
}
