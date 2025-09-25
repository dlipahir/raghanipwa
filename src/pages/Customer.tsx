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
import { getCustomers } from "@/api/master";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const CustomerCard: React.FC<{ customer: any }> = ({ customer }) => (
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
        {customer.shop_name}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Typography variant="body2" color="text.secondary">
        <b>City:</b> {customer.city || "-"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <b>State:</b> {customer.state || "-"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <b>GST No:</b> {customer.gst_no || "-"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <b>Created At:</b> {formatDate(customer.createdAt)}
      </Typography>
    </CardContent>
  </Card>
);

const CustomerPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isMobile = useMediaQuery("(max-width:600px)");

  const fetchCustomers = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomers(pageNum);
      setCustomers(Array.isArray(res.customers) ? res.customers : []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page);
    // eslint-disable-next-line
  }, [page]);

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, minHeight: "100vh", boxSizing: "border-box" }}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Customers
      </Typography>
      <Paper elevation={2} sx={{ mb: 2, p: isMobile ? 1 : 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", color: "error.main", py: 3 }}>{error}</Box>
        ) : customers.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>No customers found.</Box>
        ) : isMobile ? (
          <Box>
            {customers.map((customer) => (
              <CustomerCard key={customer._id} customer={customer} />
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
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer.shop_name}</TableCell>
                    <TableCell>{customer.city}</TableCell>
                    <TableCell>{customer.state}</TableCell>
                    <TableCell>{customer.gst_no}</TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
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

export default CustomerPage;
