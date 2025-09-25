import { axiosAuth } from './axios';



// Get all Invoices
export const getInvoices = async (page=1) => {
  const response = await axiosAuth.get(`/master/invoices`, {
    params: { page }
  });
  return response.data;
};

export const getReceipts= async (page=1) => {
  const response = await axiosAuth.get(`/master/receipts`, {
    params: { page }
  });
  return response.data;
};

// Seller APIs
export const getSellers = async (page=1) => {
  const response = await axiosAuth.get('/master/sellers',{
    params: { page }
  });
  return response.data;
};



// Customer APIs
export const getCustomers = async (page=1) => {
  const response = await axiosAuth.get('/master/customers',{
    params: { page }
  });
  return response.data;
};





