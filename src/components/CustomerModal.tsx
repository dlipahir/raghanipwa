import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  DialogProps,
} from "@mui/material";
import { createCustomer } from "../api/customer";
import { createSeller } from "@/api/Seller";

interface CustomerModalProps {
  type: String;
  Customerdata: any;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ type, Customerdata }) => {
  const [open, setOpen] = useState(true);
  const [customerName, setCustomerName] = useState(Customerdata?.shop_name);
  const [city, setCity] = useState(Customerdata?.city);
  const [state, setState] = useState(Customerdata?.state);
  const [gstNo, setGstNo] = useState(Customerdata?.gst_no);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent closing on backdrop click or escape key
  const handleDialogClose: DialogProps["onClose"] = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      // Do nothing, prevent close
      return;
    }
    handleClose();
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleCreateCustomer = async () => {
    setLoading(true);
    setError(null);
    try {
      const customerData = {
        shop_name: customerName,
        city,
        state,
        gst_no: gstNo,
      };
      if (type === "Customer") {
        await createCustomer(customerData);
      } else {
        await createSeller(customerData);
      }
      setCustomerName("");
      setCity("");
      setState("");
      setGstNo("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCustomerName("");
    setCity("");
    setState("");
    setGstNo("");
    setError(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
        keepMounted={true}
      >
        <DialogTitle>
          Create {type}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="GST No"
              value={gstNo}
              onChange={(e) => setGstNo(e.target.value)}
              fullWidth
              margin="normal"
            />
            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            color="secondary"
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateCustomer}
            disabled={loading || !customerName}
          >
            {loading ? "Creating..." : `Create ${type}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomerModal;
