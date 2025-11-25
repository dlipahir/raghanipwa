import { createRealReceipt, getReceipt, getSignedUrl, updateReceiptCompleted, uploadPdfToSignedUrl } from "@/api/Invoice";
import { generatePdf } from "@/utils/generatePdf";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pdfjs } from "react-pdf";
import ClientContactModal from "@/components/ClientContactModal";
import { Box, Button } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";

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
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const renderAllPages = async () => {
    if (!real_receipt_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const pdfUrl = `https://storage.googleapis.com/raghaninvoices/Receipt/Receipt_${real_receipt_id}.pdf`;
      // fetch the PDF and store blob so we can print/download from blob (cross-origin safe)
      try {
        const response = await fetch(pdfUrl);
        if (response.ok) {
          const blob = await response.blob();
          setPdfBlob(blob);
        } else {
          setPdfBlob(null);
        }
      } catch (e) {
        setPdfBlob(null);
      }
      // Render images via pdfjs
      const loadingTask = pdfjs.getDocument(pdfUrl);
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
      setPdfBlob(null);
    }
    setLoading(false);
  };
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
  // Render ALL pages of PDF as images
  useEffect(() => {


    renderAllPages();
    // eslint-disable-next-line
  }, [real_receipt_id]);

  // Fetch receipt data (for batches/images etc)
  useEffect(() => {


    fetchReceiptAndRender();
  }, [real_receipt_id]);


  const handleInvoiceDataUpdate = async (real_receipt_id: any, data: any) => {
    const shortdata = data.map((inv: any) => ({
      _id: inv._id,
      lr_date: inv.lr_date,
      lr_no: inv.lr_no,
      bill_date: inv.bill_date,
      bill_no: inv.bill_no,
      station: inv.station,
      sellerid: inv?.seller?._id,
      customerid: inv?.customer?._id,
    }));
    const updateddata = { real_receipt_id, shortdata };
    await updateReceiptCompleted(updateddata);
  };


  const refresh_data = async ()=>{
        try {
          const blob = await generatePdf(real_receipt_id, receipt.shopname, receipt.data, "blob");
          const signedUrlsRes = await getSignedUrl(real_receipt_id);
          const { url } = signedUrlsRes as any;
          await uploadPdfToSignedUrl(url.url, blob as Blob);
          await handleInvoiceDataUpdate(real_receipt_id,receipt.data)
          renderAllPages()
        } catch (error) {
          console.error("Error rendering PDF or uploading:", error);
        } finally {
          setLoading(false);
        }
      };
  


  // PDF download handler using pdfjs (blob)
  const handleDownloadPdf = () => {
    if (!real_receipt_id) return;
    if (pdfBlob) {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(pdfBlob);
      link.download = `Receipt_${real_receipt_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
      }, 0);
    } else {
      // fallback to remote URL if blob loading failed
      const pdfUrl = `https://storage.googleapis.com/raghaninvoices/Receipt/Receipt_${real_receipt_id}.pdf`;
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Receipt_${real_receipt_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Print handler for PDF using pdfjs (blob)
  const handlePrintPdf = () => {
    if (pdfBlob) {
      // open blob in new window for browser to print
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const printWindow = window.open(blobUrl, "_blank");
      // revoke the blob after print
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 10000);
      // Note: Printing functionality is now delegated to the PDF viewer
    } else if (imgSrcArr.length > 0) {
      // fallback: print via images
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      printWindow.document.write("<html><head><title>Print Receipt</title>");
      printWindow.document.write(
        `<style>
          body { margin:0; padding:0 }
          img { display:block; width:100%; max-width:650px; margin:0 auto 8px auto; }
        </style>`
      );
      printWindow.document.write("</head><body>");
      imgSrcArr.forEach((src, idx) => {
        printWindow!.document.write(
          `<img src="${src}" alt="PDF page ${idx + 1}" />`
        );
      });
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 400);
    } else if (real_receipt_id) {
      // fallback: open/print the PDF directly from URL
      const pdfUrl = `https://storage.googleapis.com/raghaninvoices/Receipt/Receipt_${real_receipt_id}.pdf`;
      const printWindow = window.open(pdfUrl, "_blank");
      if (!printWindow) return;
    }
  };

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
      {imgSrcArr.length > 0 ? (
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
      ):(
        <Button
        variant="contained"
        color="success"
        fullWidth
        onClick={() => refresh_data()}
        style={{ marginBottom: 10, marginTop: 8 }}
      >
        REFRESH
      </Button>
      )}

      <Button
        variant="contained"
        color="success"
        fullWidth
        startIcon={<WhatsAppIcon />}
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 10, marginTop: 8 }}
      >
        Whatsapp
      </Button>
   

      {/* Print & Download Buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<PrintIcon />}
          onClick={handlePrintPdf}
          style={{ flex: 1 }}
          disabled={!real_receipt_id}
        >
          Print PDF
        </Button>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPdf}
          style={{ flex: 1 }}
          disabled={!real_receipt_id}
        >
          Download PDF
        </Button>
      </div>

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
        <Button onClick={() => navigate(-1)}>Back</Button>
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
