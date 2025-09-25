import { axiosAuth } from './axios';



// Get all sellers
export const getSellers = async () => {
  const response = await axiosAuth.get('filter/sellers');
  return response.data;
};
// Get all sellers
export const getCustomers = async () => {
  const response = await axiosAuth.get('filter/customers');
  return response.data;
};

export const getCustomerSellerCounts = async () => {
  const response = await axiosAuth.get('filter/scounts');
  return response.data;
};

export const getFilterCount = async ({
  bill_from,
  bill_to,
  customerid,
  sellerid,
}: {
  bill_from?: string;
  bill_to?: string;
  customerid?: string;
  sellerid?: string;
}) => {
  const params: any = {};
  if (bill_from) params.bill_from = bill_from;
  if (bill_to) params.bill_to = bill_to;
  if (customerid) params.customerid = customerid;
  if (sellerid) params.sellerid = sellerid;

  const response = await axiosAuth.get('filter/count', { params });
  return response.data;
};




