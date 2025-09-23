import { axiosAuth } from './axios';

// Create a new seller
export const createSeller = async (sellerData: any) => {
  const response = await axiosAuth.post('/sellers', sellerData);
  return response.data;
};

// Get all sellers
export const getSellers = async () => {
  const response = await axiosAuth.get('/sellers');
  return response.data;
};

// Get a single seller by ID
export const getSellerById = async (id: string) => {
  const response = await axiosAuth.get(`/sellers/${id}`);
  return response.data;
};

// Update a seller by ID
export const updateSeller = async (id: string, sellerData: any) => {
  const response = await axiosAuth.put(`/sellers/${id}`, sellerData);
  return response.data;
};

// Delete a seller by ID
export const deleteSeller = async (id: string) => {
  const response = await axiosAuth.delete(`/sellers/${id}`);
  return response.data;
};
