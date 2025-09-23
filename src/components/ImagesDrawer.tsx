import React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

interface ImagesDrawerProps {
  open: boolean;
  onClose: () => void;
  images: Blob[][];
  removeBatch: (batchIdx: number) => void;
  removeImage: (batchIdx: number, imgIdx: number) => void;
  currentBatch: number;
  goToReceiptProgress: () => void;
  sending: boolean;
  setImages: (imgs: Blob[][]) => void;
  setCurrentBatch: (idx: number) => void;
}

const ImagesDrawer: React.FC<ImagesDrawerProps> = ({
  open,
  onClose,
  images,
  removeBatch,
  removeImage,
  currentBatch,
  goToReceiptProgress,
  sending,
  setImages,
  setCurrentBatch,
}) => {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { background: "#fafbfc" }
      }}
    >
      <AppBar position="sticky" color="default" elevation={1} sx={{ mb: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ReceiptLongIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" component="div">
              Captured Images
            </Typography>
          </Box>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: { xs: 1, sm: 2 }, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {images.map(
            (batch, batchIdx) =>
              batch.length > 0 && (
                <Box
                  key={batchIdx}
                  sx={{
                    mb: 3,
                    border: "1px solid #eee",
                    borderRadius: 2,
                    p: 2,
                    background: "#fff",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Typography variant="subtitle1">Batch {batchIdx + 1}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeBatch(batchIdx)}
                      sx={{
                        bgcolor: "error.main",
                        color: "#fff",
                        width: 28,
                        height: 28,
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                      title="Remove Batch"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    {batchIdx === currentBatch && (
                      <Typography variant="body2" color="primary" fontWeight="bold" ml={1}>
                        (Current)
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" gap={2}>
                    {batch.map((img, imgIdx) => (
                      <Box key={imgIdx} sx={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Batch ${batchIdx + 1} - Scan ${imgIdx + 1}`}
                          style={{
                            width: 120,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(batchIdx, imgIdx)}
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            bgcolor: "error.main",
                            color: "#fff",
                            width: 24,
                            height: 24,
                            "&:hover": { bgcolor: "error.dark" },
                          }}
                          title="Remove"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pb: 2 }}>
        <Button
            variant="contained"
            color="error"
            onClick={() => {
              setImages([[]]);
              setCurrentBatch(0);
            }}
            disabled={sending}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={goToReceiptProgress}
            disabled={sending}
          >
            {sending ? "Creating..." : "Create Receipt"}
          </Button>
     
        </Box>
      </Box>
    </Dialog>
  );
};

export default ImagesDrawer;