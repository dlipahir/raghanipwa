import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getInvoiceSignedUrls,
  getProcessedInvoiceJsons,
  uploadImageToSignedUrl,
} from "@/api/Invoice";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";

type ImageBatch = Blob[];

type LocationState = {
  images?: ImageBatch[];
};

const ReceiptProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { images } = (location.state as LocationState) || {};

  const totalImages = useMemo(
    () => (images ? images.flat().length : 0),
    [images]
  );

  const [statusText, setStatusText] = useState("Starting...");
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!images || totalImages === 0) {
      setError("No images provided");
      return;
    }

    const run = async () => {
      try {
        setStatusText("Requesting upload URLs...");
        setCurrentStep(1);

        const exts = images.map((batch) => batch.map(() => "jpg"));
        const signedUrlsRes = await getInvoiceSignedUrls(exts);
        const { bills_urls, receipt_id } = signedUrlsRes as any;

        setStatusText("Uploading images...");
        setCurrentStep(2);
        const flatImages = images.flat();
        const flatUrls: string[] = bills_urls.flat();

        for (let i = 0; i < flatImages.length; i++) {
          await uploadImageToSignedUrl(flatUrls[i], flatImages[i]);
          setUploadProgress(Math.round(((i + 1) / flatImages.length) * 100));
        }

        setStatusText("Processing receipt...");
        setCurrentStep(3);
        const jsonDataRes = await getProcessedInvoiceJsons(receipt_id);

        setStatusText("Generating PDF...");
        setDone(true);
        setStatusText("Completed");
        navigate("/receipt-edit", {
          state: {
            receipt_id: receipt_id,
            receiptData: (jsonDataRes as any).all_jsons,
          },
        });
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      }
    };

    run();
    // eslint-disable-next-line
  }, [images, totalImages, navigate]);

  const overallPercent = useMemo(() => {
    // Simple staged progress: URLs (10%), Upload (80%), Process+PDF (10%)
    if (error) return 0;
    if (!images || totalImages === 0) return 0;
    if (done) return 100;
    if (currentStep <= 1) return 10;
    if (currentStep === 2) return Math.min(10 + uploadProgress * 0.8, 90);
    return 95;
  }, [currentStep, uploadProgress, done, error, images, totalImages]);

  return (
    <Box
      sx={{
        width: "95%",
        maxWidth: 900,
        mx: "auto",
        mt: 6,
        p: 3,
      }}

    >
      <Typography variant="h6" align="center" gutterBottom>
        Receipt
      </Typography>
      <Typography
        sx={{ mb: 2 }}
        color={error ? "error.main" : "text.primary"}
        align="center"
      >
        {error ? `Error: ${error}` : statusText}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={overallPercent}
        // sx={{
        //   height: 10,
        //   borderRadius: 5,
        //   mb: 2,
        //   backgroundColor: "#eee",
        //   "& .MuiLinearProgress-bar": {
        //     backgroundColor: error
        //       ? "#f44336"
        //       : done
        //       ? "#4caf50"
        //       : "#1976d2",
        //     transition: "width 200ms ease",
        //   },
        // }}
      />
      {currentStep === 2 && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          Uploading {Math.round(uploadProgress)}% ({totalImages} files)
        </Typography>
      )}
    </Box>
  );
};

export default ReceiptProgress;
