import React, { useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import CustomerAutocomplete from "@/components/CustomerAutocomplete";
import SellerAutocomplete from "@/components/SellerAutocomplete";
import TileCard from "@/components/Card";
import {
  InputAdornment,
  useMediaQuery,
  Button,
  TextField,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/Search";
import { getCustomerSellerCounts, getFilterCount } from "@/api/filter";
import { useNavigate } from "react-router-dom";


const HomePage = () => {
  const navigate = useNavigate()
  // Set default as today
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(
    dayjs().subtract(1, "year")
  );
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs());
  const [sellerid, setSellerid] = useState();
  const [customerid, setCustomerid] = useState();
  const [icounts, setIcounts] = useState({receiptcounts: 0, invoicecounts: 0})
  const[scounts,setScounts] = useState({sellerCount: 5, customerCount: 4})
  // Use MUI's breakpoint for mobile
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {

    const fetchCount = async () => {
      try {
        const count = await getFilterCount({
            bill_from: fromDate ? dayjs(fromDate).format("YYYY-MM-DD") : undefined,
            bill_to: toDate ? dayjs(toDate).format("YYYY-MM-DD") : undefined,
            customerid: customerid?._id,
            sellerid: sellerid?._id,
          })
        setIcounts(count);
      } catch (e) {
        console.error("Failed to fetch filter count", e);
      }
    };
    fetchCount();

  }, [fromDate, toDate, sellerid, customerid]);

  useEffect(() => {

    const fetchCount = async () => {
      try {
        const scounts = await getCustomerSellerCounts()
        setScounts(scounts);
      } catch (e) {
        console.error("Failed to fetch filter count", e);
      }
    };
    fetchCount();

  }, []);

  return (
    <div
      style={{
        padding: isMobile ? 12 : 40,
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 16,
          alignItems: isMobile ? "stretch" : "center",
          marginBottom: isMobile ? 16 : 24,
          width: "100%",
        }}
      >
        <TextField
          id="input-with-icon-textfield"
          placeholder="Invoice / Receipt"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            },
          }}
          variant="outlined"
          style={{ flex: 1, minWidth: isMobile ? 0 : 180 }}
          fullWidth={isMobile}
          size={isMobile ? "medium" : "medium"}
        />
        <DatePicker
          label="From Date"
          value={fromDate}
          onChange={(newValue) => setFromDate(newValue)}
          format="DD-MM-YYYY"
          slotProps={{
            textField: {
              size: isMobile ? "medium" : "medium",
              fullWidth: isMobile,
              style: { minWidth: isMobile ? 0 : 140 },
            },
          }}
        />
        <DatePicker
          label="To Date"
          value={toDate}
          onChange={(newValue) => setToDate(newValue)}
          format="DD-MM-YYYY"
          slotProps={{
            textField: {
              size: isMobile ? "medium" : "medium",
              fullWidth: isMobile,
              style: { minWidth: isMobile ? 0 : 140 },
            },
          }}
        />
        <CustomerAutocomplete val={customerid} setval={setCustomerid} />
        <SellerAutocomplete val={sellerid} setval={setSellerid} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 16,
          marginBottom: isMobile ? 12 : 24,
        }}
      >
        <TileCard
          title="Invoices"
          data={icounts?.invoicecounts}
          onClick={() => {
            navigate("/invoices")
          }}
        />
        <TileCard title="Receipts" data={icounts?.receiptcounts}    onClick={() => {
            navigate("/receipts")
          }}/>
        <TileCard title="Customer" data={scounts?.customerCount}    onClick={() => {
            navigate("/customers")
          }}/>
        <TileCard title="Seller" data={scounts?.sellerCount}    onClick={() => {
            navigate("/sellers")
          }}/>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 8 : 16,
          width: isMobile ? "100%" : "auto",
        }}
      >

      </div>
    </div>
  );
};

export default HomePage;
