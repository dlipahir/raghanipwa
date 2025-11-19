import { axiosAuth } from "./axios";

// Create a new client contact
export const createClientContact = async (contactData: any) => {
  const response = await axiosAuth.post("/clientcontact", contactData);
  return response.data;
};

// Get all client contacts
export const getAllClientContacts = async () => {
  const response = await axiosAuth.get("/clientcontact");
  return response.data;
};

// Get client contacts by name (query param: name)
export const getClientContactsByName = async (name: string) => {
  const response = await axiosAuth.get("/clientcontact/search", {
    params: { name }
  });
  return response.data;
};

// Get a single client contact by ID
export const getClientContactById = async (id: string | number) => {
  const response = await axiosAuth.get(`/clientcontact/${id}`);
  return response.data;
};

// Update a client contact by ID
export const updateClientContact = async (id: string | number, updateData: any) => {
  const response = await axiosAuth.put(`/clientcontact/${id}`, updateData);
  return response.data;
};

// Delete a client contact by ID
export const deleteClientContact = async (id: string | number) => {
  const response = await axiosAuth.delete(`/clientcontact/${id}`);
  return response.data;
};



// Send a WhatsApp message to a client contact using a backend endpoint
export const sendWhatsappToClientContact = async ( phoneNumber , shop_name, receipt_id ) => {
  const response = await axiosAuth.post(`/clientcontact/send-whatsapp-pdf`, {  phoneNumber, shop_name, receipt_id  });
  return response.data;
};
