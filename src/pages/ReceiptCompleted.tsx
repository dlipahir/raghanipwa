import { createRealReceipt, getSignedUrl, uploadPdfToSignedUrl } from "@/api/Invoice";
import ClientContactModal from "@/components/ClientContactModal";
import { generatePdf } from "@/utils/generatePdf";
import React, { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function ReceiptCompleted() {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const location = useLocation();
  const { receipt_id, data, shopname } = location.state || {};
  const [modalOpen, setModalOpen] = useState(false);
  const [realReceiptId, setRealReceiptId] = useState<string | null>(null);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      navigate("/", { replace: true });
    };
  }, [navigate]);

  useEffect(() => {
    const renderPdf = async () => {
        
        try {
          console.log("dataaa", receipt_id, shopname, data);
          const { real_receipt_id } = await createRealReceipt(receipt_id, shopname, data);
          setRealReceiptId(real_receipt_id);
          const blob = await generatePdf(real_receipt_id, shopname, data, "blob");
          const arrayBuffer = await (blob as Blob).arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const page = await pdf.getPage(1);

          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Failed to get canvas context");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          setImgSrc(canvas.toDataURL("image/png"));

          const signedUrlsRes = await getSignedUrl(real_receipt_id);
          const { url } = signedUrlsRes as any;
          await uploadPdfToSignedUrl(url.url, blob as Blob);
        } catch (error) {
          console.error("Error rendering PDF or uploading:", error);
        }
    };

    renderPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    generatePdf(receipt_id, shopname, data, "download");
  };
  const handleShare = () => {
    generatePdf(receipt_id, shopname, data, "share");
  };

  return (
    <Box p={3}>
      {imgSrc ? (
        <>
          <Box
            component="img"
            src={imgSrc}
            alt="PDF as Image"
            sx={{
              width: "100%",
              height: "auto",
              border: 1,
              borderColor: "red.300",
              borderRadius: 1,
              mb: 2,
            }}
          />
          <Stack spacing={2}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              startIcon={
                <Box
                  component="img"
                  src="whatsapp.svg"
                  sx={{ width: 24, height: 24 }}
                  alt="Whatsapp"
                />
              }
              onClick={() => setModalOpen(true)}
            >
              Whatsapp
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={
                <Box
                  component="img"
                  src="scan.svg"
                  sx={{ width: 24, height: 24, filter: "invert(1) brightness(2)" }}
                  alt="Scan"
                />
              }
              onClick={() => navigate("/crop1")}
            >
              Scan Invoice
            </Button>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" fullWidth onClick={handleDownload}>
                Download
              </Button>
              <Button variant="outlined" fullWidth onClick={handleShare}>
                Share
              </Button>
            </Stack>
          </Stack>
          <ClientContactModal
            receipt_no={realReceiptId}
            client_name={shopname}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}