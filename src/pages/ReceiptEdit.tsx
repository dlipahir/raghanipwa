import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Stack,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";

interface ReceiptDataItem {
  [key: string]: any;
  party_name?: string;
  station?: string;
  bill_no?: string;
  lr_no?: string;
  lr_date?: string;
  shop_name?: string;
}



const defaultHeaders = [
  { key: "S.No", label: "S.No" },
  { key: "party_name", label: "Party" },
  { key: "station", label: "Station" },
  { key: "bill_no", label: "Bill No." },
  { key: "bill_date", label: "Bill Date" },
  { key: "lr_no", label: "L/R NO. OR C/N No." },
  { key: "lr_date", label: "L/R DATE" },
];

const ReceiptEdit = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  const { receipt_id, receiptData }= (location.state) || {};

  const [headers] = useState<{ key: string; label: string }[]>([...defaultHeaders]);
  const [data, setData] = useState<ReceiptDataItem[]>(() =>
    receiptData.map((row) => ({ ...row }))
  );
  const [shopname, setShopName] = useState(receiptData?.[0]?.["shop_name"] || "");

  const [errorFields, setErrorFields] = useState<{
    shopname: boolean;
    rows: { [rowIdx: number]: { [colKey: string]: boolean } };
  }>({
    shopname: false,
    rows: {},
  });

  const shopNameInputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<{ [rowIdx: number]: { [colKey: string]: HTMLInputElement | null } }>({});

  const handleCellChange = (rowIdx: number, colKey: string, value: string) => {
    setData((prev) => {
      const updated = [...prev];
      updated[rowIdx] = { ...updated[rowIdx], [colKey]: value };
      return updated;
    });
    setErrorFields((prev) => {
      const newRows = { ...prev.rows };
      if (newRows[rowIdx] && newRows[rowIdx][colKey]) {
        newRows[rowIdx] = { ...newRows[rowIdx], [colKey]: false };
      }
      return { ...prev, rows: newRows };
    });
  };

  const handleAddRow = () => {
    const newRow: ReceiptDataItem = {};
    headers.forEach((header) => {
      if (header.key !== "S.No") {
        newRow[header.key] = "";
      }
    });
    setData((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (rowIdx: number) => {
    setData((prev) => prev.filter((_, idx) => idx !== rowIdx));
    setErrorFields((prev) => {
      const newRows = { ...prev.rows };
      delete newRows[rowIdx];
      const shiftedRows: typeof newRows = {};
      Object.keys(newRows).forEach((key) => {
        const idx = parseInt(key, 10);
        if (idx > rowIdx) {
          shiftedRows[idx - 1] = newRows[idx];
        } else if (idx < rowIdx) {
          shiftedRows[idx] = newRows[idx];
        }
      });
      return { ...prev, rows: shiftedRows };
    });
  };

  const handleSave = () => {
    let hasError = false;
    const newErrorFields: typeof errorFields = { shopname: false, rows: {} };

    if (!shopname || shopname.trim() === "") {
      newErrorFields.shopname = true;
      hasError = true;
    }

    data.forEach((row, rowIdx) => {
      headers.forEach((header) => {
        if (header.key === "S.No") return;
        const value = row[header.key];
        if (value === undefined || value === null || String(value).trim() === "") {
          if (!newErrorFields.rows[rowIdx]) newErrorFields.rows[rowIdx] = {};
          newErrorFields.rows[rowIdx][header.key] = true;
          hasError = true;
        }
      });
    });

    setErrorFields(newErrorFields);

    setTimeout(() => {
      if (newErrorFields.shopname && shopNameInputRef.current) {
        shopNameInputRef.current.focus();
        return;
      }
      for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
        const rowErrors = newErrorFields.rows[rowIdx];
        if (rowErrors) {
          for (const colKey of Object.keys(rowErrors)) {
            if (
              rowErrors[colKey] &&
              inputRefs.current[rowIdx] &&
              inputRefs.current[rowIdx][colKey]
            ) {
              inputRefs.current[rowIdx][colKey]?.focus();
              return;
            }
          }
        }
      }
    }, 0);

    if (hasError) {
      return;
    }

    navigate("/receipt-completed", { state: { receipt_id, data, shopname }, replace: true });
  };

  const registerInputRef = (rowIdx: number, colKey: string, el: HTMLInputElement | null) => {
    if (!inputRefs.current[rowIdx]) inputRefs.current[rowIdx] = {};
    inputRefs.current[rowIdx][colKey] = el;
  };

  return (
    <>
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          my: 4,
          bgcolor: "#fff",
          border: "1px solid #eee",
          borderRadius: 2,
          boxShadow: 2,
          p: { xs: 2, sm: 4 },
          fontFamily: "Roboto, Arial, sans-serif",
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          spacing={2}
          mb={2}
        >
          <Box sx={{ flex: "0 0 80px", display: "flex", alignItems: "center" }}>
            <img
              src="/raghaninew.jpg"
              alt="Logo"
              style={{ width: 110, height: 110, objectFit: "contain" }}
            />
          </Box>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                letterSpacing: 2,
                color: "#222",
                lineHeight: 1.1,
                fontSize: { xs: "7vw", sm: 32 },
                textAlign: { xs: "left", sm: "center" },
              }}
              className="receipt-title"
            >
              RAGHANI
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                color: "#555",
                mt: 0.5,
                letterSpacing: 1,
                fontSize: { xs: "4vw", sm: 18 },
                textAlign: { xs: "left", sm: "center" },
              }}
              className="receipt-subtitle"
            >
              BR/LR Receiving Book
            </Typography>
          </Box>
        </Stack>

        <Box
          component="hr"
          sx={{
            border: "none",
            borderTop: "2px solid #222",
            my: 2,
          }}
        />

        {/* Receipt No. and Date */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            fontWeight: 500,
            fontSize: { xs: "4vw", sm: 16 },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            mb: 1,
          }}
          className="receipt-row"
        >
          <Box>
            Receipt No.: <Box component="span" sx={{ fontWeight: 700 }}>_</Box>
          </Box>
          <Box>
            Date.:{" "}
            <Box component="span">
              {(() => {
                const d = new Date();
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
              })()}
            </Box>
          </Box>
        </Stack>
        <Box sx={{ fontSize: { xs: "3.5vw", sm: 15 }, mt: 0.5 }}>
          Received with thanks from M/s.&nbsp;
          <TextField
            inputRef={shopNameInputRef}
            value={shopname}
            onChange={e => {
              setShopName(e.target.value);
              if (errorFields.shopname && e.target.value.trim() !== "") {
                setErrorFields((prev) => ({ ...prev, shopname: false }));
              }
            }}
            error={errorFields.shopname}
            size="medium"
            variant="standard"
            sx={{
              fontWeight: 600,
              minWidth: { xs: "90vw", sm: 350 },
              maxWidth: { xs: "100vw", sm: 500 },
              fontSize: { xs: "4vw", sm: 15 },
              background: errorFields.shopname ? "#fff0f0" : "#fff",
              "& .MuiOutlinedInput-root": {
                p: "2px 6px",
              },
              "& input": {
                fontWeight: 600,
                fontSize: { xs: "4vw", sm: 15 },
              },
            }}
            className="receipt-shopname-input"
          />
        </Box>

        {/* Table or Card List */}
        <Box className="receipt-table-wrapper" sx={{ overflowX: "auto", mt: 2 }}>
          {!isMobile ? (
            <TableContainer component={Paper} elevation={0}>
              <Table
                className="receipt-table"
                sx={{
                  minWidth: 600,
                  fontSize: 15,
                  "& th, & td": {
                    fontSize: 15,
                  },
                }}
                size="small"
              >
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableCell
                        key={header.key}
                        align="center"
                        sx={{
                          fontWeight: 700,
                          background: "#f5f5f5",
                          border: "1px solid #bbb",
                          minWidth: 80,
                          p: "8px 6px",
                        }}
                      >
                        {header.label}
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        background: "#f5f5f5",
                        border: "1px solid #bbb",
                        width: 48,
                      }}
                    />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((row, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {headers.map((header) => (
                          <TableCell
                            key={header.key}
                            align={header.key === "S.No" ? "center" : "left"}
                            sx={{
                              border: "1px solid #ccc",
                              p: "7px 6px",
                            }}
                          >
                            {header.key === "S.No" ? (
                              rowIdx + 1
                            ) : (
                              <TextField
                                value={row[header.key] ?? ""}
                                onChange={e =>
                                  handleCellChange(rowIdx, header.key, e.target.value)
                                }
                                error={!!errorFields.rows[rowIdx]?.[header.key]}
                                size="small"
                                variant="standard"
                                inputRef={el => registerInputRef(rowIdx, header.key, el)}
                                sx={{
                                  width: "100%",
                                  background: errorFields.rows[rowIdx]?.[header.key]
                                    ? "#fff0f0"
                                    : "transparent",
                                  "& .MuiInputBase-root:before": {
                                    borderBottom: "none",
                                  },
                                  "& .MuiInputBase-root:after": {
                                    borderBottom: "none",
                                  },
                                  "& .MuiInputBase-input": {
                                    fontSize: 15,
                                    p: 0,
                                  },
                                }}
                                InputProps={{
                                  disableUnderline: true,
                                }}
                              />
                            )}
                          </TableCell>
                        ))}
                        <TableCell
                          align="center"
                          sx={{
                            border: "1px solid #ccc",
                            background: "#fafafa",
                            width: 48,
                          }}
                        >
                          <IconButton
                            onClick={() => handleRemoveRow(rowIdx)}
                            color="error"
                            size="small"
                            aria-label="Remove row"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={headers.length + 1} align="center" sx={{ p: 2, color: "#888" }}>
                        No data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ mt: 1 }}>
              {data.length > 0 ? (
                data.map((row, rowIdx) => (
                  <Card
                    key={rowIdx}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      background: "#fafbfc",
                      boxShadow: 1,
                      position: "relative",
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Stack direction="row" alignItems="center" mb={1}>
                        <Typography fontWeight={700} fontSize={16} mr={1}>
                          #{rowIdx + 1}
                        </Typography>
                        <Box flexGrow={1} />
                        <IconButton
                          onClick={() => handleRemoveRow(rowIdx)}
                          color="error"
                          size="small"
                          aria-label="Remove row"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      {headers
                        .filter((header) => header.key !== "S.No")
                        .map((header) => (
                          <Box key={header.key} mb={1}>
                            <Typography fontWeight={600} fontSize={14} color="#555">
                              {header.label}
                            </Typography>
                            <TextField
                              value={row[header.key] ?? ""}
                              onChange={e =>
                                handleCellChange(rowIdx, header.key, e.target.value)
                              }
                              error={!!errorFields.rows[rowIdx]?.[header.key]}
                              size="small"
                              variant="outlined"
                              inputRef={el => registerInputRef(rowIdx, header.key, el)}
                              sx={{
                                width: "100%",
                                background: errorFields.rows[rowIdx]?.[header.key]
                                  ? "#fff0f0"
                                  : "#fff",
                                mt: 0.5,
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1,
                                  fontSize: 15,
                                  p: "4px 6px",
                                },
                                "& input": {
                                  fontSize: 15,
                                },
                              }}
                            />
                          </Box>
                        ))}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box sx={{ textAlign: "center", p: 2, color: "#888" }}>
                  No data available.
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Add Row Button */}
        {/* <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          mt={2}
          className="receipt-edit-btns"
        >
          <Button
            onClick={handleAddRow}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            fullWidth
          >
            Add Row
          </Button>
        </Stack> */}
      </Box>
      <Stack direction="column" alignItems="center" spacing={2} mt={2}>
        <Button
          onClick={handleSave}
          variant="contained"
          color="success"
          fullWidth
          sx={{ maxWidth: 500 }}
        >
          Create Receipt
        </Button>
        <Button
          onClick={() => navigate("/", { replace: true })}
          variant="outlined"
          color="error"
          fullWidth
          sx={{ maxWidth: 500 }}
        >
          Cancel
        </Button>
      </Stack>
    </>
  );
};

export default ReceiptEdit;
