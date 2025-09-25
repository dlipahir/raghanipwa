import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
  Stack,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { getSellers } from "@/api/master";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const SellerCard: React.FC<{ seller: any }> = ({ seller }) => (
  <Card
    variant="outlined"
    sx={{
      mb: 1.5,
      borderRadius: 2,
      boxShadow: "0 2px 8px 0 rgba(60,72,100,0.08), 0 1.5px 4px 0 rgba(60,72,100,0.04)",
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
        {seller.shop_name}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Typography variant="body2" color="text.secondary">
        <b>City:</b> {seller.city || "-"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <b>State:</b> {seller.state || "-"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <b>GST No:</b> {seller.gst_no || "-"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <b>Created At:</b> {formatDate(seller.createdAt)}
      </Typography>
    </CardContent>
  </Card>
);

const SellerPage: React.FC = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isMobile = useMediaQuery("(max-width:600px)");

  const fetchSellers = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSellers(pageNum);
      setSellers(Array.isArray(res.sellers) ? res.sellers : []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers(page);
    // eslint-disable-next-line
  }, [page]);

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, minHeight: "100vh", boxSizing: "border-box" }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Sellers
      </Typography>
      <Paper elevation={2} sx={{ mb: 2, p: isMobile ? 1 : 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", color: "error.main", py: 3 }}>{error}</Box>
        ) : sellers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>No sellers found.</Box>
        ) : isMobile ? (
          <Box>
            {sellers.map((seller) => (
              <SellerCard key={seller._id} seller={seller} />
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Shop Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>GST No</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller._id}>
                    <TableCell>{seller.shop_name}</TableCell>
                    <TableCell>{seller.city}</TableCell>
                    <TableCell>{seller.state}</TableCell>
                    <TableCell>{seller.gst_no}</TableCell>
                    <TableCell>{formatDate(seller.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <Stack direction="row" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          size={isMobile ? "small" : "medium"}
        />
      </Stack>
    </Box>
  );
};

export default SellerPage;
