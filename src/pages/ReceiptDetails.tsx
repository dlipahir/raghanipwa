import { createRealReceipt, getReceipt } from "@/api/Invoice";
import { generatePdf } from "@/utils/generatePdf";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pdfjs } from "react-pdf";
import ClientContactModal from "@/components/ClientContactModal";
import { Box, Button } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// pdf.js worker required for render
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const ReceiptDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Try to get real_receipt_id from location.state or from query param
  let real_receipt_id: string | undefined = undefined;
  if (location.state && (location.state as any).real_receipt_id) {
    real_receipt_id = (location.state as any).real_receipt_id;
  } else {
    // fallback: try to get from search params
    const params = new URLSearchParams(location.search);
    real_receipt_id = params.get("real_receipt_id") || undefined;
  }

  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgSrcArr, setImgSrcArr] = useState<string[]>([]);

  // Render ALL pages of PDF as images
  useEffect(() => {
    const renderAllPages = async () => {
      if (!real_receipt_id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const loadingTask = pdfjs.getDocument(
          `https://storage.googleapis.com/raghaninvoices/Receipt/Receipt_${real_receipt_id}.pdf`
        );
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const images: string[] = [];
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          images.push(canvas.toDataURL("image/png"));
        }
        setImgSrcArr(images);
      } catch (err) {
        // If PDF rendering fails, just don't display images
        setImgSrcArr([]);
      }
      setLoading(false);
    };

    renderAllPages();
    // eslint-disable-next-line
  }, [real_receipt_id]);

  // Fetch receipt data (for batches/images etc)
  useEffect(() => {
    const fetchReceiptAndRender = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!real_receipt_id) {
          setError("No receipt ID provided.");
          setLoading(false);
          return;
        }

        const data = await getReceipt(real_receipt_id);
        setReceipt(data.receipt);

        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch receipt details.");
        setLoading(false);
      }
    };

    fetchReceiptAndRender();
  }, [real_receipt_id]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        Loading receipt details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "#b00020", textAlign: "center" }}>
        {error}
        <div>
          <button onClick={() => navigate(-1)} style={{ marginTop: 12 }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "32px auto",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #0001",
        padding: 32,
      }}
    >
      {/* Render all the pages of PDF as images */}
      {imgSrcArr.length > 0 && (
        <>
          {imgSrcArr.map((src, idx) => (
            <img
              key={`receipt-pdf-img-${idx}`}
              src={src}
              alt={`PDF page ${idx + 1}`}
              style={{ width: "100%", height: "auto", marginBottom: 8 }}
              className="w-full h-auto border-1 border-red-300"
            />
          ))}
        </>
      )}

      <Button
        variant="contained"
        color="success"
        fullWidth
        startIcon={<WhatsAppIcon />}
        onClick={() => setModalOpen(true)}
      >
        Whatsapp
      </Button>

      {/* Show all batches/images (if any) */}
      {receipt?.receipt_data?.map?.((rec: { files: string[] }, recIdx: number) => (
        <div key={`receipt-batch-${recIdx}`}>
          <div style={{ fontWeight: 600, fontSize: 16, margin: "16px 0 8px" }}>
            Batch #{recIdx + 1}
          </div>
          {rec.files.map((itm: string, itmIdx: number) => (
            <img
              key={`receipt-img-${recIdx}-${itmIdx}`}
              src={itm}
              alt={`Batch image ${recIdx + 1}-${itmIdx + 1}`}
              style={{ width: "100%", height: "auto" }}
              className="w-full h-auto border-1 border-red-300 mt-1"
            />
          ))}
        </div>
      ))}

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button onClick={() => navigate(-1)}>Back</button>
      </div>

      <ClientContactModal
        receipt_no={real_receipt_id}
        client_name={receipt?.shopname}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default ReceiptDetails;
