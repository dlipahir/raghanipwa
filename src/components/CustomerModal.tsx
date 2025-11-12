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
  IconButton,
  Grid,
} from "@mui/material";
import { createCustomer } from "../api/customer";
import { createSeller } from "@/api/Seller";
import CloseIcon from "@mui/icons-material/Close";
import ImageModal from "./ImageModal";

interface CustomerModalProps {
  type: String;
  Customerdata: any;
  handleCreate: any;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  type,
  Customerdata,
  handleCreate,
}) => {
  const [open, setOpen] = useState(true);
  const [customerName, setCustomerName] = useState(Customerdata?.shop_name);
  const [city, setCity] = useState(Customerdata?.city);
  const [state, setState] = useState(Customerdata?.state);
  const [gstNo, setGstNo] = useState(Customerdata?.gst_no);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openImages, setOpenImages] = useState(false);

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
      const updatedcustomerData = {
        shop_name: customerName,
        city,
        state,
        gst_no: gstNo,
      };
      if (type === "customer") {
        const data = await createCustomer(updatedcustomerData);
        handleCreate(Customerdata._id, "customer", data);
      } else {
        const data = await createSeller(updatedcustomerData);
        handleCreate(Customerdata._id, "seller", data);
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

  // Images Dialog
  const handleOpenImages = () => {
    setOpenImages(true);
  };

  const handleCloseImages = () => {
    setOpenImages(false);
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
              label={`${type} Name`}
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
            {Array.isArray(Customerdata?.files) && Customerdata?.files?.length > 0 && (
              <Box sx={{ mt: 2, mb: 1 }}>
                <Button
                  variant="outlined"
                  color="info"
                  onClick={handleOpenImages}
                  fullWidth
                  size="small"
                >
                  View Images ({Customerdata.files.length})
                </Button>
              </Box>
            )}
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
      <ImageModal
        openImages={openImages}
        handleCloseImages={handleCloseImages}
        files={Customerdata?.files}
      />

      {/* Images Viewing Dialog - fullscreen and scrollable */}
      {/* <Dialog
        open={openImages}
        onClose={handleCloseImages}
        fullScreen
        scroll="paper"
        PaperProps={{
          sx: {
            background: "#fafafa",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 0,
            pl: 2,
            background: "#fafafa",
          }}
        >
          Images
          <IconButton
            onClick={handleCloseImages}
            size="large"
            aria-label="close"
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: { xs: 1.5, sm: 3 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100vw",
            minHeight: 200,
            height: "100%",
            overflowY: "auto",
          }}
        >
          {Array.isArray(Customerdata?.files) && Customerdata?.files.length > 0 ? (
            <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
              {Customerdata.files.map((url: string, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    width: "100%",
                    mb: 3,
                    border: "1px solid #eeeeee",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 1,
                    background: "#fff",
                  }}
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`attachment-${idx + 1}`}
                      style={{
                        width: "100%",
                        maxHeight: 600,
                        objectFit: "contain",
                        display: "block",
                        background: "#efefef",
                        cursor: "pointer",
                      }}
                      loading="lazy"
                    />
                  </a>
                  <Box sx={{ p: 1, textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, wordBreak: "break-all", display: "block" }}
                    >
                      Image {idx + 1}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" align="center">
              No images available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, background: "#fafafa" }}>
          <Button onClick={handleCloseImages} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};

export default CustomerModal;
