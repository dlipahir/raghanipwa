import {
  createRealReceipt,
  getSignedUrl,
  updateReceiptCompleted,
  uploadPdfToSignedUrl,
} from "@/api/Invoice";
import ClientContactModal from "@/components/ClientContactModal";
import { generatePdf } from "@/utils/generatePdf";
import React, { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type StepItem = {
  key: string;
  label: string;
};

const stepList: StepItem[] = [
  { key: "getReceiptId", label: "Getting Receipt ID" },
  { key: "generatePdf", label: "Generating PDF" },
  { key: "uploadPdf", label: "Uploading PDF" },
  { key: "updateInvoices", label: "Updating Invoices" },
];

type StepStatus = "pending" | "active" | "passed" | "error" | "hidden";

export default function ReceiptCompleted() {
  const navigate = useNavigate();
  const [imgSrcArr, setImgSrcArr] = useState<string[]>([]);
  const location = useLocation();
  const { receipt_id, data, shopname } = location.state || {};
  const [modalOpen, setModalOpen] = useState(false);
  const [realReceiptId, setRealReceiptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Track each step's status
  const [stepStatus, setStepStatus] = useState<Record<string, StepStatus>>(() =>
    stepList.reduce(
      (acc, cur, idx) => ({
        ...acc,
        [cur.key]: idx === 0 ? "active" : "pending",
      }),
      {} as Record<string, StepStatus>
    )
  );
  const [stepError, setStepError] = useState<{ step: string; message: string } | null>(null);
  const [stepDetails, setStepDetails] = useState<string | null>(null);
  const [stepsVisible, setStepsVisible] = useState(true);

  // Handle "Back" navigation prevention
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      navigate("/", { replace: true });
    };
  }, [navigate]);

  const updateStep = (
    stepKey: string,
    status: StepStatus,
    options: { errorMessage?: string; detail?: string } = {}
  ) => {
    setStepStatus((prev) => {
      const newStatus = { ...prev };

      // Mark previous step as passed if moving forward
      const idx = stepList.findIndex((s) => s.key === stepKey);
      for (let i = 0; i < idx; i++) {
        if (newStatus[stepList[i].key] !== "passed") {
          newStatus[stepList[i].key] = "passed";
        }
      }
      if (status === "active" && newStatus[stepKey] !== "active") {
        newStatus[stepKey] = "active";
      }
      if (status === "passed") {
        newStatus[stepKey] = "passed";
      }
      if (status === "error") {
        newStatus[stepKey] = "error";
      }
      return newStatus;
    });
    if (options.errorMessage) {
      setStepError({ step: stepKey, message: options.errorMessage });
    }
    if (options.detail !== undefined) {
      setStepDetails(options.detail);
    }
  };

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

  useEffect(() => {
    let didCancel = false;
    setStepStatus(
      stepList.reduce(
        (acc, cur, idx) => ({
          ...acc,
          [cur.key]: idx === 0 ? "active" : "pending",
        }),
        {} as Record<string, StepStatus>
      )
    );
    setStepError(null);
    setStepDetails(null);
    setStepsVisible(true);
    setLoading(true);

    const runSteps = async () => {
      try {
        // Step 1: Get Receipt ID
        updateStep("getReceiptId", "active", { detail: "Creating receipt in database..." });
        let real_receipt_id: string;
        try {
          const { real_receipt_id: rid } = await createRealReceipt(
            receipt_id,
            data[0]?.seller ? data[0].seller.shop_name : shopname,
            data
          );
          if (didCancel) return;
          setRealReceiptId(rid);
          real_receipt_id = rid;
          updateStep("getReceiptId", "passed");
        } catch (err: any) {
          updateStep("getReceiptId", "error", { errorMessage: err?.message || "Failed to get receipt id" });
          setLoading(false);
          return;
        }

        // Step 2: Generate PDF
        updateStep("generatePdf", "active", { detail: "Rendering receipt PDF file..." });
        let blob: Blob;
        try {
          blob = await generatePdf(real_receipt_id, shopname, data, "blob");
          if (didCancel) return;
          // Show image previews to user (helpful for visual feedback)
          setStepDetails("Loading PDF preview...");
          const arrayBuffer = await blob.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdf.numPages;
          const imagePages: string[] = [];
          for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Failed to get canvas context");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
            imagePages.push(canvas.toDataURL("image/png"));
          }
          setImgSrcArr(imagePages);
          updateStep("generatePdf", "passed");
        } catch (err: any) {
          updateStep("generatePdf", "error", { errorMessage: err?.message || "Failed to generate PDF" });
          setLoading(false);
          return;
        }

        // Step 3: Upload PDF
        updateStep("uploadPdf", "active", { detail: "Uploading PDF to server..." });
        try {
          const signedUrlsRes = await getSignedUrl(real_receipt_id);
          const { url } = signedUrlsRes as any;
          await uploadPdfToSignedUrl(url.url, blob as Blob);
          updateStep("uploadPdf", "passed");
        } catch (err: any) {
          updateStep("uploadPdf", "error", { errorMessage: err?.message || "Failed to upload PDF" });
          setLoading(false);
          return;
        }

        // Step 4: Update Invoices
        updateStep("updateInvoices", "active", { detail: "Finalizing invoices in database..." });
        try {
          await handleInvoiceDataUpdate(real_receipt_id, data);
          updateStep("updateInvoices", "passed");
        } catch (err: any) {
          updateStep("updateInvoices", "error", { errorMessage: err?.message || "Failed to update invoices" });
          setLoading(false);
          return;
        }

        // All steps passed, now hide the step bar after a delay
        setStepDetails(null);
        setTimeout(() => !didCancel && setStepsVisible(false), 800);
      } finally {
        setLoading(false);
      }
    };
    runSteps();

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    generatePdf(realReceiptId, shopname, data, "download");
  };
  const handleShare = () => {
    generatePdf(realReceiptId, shopname, data, "share");
  };

  function StepProgress({
    stepStatus,
    stepError,
    stepDetails,
    visible,
  }: {
    stepStatus: Record<string, StepStatus>;
    stepError: { step: string; message: string } | null;
    stepDetails: string | null;
    visible: boolean;
  }) {
    if (!visible) return null;
    return (
      <Box mb={3}>
        <Stack spacing={1}>
          {stepList.map((step, idx) => {
            const status = stepStatus[step.key];
            let icon;
            if (status === "passed") {
              icon = <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} />;
            } else if (status === "active") {
              icon = <CircularProgress size={18} color="primary" sx={{ mr: 2 }} />;
            } else if (status === "error") {
              icon = (
                <ErrorIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
              );
            } else {
              icon = (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid #aaa",
                    mr: 2,
                  }}
                />
              );
            }
            return (
              <Box key={step.key} display="flex" alignItems="center">
                {icon}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: status === "passed" || status === "active" ? 600 : 400,
                    color:
                      status === "passed"
                        ? "success.main"
                        : status === "active"
                        ? "primary.main"
                        : status === "error"
                        ? "error.main"
                        : undefined,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
        {stepDetails && (
          <Typography sx={{ ml: 4, mt: 1 }} variant="body2" color="text.secondary">
            {stepDetails}
          </Typography>
        )}
        {stepError && (
          <Typography sx={{ ml: 4, mt: 1 }} variant="body2" color="error" fontWeight={600}>
            Step failed: {stepList.find(s => s.key === stepError.step)?.label || stepError.step}
            <br />
            {stepError.message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box p={3}>
      <StepProgress stepStatus={stepStatus} stepError={stepError} stepDetails={stepDetails} visible={stepsVisible} />

      {!loading && imgSrcArr.length > 0 && (!stepsVisible || Object.values(stepStatus).every(s => s === "passed" || s === "hidden")) ? (
        <>
          {imgSrcArr.map((src, idx) => (
            <Box
              key={idx}
              component="img"
              src={src}
              alt={`PDF Page ${idx + 1} as Image`}
              sx={{
                width: "100%",
                height: "auto",
                border: 1,
                borderColor: "red.300",
                borderRadius: 1,
                mb: 2,
                display: "block",
              }}
            />
          ))}
          <Stack spacing={2}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              startIcon={<WhatsAppIcon />}
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
                  sx={{
                    width: 24,
                    height: 24,
                    filter: "invert(1) brightness(2)",
                  }}
                  alt="Scan"
                />
              }
              onClick={() => navigate("/scan")}
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
