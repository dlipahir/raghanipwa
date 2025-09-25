import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Stack,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { getInvoices } from "@/api/master";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const InvoiceCard = ({ invoice }: { invoice: any }) => (
  <Card
    elevation={3}
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      borderRadius: 3,
      overflow: "hidden",
      mb: 3,
      background: "#fff",
      boxShadow:
        "0 2px 8px 0 rgba(60,72,100,0.08), 0 1.5px 4px 0 rgba(60,72,100,0.04)",
      transition: "box-shadow 0.2s",
      "&:hover": {
        boxShadow:
          "0 4px 16px 0 rgba(60,72,100,0.16), 0 3px 8px 0 rgba(60,72,100,0.08)",
      },
    }}
  >
    {invoice.files && invoice.files.length > 0 && (
      <CardMedia
        component="img"
        image={invoice.files[0]}
        alt={`Invoice ${invoice.bill_no || ""}`}
        sx={{
          width: { xs: "100%", sm: 180 },
          height: { xs: 180, sm: "auto" },
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    )}

    <CardContent sx={{ flex: 1, minWidth: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        mb={1}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#2d3748",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {invoice.bill_no || "-"}
        </Typography>
        <Chip
          label={invoice.station || "-"}
          color="primary"
          size="small"
          sx={{ fontWeight: 500, background: "#e3f2fd", color: "#1976d2" }}
        />
      </Stack>
      <Stack direction="row" spacing={2} mb={1}>
        <Typography variant="body2" color="text.secondary">
          <b>Bill Date:</b> {formatDate(invoice.bill_date)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <b>LR No:</b> {invoice.lr_no || "-"}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} mb={1}>
        <Typography variant="body2" color="text.secondary">
          <b>Seller:</b>{" "}
          {invoice.sellerid?.shop_name || (
            <span style={{ color: "#aaa" }}>N/A</span>
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <b>Customer:</b>{" "}
          {invoice.customerid?.shop_name || (
            <span style={{ color: "#aaa" }}>N/A</span>
          )}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} mb={1}>
        <Typography variant="body2" color="text.secondary">
          <b>LR Date:</b> {formatDate(invoice.lr_date)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <b>Receipt ID:</b> {invoice.receiptid || "-"}
        </Typography>
      </Stack>
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ mt: 1, display: "block" }}
      >
        Created: {formatDate(invoice.createdAt)}
      </Typography>
    </CardContent>
  </Card>
);

const PAGE_SIZE = 10; // You can adjust this if your API supports page size

const InvoiceList = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);
      try {
        // getInvoices returns { invoices: [], total, ... }
        const res = await getInvoices(pageNum);
        const newInvoices = Array.isArray(res.invoices) ? res.invoices : [];
        setInvoices(newInvoices);
        // Calculate total pages if total is available
        if (typeof res.total === "number") {
          setTotalPages(Math.max(1, Math.ceil(res.total / PAGE_SIZE)));
        } else if (typeof res.totalPages === "number") {
          setTotalPages(res.totalPages);
        } else {
          setTotalPages(1);
        }
      } catch (err) {
        setError("Failed to fetch invoices.");
        setInvoices([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchInvoices(page);
    // eslint-disable-next-line
  }, [page]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: { xs: 2, sm: 4 },
        background: "#f7fafd",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 4,
          color: "#1976d2",
          letterSpacing: 1,
        }}
      >
        Invoices
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && invoices && invoices.length > 0 ? (
          <Grid container spacing={2}>
            {invoices.map((invoice) => (
              <Grid item xs={12} key={invoice._id}>
                <InvoiceCard invoice={invoice} />
              </Grid>
            ))}
          </Grid>
        ) : (
          !loading && <Typography align="center" color="text.secondary">No invoices found.</Typography>
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
    </Box>
  );
};

export default InvoiceList;
