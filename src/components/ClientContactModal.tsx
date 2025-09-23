import React, { useEffect, useState, ChangeEvent } from "react";
import { getClientContactsByName, updateClientContact, createClientContact } from "@/api/clientContact";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

// Types
interface ClientContactItem {
  _id?: string;
  id?: string | number;
  client_name: string;
  whatsapp_nos: string[];
}

interface ClientContactModalProps {
  receipt_no: any;
  client_name: string;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const ClientContactModal: React.FC<ClientContactModalProps> = ({
  receipt_no,
  client_name,
  open,
  onClose,
  onUpdated,
}) => {
  const [contact, setContact] = useState<ClientContactItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Fetch contact by name
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setContact(null);
    getClientContactsByName(client_name)
      .then((data) => {
        let found: ClientContactItem | null = null;
        if (Array.isArray(data)) {
          found = data[0] || null;
        } else if (data?.contacts && Array.isArray(data.contacts)) {
          found = data.contacts[0] || null;
        }
        setContact(found);
      })
      .catch(() => setError("Failed to fetch contact"))
      .finally(() => setLoading(false));
  }, [client_name, open]);

  // Add new number to client (update or create)
  const handleAddNumber = async () => {
    if (!newNumber.trim()) return;
    setAdding(true);
    setError(null);
    try {
      if (contact) {
        // Update existing contact
        const updated = {
          ...contact,
          whatsapp_nos: [...(contact.whatsapp_nos || []), newNumber.trim()],
        };
        await updateClientContact(contact._id || contact.id!, {
          whatsapp_nos: updated.whatsapp_nos,
        });
        setContact(updated);
      } else {
        // Create new contact
        setCreating(true);
        const newContact: ClientContactItem = {
          client_name,
          whatsapp_nos: [newNumber.trim()],
        };
        const created = await createClientContact(newContact);
        setContact(created);
        setCreating(false);
      }
      setNewNumber("");
      if (onUpdated) onUpdated();
    } catch (e) {
      setError("Failed to add number");
    } finally {
      setAdding(false);
      setCreating(false);
    }
  };

  // WhatsApp send message
  const sendWhatsApp = (number: string) => {
    const receipt_url = `https://storage.googleapis.com/raghaninvoices/Receipt/Receipt_${receipt_no}.pdf`;
    const message = `Hello ${client_name},\n Receipt ${receipt_no} : ${receipt_url}
If you’d like an invoice, return receipt, or need help, just reply to this message.`;
    const url = `https://wa.me/91${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewNumber(e.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Client: {client_name}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : !contact ? (
          <Box>
            <Typography>No contact found for "{client_name}"</Typography>
            <Box mt={2}>
              <Typography fontWeight={600} mb={1}>
                Create Contact & Add Number
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  type="text"
                  value={newNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 919999999999"
                  inputProps={{ inputMode: "numeric" }}
                  disabled={adding || creating}
                  size="small"
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddNumber}
                  disabled={adding || creating || !newNumber.trim()}
                >
                  {creating ? "Creating..." : adding ? "Adding..." : "Create & Add"}
                </Button>
              </Stack>
            </Box>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight={600} mb={1}>
                WhatsApp Numbers:
              </Typography>
              {contact.whatsapp_nos && contact.whatsapp_nos.length > 0 ? (
                <List dense>
                  {contact.whatsapp_nos.map((num, idx) => (
                    <ListItem
                      key={idx}
                      secondaryAction={
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => sendWhatsApp(num)}
                        >
                          WhatsApp
                        </Button>
                      }
                      disablePadding
                    >
                      <ListItemText primary={num} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No WhatsApp numbers found.</Typography>
              )}
            </Box>
            <Box>
              <Typography fontWeight={600} mb={1}>
                Add Number
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  type="text"
                  value={newNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 919999999999"
                  inputProps={{ inputMode: "numeric" }}
                  disabled={adding}
                  size="small"
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddNumber}
                  disabled={adding || !newNumber.trim()}
                >
                  {adding ? "Adding..." : "Add"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} fullWidth variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientContactModal;
