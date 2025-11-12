import React, { useState, useRef, useEffect } from "react";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTheme } from "@mui/material/styles";
import CustomerModal from "@/components/CustomerModal";
import CustomerAutocomplete from "@/components/CustomerAutocomplete";
import SellerAutocomplete from "@/components/SellerAutocomplete";
import ImageModal from "@/components/ImageModal";

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
  const { receipt_id, receiptData } = location.state || {};

  const [headers] = useState<{ key: string; label: string }[]>([
    ...defaultHeaders,
  ]);
  const [data, setData] = useState<ReceiptDataItem[]>(() =>
    receiptData.map((row) => ({ ...row }))
  );
  const [shopname, setShopName] = useState(
    data?.[0]?.["shop_name"] || ""
  );
  const [seller, setSeller] = useState(
   data?.[0]?.["seller"] || null
  );

  // ImageModal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // For table/card row image modal open
  const handleViewRowImages = (row: any) => {
    if (row?.files && Array.isArray(row.files) && row.files.length > 0) {
      setSelectedImages(row.files);
      setImageModalOpen(true);
    } else {
      setSelectedImages([]);
      setImageModalOpen(true); // Show open with empty images for now
    }
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImages([]);
  };

  // ---- Rest unchanged ----

  const [errorFields, setErrorFields] = useState<{
    shopname: boolean;
    rows: { [rowIdx: number]: { [colKey: string]: boolean } };
  }>({
    shopname: false,
    rows: {},
  });

  const shopNameInputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<{
    [rowIdx: number]: { [colKey: string]: HTMLInputElement | null };
  }>({});

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
        if (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        ) {
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
    navigate("/receipt-completed", {
      state: { receipt_id, data, shopname },
      replace: true,
    });
  };
  const handleCreate = (_id,type,cdata) =>{
    if(type === "seller"){
      setSeller(cdata);
      return;
    }
  const updatedData = data.map((row) => {
    if (row._id === _id) {
      if (type === "customer") {
        return {
          ...row,
          customer: cdata,
          party_name:cdata.shop_name,
          party_gst:cdata.gst_no,
          party_state:cdata.state,
          party_city:cdata.city
        };
      } else if (type === "seller") {
        return {
          ...row,
          seller: cdata,
          shop_name:cdata.shop_name,
          shop_gst:cdata.gst_no,
          shop_state:cdata.state,
          shop_city:cdata.city
        };
        setSeller(cdata);
      }
    }
    return row;
  });
  setData(updatedData);
  }

  const handleSellerChange = (value: any | null) => {
    setData((prevData) =>
      prevData.map((row) => ({
        ...row,
        seller: value,
        shop_name: value?.shop_name || "",
        shop_gst: value?.gst_no || "",
        shop_state: value?.state || "",
        shop_city: value?.city || "",
      }))
    );
  };

  useEffect(() => {
    if (seller !== undefined) {
      handleSellerChange(seller);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller]);

  const handleCustomerChange = (value: any | null, _id) => {
    setData((prevData) =>
      prevData.map((row) =>
        row._id === _id
          ? {
              ...row,
              customer: value,
              party_name: value?.shop_name || "",
              party_gst: value?.gst_no || "",
              party_state: value?.state || "",
              party_city: value?.city || "",
            }
          : row
      )
    );
  };

  const registerInputRef = (
    rowIdx: number,
    colKey: string,
    el: HTMLInputElement | null
  ) => {
    if (!inputRefs.current[rowIdx]) inputRefs.current[rowIdx] = {};
    inputRefs.current[rowIdx][colKey] = el;
  };

  return (
    <div>
      {/* ImageModal for images viewing */}
      <ImageModal
        openImages={imageModalOpen}
        handleCloseImages={handleCloseImageModal}
        files={selectedImages}
      />
      {data.length > 0 &&
        data.map(
          (row, idx) =>
            !row.customer && (
              <CustomerModal
                key={`c${idx}`}
                type="customer"
                Customerdata={{
                  shop_name: row.party_name,
                  city: row.party_city,
                  state: row.party_state,
                  gst_no: row.party_gst,
                  _id:row._id,
                  files: row?.files || []
                }}
                handleCreate={handleCreate}
              />
            )
        )}

      {data.length > 0 &&
        [data[0]].map(
          (row, idx) =>
            !row.seller && (
              <CustomerModal
                key={`s${idx}`}
                type="seller"
                Customerdata={{
                  shop_name: row.shop_name,
                  city: row.shop_city,
                  state: row.shop_state,
                  gst_no: row.shop_gst,
                  _id:row._id
                }}
                handleCreate={handleCreate}
              />
            )
        )}

      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
          my: 4,
          border: "1px solid #eee",
          borderRadius: 2,
          boxShadow: 2,
          p: { sm: 4 },
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
            flexDirection: { xs: "row", sm: "row" },
            gap: { xs: 1, sm: 0 },
            mb: 1,
          }}
          className="receipt-row"
        >
          <Box>
            Receipt No.:{" "}
            <Box component="span" sx={{ fontWeight: 700 }}>
              _
            </Box>
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
          <SellerAutocomplete val={seller} setval={setSeller} label={false}/>
        </Box>

        {/* Table or Card List */}
        <Box
          className="receipt-table-wrapper"
          sx={{ overflowX: "auto", mt: 2 }}
        >
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
                        border: "1px solid #bbb",
                        width: 90,
                        textAlign: "center"
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
                              header.key === "party_name" ? (
                                <CustomerAutocomplete val={row['customer']} setval={(data) => handleCustomerChange(data,row._id)} label={false} />
                              ) : (
                              <TextField
                                value={row[header.key] ?? ""}
                                onChange={(e) =>
                                  handleCellChange(
                                    rowIdx,
                                    header.key,
                                    e.target.value
                                  )
                                }
                                error={!!errorFields.rows[rowIdx]?.[header.key]}
                                size="small"
                                variant="standard"
                                inputRef={(el) =>
                                  registerInputRef(rowIdx, header.key, el)
                                }
                                sx={{
                                  width: "100%",
                                  background: errorFields.rows[rowIdx]?.[
                                    header.key
                                  ]
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
                              )
                            )}
                          </TableCell>
                        ))}
                        <TableCell
                          align="center"
                          sx={{
                            border: "1px solid #ccc",
                            width: 90,
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
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
                          <IconButton
                            onClick={() => handleViewRowImages(row)}
                            color="primary"
                            size="small"
                            aria-label="View images"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length + 1}
                        align="center"
                        sx={{ p: 2, color: "#888" }}
                      >
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
                        <IconButton
                          onClick={() => handleViewRowImages(row)}
                          color="primary"
                          size="small"
                          aria-label="View images"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      {headers
                        .filter((header) => header.key !== "S.No")
                        .map((header) => (
                          <Box key={header.key} mb={1}>
                            <Typography
                              fontWeight={600}
                              fontSize={14}
                              color="#555"
                            >
                              {header.label}
                            </Typography>
                            {header.key === "party_name" ? (
                              <CustomerAutocomplete
                                val={row["customer"]}
                                setval={(data) => handleCustomerChange(data, row._id)}
                                label={false}
                              />
                            ) : (
                              <TextField
                                value={row[header.key] ?? ""}
                                onChange={(e) =>
                                  handleCellChange(
                                    rowIdx,
                                    header.key,
                                    e.target.value
                                  )
                                }
                                error={!!errorFields.rows[rowIdx]?.[header.key]}
                                size="small"
                                variant="outlined"
                                inputRef={(el) =>
                                  registerInputRef(rowIdx, header.key, el)
                                }
                                sx={{
                                  width: "100%",
                                  background: errorFields.rows[rowIdx]?.[
                                    header.key
                                  ]
                                    ? "#fff0f0"
                                    : "#fff",
                                  mt: 0.5,
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1,
                                    fontSize: 15,
                                  },
                                  "& input": {
                                    fontSize: 17,
                                  },
                                }}
                              />
                            )}
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
      <Stack direction="column" alignItems="center" spacing={2} mt={2} px={.5}>
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
    </div>
  );
};

export default ReceiptEdit;
