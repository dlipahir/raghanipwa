import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { getSellers } from "@/api/filter";

// Add a type for the customer option
interface SellerOption {
  _id: string;
  shop_name: string;
  gst_no?: string;
  city?: string;
  state?: string;
}

interface SellerAutocompleteProps {
  val: SellerOption[] | null | undefined;
    setval: (value: SellerOption | null) => void;
}

export default function SellerAutocomplete({ val, setval,label=true }: SellerAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [sellers, setSellers] = React.useState<SellerOption[] | null | undefined>([]);
  const [loading, setLoading] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      setLoading(true);
      let sellers: SellerOption[] = [];
      try {
        sellers = await getSellers();
      } catch (e) {
        sellers = [];
      }
      setSellers(sellers);
      setLoading(false);
    })();
  };

  const handleClose = () => {
    setOpen(false);
    setSellers([]);
  };

  return (
    <Autocomplete
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => option?._id === value?._id}
      getOptionLabel={(option) => option?.shop_name || ""}
      options={sellers || []}
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
          label={label ? "Seller" : ""}
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
