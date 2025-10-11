import { createRealReceipt, getReceipt } from "@/api/Invoice";
import { generatePdf } from "@/utils/generatePdf";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Document, pdfjs } from "react-pdf";
import ClientContactModal from "@/components/ClientContactModal";
import { Box, Button } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

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
  // let real_receipt_id = 14

  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    const renderPdf = async () => {
      const loadingTask = pdfjs.getDocument(`https://storage.googleapis.com/raghaninvoices/Receipt/Receipt_${real_receipt_id}.pdf`);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      setImgSrc(canvas.toDataURL("image/png"));
      setLoading(false);
    };

    renderPdf();
  }, []);

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

        // If you want to show the PDF as before, keep the PDF rendering logic.
        // But now, we will show all images from all batches.
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

  // Render receipt details using the structure from @file_context_0
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
      <img
        src={imgSrc}
        alt="PDF as Image"
        style={{ width: "100%", height: "auto" }}
        className="w-full h-auto border-1 border-red-300"
      />
            <Button
        variant="contained"
        color="success"
        fullWidth
        startIcon={<WhatsAppIcon />}
        onClick={() => setModalOpen(true)}
      >
        Whatsapp
      </Button>

      {receipt.receipt_data.map((rec: { files: string[] }, recIdx: number) => (
        <>
          <div style={{ fontWeight: 600, fontSize: 16, margin: "16px 0 8px" }}>
            Batch #{recIdx + 1}
          </div>
          {rec.files.map((itm: string, itmIdx: number) => (
            <img
              key={`receipt-img-${recIdx}-${itmIdx}`}
              src={itm}
              alt="PDF as Image"
              style={{ width: "100%", height: "auto" }}
              className="w-full h-auto border-1 border-red-300 mt-1"
            />
          ))}
        </>
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
