import React, { useEffect, useState } from "react";
import { getReceipts } from "../api/master";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";

// Minimal Receipt component
const Receipt: React.FC<{ receipt: any }> = ({ receipt }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 8px 0 rgba(60,72,100,0.08), 0 1.5px 4px 0 rgba(60,72,100,0.04)",
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    <div style={{ fontWeight: 700, color: "#1976d2", fontSize: 16 }}>
      #{receipt.real_receipt_id}
    </div>
    <div style={{ fontWeight: 600, fontSize: 15 }}>{receipt.shopname}</div>
    <div style={{ color: "#555", fontSize: 14 }}>
      <b>No. of Invoices:</b>{" "}
      {Array.isArray(receipt.invoiceids) ? receipt.invoiceids.length : 0}
    </div>
    <div style={{ color: "#555", fontSize: 14 }}>
      <b>Created By:</b> {receipt.user_id?.email || "-"}
    </div>
    <div style={{ color: "#888", fontSize: 12 }}>
      Created:{" "}
      {receipt.createdAt
        ? new Date(receipt.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : "-"}
    </div>
  </div>
);

const Receipts: React.FC = () => {
  const navigate = useNavigate();

  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Fetch receipts for a given page and replace list
  const fetchReceipts = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReceipts(pageNum);
      const newReceipts = data.receipts || [];
      setReceipts(newReceipts);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError("Failed to fetch receipts.");
      setReceipts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts(page);
    // eslint-disable-next-line
  }, [page]);

  // Remove InfiniteScroll, use MUI Pagination
  // Remove handleCardClick (was not defined in original code)
  // If you want to handle card click, define a stub:
  const handleCardClick = (receipt: any) => {
    // Implement navigation or modal here if needed
    // For now, just log
    // Use react-router-dom's useNavigate to navigate to /receipt-details with real_receipt_id as state
    console.log("Clicked receipt:", receipt);
    navigate("/receipt-details", { state: { real_receipt_id: receipt.real_receipt_id || receipt._id || receipt.receipt_id } });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "16px", fontSize: "24px", fontWeight: "bold" }}>Receipts</h2>
      {/* <Filter onChange={(e)=>console.log(e)} /> */}
      {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {loading && <div>Loading...</div>}
        {!loading && receipts && receipts.length > 0 ? (
          receipts.map((receipt: any, idx: number) => (
            <div
              key={receipt._id || receipt.receipt_id || idx}
              style={{ cursor: "pointer" }}
              onClick={() => handleCardClick(receipt)}
            >
              <Receipt receipt={receipt} />
            </div>
          ))
        ) : (
          !loading && <div>No receipts found.</div>
        )}
      </div>
      <Stack spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
        />
      </Stack>
    </div>
  );
};

export default Receipts;