import axios from "axios";
import { API_URL } from "../../lib/api";

const api = axios.create({ baseURL: API_URL });

export const getContacts = async (accountId: string) => {
  const response = await api.get(`/contacts?accountId=${accountId}`);
  return response.data;
};



export const uploadFile = async (
  file: File,
  contactId: string,
  field: string,
  fieldLabel: string,
  accountId: string
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("contactId", contactId);
  formData.append("field", field);
  formData.append("fieldLabel", fieldLabel);
  formData.append("accountId", accountId);

  const response = await api.post(
    `/upload-id`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getApartmentCount =  async (accountId: string) => {
    try {
      const response = await api.get(
        `account?accountId=${accountId}`,
      );
      const apartments = response.data?.[0]?.extensions?.Z_Appartments ?? 0;
      return apartments;
    } catch(error: any){
      console.log("Error", error);
      return 0;
    }
  }

  export const deleteFile = async (contactId: string, field: string, accountId: string) => {
    const response = await api.get(
      `/delete-file/${contactId}/${field}?accountId=${accountId}`
    );
    return response.data;
  };

  export const fetchZip = async (
  accountId: string,
  filterType: string,
  value: string,
): Promise<Blob> => {
  const { data } = await api.get(
    `/download-zip?accountId=${accountId}&filterType=${filterType}&value=${value}`,
    { responseType: "blob" },
  );
  return new Blob([data], { type: "application/zip" });
};

export const downloadSingleFile = async (
  contactId: string,
  field: string,
  accountId: string,
): Promise<Blob> => {
  const { data } = await api.get(
    `/download-file/${contactId}/${field}?accountId=${accountId}`,
    { responseType: "blob" },
  );
  return new Blob([data], { type: "application/pdf" });
};