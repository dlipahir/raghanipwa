import { Dialog, DialogTitle } from '@mui/material'
import React from 'react'
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from '@mui/material';
import { DialogContent } from '@mui/material';
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
import { Button } from '@mui/material';
import { DialogActions } from '@mui/material';

interface ImageModalProps {
    openImages: boolean;
    handleCloseImages: () => void;
    files: string[];
}

const ImageModal: React.FC<ImageModalProps> = ({ openImages, handleCloseImages, files }) => {
  return (
      <Dialog
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
          {Array.isArray(files) && files.length > 0 ? (
            <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
              {files.map((url: string, idx: number) => (
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
      </Dialog>
  )
}

export default ImageModal;