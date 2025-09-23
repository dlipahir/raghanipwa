import { useRef, useState, useEffect } from "react";
// import SmartCropper from "@/components/SmartCropper";
// import { Button } from "@heroui/button";
import CameraIcon from '@mui/icons-material/Camera';
import AddToPhotosRoundedIcon from '@mui/icons-material/AddToPhotosRounded';
import { useNavigate } from "react-router-dom";
import PhotoRoundedIcon from '@mui/icons-material/PhotoRounded';
import ImagesDrawer from "@/components/ImagesDrawer";

type ImageBatch = Blob[];

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

const ScannerPage= () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageBatch[]>([[]]);
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCapturing(true);
      } catch (err) {
        alert("Could not access camera");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    setCapturing(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
      }
      setCapturing(false);
    };
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load sound when app starts
  useEffect(() => {
    audioRef.current = new Audio("/cameraclick.wav");
    audioRef.current.load();
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const audioRef2 = useRef<HTMLAudioElement | null>(null);

  // Load sound when app starts
  useEffect(() => {
    audioRef2.current = new Audio("/newadd.wav");
    audioRef2.current.load();
  }, []);

  const playSound2 = () => {
    if (audioRef2.current) {
      audioRef2.current.currentTime = 0;
      audioRef2.current.play();
    }
  };

  const capture = async () => {
    playSound();
    if (videoRef.current && canvasRef.current) {
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.95);
 
      const blob = await dataUrlToBlob(dataUrl);
      setImages((prev) => {
        const newImages = prev.map((batch) => [...batch]);
        newImages[currentBatch] = [...newImages[currentBatch], blob];
        return newImages;
      });
  
    }
  };

  const handleCropCancel = () => {
    setIsCropOpen(false);
    setCropSrc(null);
  };

  const handleCropConfirm = async (croppedDataUrl: string) => {
    const blob = await dataUrlToBlob(croppedDataUrl);
    setImages((prev) => {
      const newImages = prev.map((batch) => [...batch]);
      newImages[currentBatch] = [...newImages[currentBatch], blob];
      return newImages;
    });
    setIsCropOpen(false);
    setCropSrc(null);
  };

  const removeImage = (batchIdx: number, imgIdx: number) => {
    setImages((prev) => {
      let newImages = prev.map((batch) => [...batch]);
      newImages[batchIdx] = newImages[batchIdx].filter((_, i) => i !== imgIdx);
      // Remove the batch if it has no images left
      newImages = newImages.filter((batch) => batch.length > 0);
      // Ensure at least one empty batch exists if all are removed
      if (newImages.length === 0) {
        newImages = [[]];
      }
      return newImages;
    });
  };

  const createNewBatch = () => {
    
    setImages((prev) => {
      // Only create a new batch if the previous batch is not empty
      if (prev.length === 0 || prev[prev.length - 1].length > 0) {
        setCurrentBatch(prev.length);
        playSound2();
        return [...prev, []];
      }
      // Otherwise, do not create a new batch or change currentBatch
      return prev;
    });
  };

  const removeBatch = (batchIdx: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== batchIdx);
      if (currentBatch >= newImages.length) {
        setCurrentBatch(Math.max(0, newImages.length - 1));
      }
      return newImages.length === 0 ? [[]] : newImages;
    });
  };

  const goToReceiptProgress = () => {
    const allImages = images.flat();
    if (allImages.length === 0) {
      alert("No images to send");
      return;
    }
    navigate("/receipt-progress", { state: { images } });
  };

  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        background: "#f4f6fa",
        fontFamily: "Roboto, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Flex column: video takes remaining height, buttons at bottom */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <video
            ref={videoRef}
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              background: "#222",
              padding: 7,
              border: "1px solid #ddd",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
            playsInline
            autoPlay
          />
        </div>

        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 -2px 16px rgba(0,0,0,0.07)",
            borderTop: "1px solid #e0e0e0",
            padding: "18px 0 10px 0",
            display: "flex",
            alignItems: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: 480,
              margin: "0 auto",
              gap: 16,
              padding:"0 20px 0 20px"
            }}
          >
            <button
              disabled={sending}
              onClick={()=>setDrawerOpen(true)}
              style={{
                background: "#f5f5f5",
                border: "2px solid #e0e0e0",
                borderRadius: 12,
                fontWeight: 500,
                color: "#333",
                height: 48,
                width: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                cursor: sending ? "not-allowed" : "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                marginBottom: 12,
              }}
              title="Last captured"
            >
              {images[currentBatch] && images[currentBatch].length > 0 ? (
                <img
                  src={URL.createObjectURL(
                    images[currentBatch][images[currentBatch].length - 1]
                  )}
                  alt="Last captured"
                  style={{
                    height: 40,
                    width: 40,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <PhotoRoundedIcon style={{ fontSize: 32, color: "#bdbdbd" }} />
              )}
            </button>
            <button
              onClick={capture}
              style={{
                background:
                  "linear-gradient(135deg, #ff5252 0%, #ff1744 100%)",
                border: "none",
                borderRadius: "50%",
                fontWeight: 700,
                color: "#fff",
                height: 80,
                width: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(255,23,68,0.12)",
                fontSize: 32,
                outline: "none",
                transition: "box-shadow 0.2s",
                marginBottom: 12,
              }}
              title="Capture"
            >
              <CameraIcon style={{ fontSize: 44 }} />
            </button>
            <button
              onClick={createNewBatch}
              style={{
                background:
                  "linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)",
                border: "none",
                borderRadius: "50%",
                fontWeight: 700,
                color: "#fff",
                height: 64,
                width: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
                fontSize: 28,
                transition: "box-shadow 0.2s",
              }}
              title="New Batch"
            >
              <AddToPhotosRoundedIcon style={{ fontSize: 36 }} />
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

    <ImagesDrawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      images={images}
      removeBatch={removeBatch}
      removeImage={removeImage}
      currentBatch={currentBatch}
      goToReceiptProgress={goToReceiptProgress}
      sending={sending}
      setImages={setImages}
      setCurrentBatch={setCurrentBatch}
    />

    </div>
  );
};

export default ScannerPage;