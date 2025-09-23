import { axiosAuth } from "./axios";




// Get signed URLs for invoice image uploads
export const getInvoiceSignedUrls = async (exts: string[][]) => {
  const response = await axiosAuth.post("/invoice/urls", { data: exts });
  return response.data;
};

export const getSignedUrl = async (receipt_id) => {
  const response = await axiosAuth.post("/storage/signed-url", { ext:'pdf',receipt_id});
  return response.data;
};


// Get Processed Invoice Jsons
export const getProcessedInvoiceJsons = async (receipt_id: number) => {
    const response = await axiosAuth.post("/invoice/process", { receipt_id });
    return response.data;
  };
  

// Get all receipts
export const getReceipts = async (page: number) => {
  const response = await axiosAuth.get("/invoice/receipts", {
    params: { page }
  });
  return response.data;
};

// Get receipt
export const getReceipt = async (id: string) => {
  const response = await axiosAuth.get(`/invoice/receipt/${id}`);
  return response.data;
};


export const createRealReceipt = async (receipt_id:any,shopname,data: any) => {
  const response = await axiosAuth.post("/invoice/real-receipt",  { receipt_id,shopname, data });
  return response.data;
};




export const uploadImageToSignedUrl = async (signedUrl: string, img: Blob) => {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
    },
    body: img,
  });
  return response;
};
export const uploadPdfToSignedUrl = async (signedUrl: string, img: Blob) => {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    // headers: {
    //   'Content-Type': 'image/jpeg',
    // },
    body: img,
  });
  return response;
};

export const updateReceipt = async (id: string, data: any) => {
  const response = await axiosAuth.put(`/invoice/receipts/${id}`, data);
  return response.data;
};
