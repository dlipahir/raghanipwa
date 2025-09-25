import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { getCustomers } from "@/api/filter";

// Add a type for the customer option
interface CustomerOption {
  _id: string;
  shop_name: string;
  gst_no?: string;
  city?: string;
  state?: string;
}

interface CustomerAutocompleteProps {
  val: CustomerOption | null;
  setval: (value: CustomerOption | null) => void;
}

export default function CustomerAutocomplete({ val, setval }: CustomerAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<CustomerOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      setLoading(true);
      let customers: CustomerOption[] = [];
      try {
        customers = await getCustomers();
      } catch (e) {
        customers = [];
      }
      setOptions(customers);
      setLoading(false);
    })();
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Autocomplete
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => option?._id === value?._id}
      getOptionLabel={(option) => option?.shop_name || ""}
      options={options}
      value={val}
      onChange={(_event, newValue) => {
        setval(newValue);
      }}
      loading={loading}
      clearOnEscape
      renderOption={(props, option) => (
        <li {...props}>
          <div key={option.gst_no}>
            <div style={{ fontWeight: 500 }}>{option.shop_name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{option.gst_no}</div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {option.city ? option.city : ''}
              {option.city && option.state ? ', ' : ''}
              {option.state ? option.state : ''}
            </div>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Customer"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
