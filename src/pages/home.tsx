import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import Asynchronous from "@/components/MultipeAutoComplete";
import TileCard from "@/components/Card";
import Input from "@mui/material/Input";
import { InputAdornment } from "@mui/material";
import AccountCircle from '@mui/icons-material/Search';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const HomePage = () => {
  // Set default as today
  const [fromDate, setFromDate] = React.useState<Dayjs | null>(
    dayjs().subtract(1, "year")
  );
  const [toDate, setToDate] = React.useState<Dayjs | null>(dayjs());

  return (
    <div style={{ padding: 40 }}>
      <TextField
        id="input-with-icon-textfield"
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
      />
      <DatePicker
        label="From Date"
        value={fromDate}
        onChange={(newValue) => setFromDate(newValue)}
        format="DD-MM-YYYY"
      />
      <DatePicker
        label="To Date"
        value={toDate}
        onChange={(newValue) => setToDate(newValue)}
        format="DD-MM-YYYY"
      />
      <Asynchronous label1="Customer" />
      <Asynchronous label1="Seller" />
      <TileCard title="Invoices" data="129234" />
      <TileCard title="Receipts" data="23532" />
      <Button variant="contained">See Invoices</Button>
      <Button variant="contained">See Receipts</Button>
    </div>
  );
};

export default HomePage;
