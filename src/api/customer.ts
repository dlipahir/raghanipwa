import {axiosAuth} from './axios';




// Create a new customer
export const createCustomer = async (customerData) => {
  const response = await axiosAuth.post('/customers', customerData);
  return response.data;
};

// Get all customers
export const getCustomers = async () => {
  const response = await axiosAuth.get('/customers');
  return response.data;
};

// Get a single customer by ID
export const getCustomerById = async (id: string) => {
  const response = await axiosAuth.get(`/customers/${id}`);
  return response.data;
};

// Update a customer by ID
export const updateCustomer = async (id: string) => {
  const response = await axiosAuth.put(`/customers/${id}`, customerData);
  return response.data;
};

// Delete a customer by ID
export const deleteCustomer = async (id: string) => {
  const response = await axiosAuth.delete(`/customers/${id}`);
  return response.data;
};


