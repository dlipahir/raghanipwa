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
  Stack,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  WhatsApp as WhatsAppIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  getAllClientContacts,
  createClientContact,
  updateClientContact,
  deleteClientContact,
} from "@/api/clientContact";

// Types
interface ClientContactItem {
  _id?: string;
  id?: string | number;
  client_name: string;
  whatsapp_nos: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Edit/Create Dialog Component
interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  contact: ClientContactItem | null;
  onSave: () => void;
}

const ContactDialog: React.FC<ContactDialogProps> = ({
  open,
  onClose,
  contact,
  onSave,
}) => {
  const [clientName, setClientName] = useState("");
  const [whatsappNumbers, setWhatsappNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setClientName(contact.client_name || "");
      setWhatsappNumbers(contact.whatsapp_nos || []);
    } else {
      setClientName("");
      setWhatsappNumbers([]);
    }
    setNewNumber("");
    setError(null);
  }, [contact, open]);

  const handleAddNumber = () => {
    if (newNumber.trim() && !whatsappNumbers.includes(newNumber.trim())) {
      setWhatsappNumbers([...whatsappNumbers, newNumber.trim()]);
      setNewNumber("");
    }
  };

  const handleRemoveNumber = (index: number) => {
    setWhatsappNumbers(whatsappNumbers.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      setError("Client name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const contactData = {
        client_name: clientName.trim(),
        whatsapp_nos: whatsappNumbers,
      };

      if (contact && (contact._id || contact.id)) {
        await updateClientContact(contact._id || contact.id!, contactData);
      } else {
        await createClientContact(contactData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  const sendWhatsApp = (number: string) => {
    const url = `https://wa.me/91${number}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {contact ? "Edit Client Contact" : "Create Client Contact"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            fullWidth
            required
            disabled={saving}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              WhatsApp Numbers
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                type="text"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="e.g. 919999999999"
                inputProps={{ inputMode: "numeric" }}
                disabled={saving}
                size="small"
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddNumber();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddNumber}
                disabled={saving || !newNumber.trim()}
              >
                Add
              </Button>
            </Stack>
            {whatsappNumbers.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {whatsappNumbers.map((num, idx) => (
                  <Chip
                    key={idx}
                    label={num}
                    onDelete={() => handleRemoveNumber(idx)}
                    deleteIcon={<DeleteIcon />}
                    icon={<WhatsAppIcon />}
                    color="success"
                    variant="outlined"
                    onClick={() => sendWhatsApp(num)}
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No WhatsApp numbers added yet
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !clientName.trim()}
        >
          {saving ? "Saving..." : contact ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Mobile Card Component
const ClientContactCard: React.FC<{
  contact: ClientContactItem;
  onEdit: (contact: ClientContactItem) => void;
  onDelete: (id: string | number) => void;
}> = ({ contact, onEdit, onDelete }) => {
  const sendWhatsApp = (number: string) => {
    const url = `https://wa.me/91${number}`;
    window.open(url, "_blank");
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        borderRadius: 2,
        boxShadow: "0 2px 8px 0 rgba(60,72,100,0.08), 0 1.5px 4px 0 rgba(60,72,100,0.04)",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} color="primary">
            {contact.client_name}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(contact)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(contact._id || contact.id!)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <b>WhatsApp Numbers:</b> {contact.whatsapp_nos?.length || 0}
        </Typography>
        {contact.whatsapp_nos && contact.whatsapp_nos.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
            {contact.whatsapp_nos.map((num, idx) => (
              <Chip
                key={idx}
                label={num}
                icon={<WhatsAppIcon />}
                color="success"
                variant="outlined"
                size="small"
                onClick={() => sendWhatsApp(num)}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const ClientContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<ClientContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientContactItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string | number | null;
    name: string;
  }>({ open: false, id: null, name: "" });
  const [filterName, setFilterName] = useState("");

  const isMobile = useMediaQuery("(max-width:600px)");

  // Filter contacts based on name
  const filteredContacts = contacts.filter((contact) =>
    contact.client_name.toLowerCase().includes(filterName.toLowerCase())
  );

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllClientContacts();
      // Handle different response formats
      const contactsList = Array.isArray(data) ? data : (data?.contacts || []);
      setContacts(contactsList);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load client contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreate = () => {
    setEditingContact(null);
    setDialogOpen(true);
  };

  const handleEdit = (contact: ClientContactItem) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleDelete = (id: string | number) => {
    const contact = contacts.find((c) => (c._id || c.id) === id);
    setDeleteConfirm({
      open: true,
      id,
      name: contact?.client_name || "",
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      await deleteClientContact(deleteConfirm.id);
      await fetchContacts();
      setDeleteConfirm({ open: false, id: null, name: "" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete contact");
      setDeleteConfirm({ open: false, id: null, name: "" });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingContact(null);
  };

  const handleSave = () => {
    fetchContacts();
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, minHeight: "100vh", boxSizing: "border-box" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Client Contacts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          size={isMobile ? "small" : "medium"}
        >
          Add Contact
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Name Filter */}
      <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Filter by client name..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          size={isMobile ? "small" : "medium"}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper elevation={2} sx={{ mb: 2, p: isMobile ? 1 : 0 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 120,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : filteredContacts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography color="text.secondary">
              {filterName ? "No contacts match your filter." : "No client contacts found."}
            </Typography>
            {!filterName && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{ mt: 2 }}
              >
                Create First Contact
              </Button>
            )}
          </Box>
        ) : isMobile ? (
          <Box>
            {filteredContacts.map((contact) => (
              <ClientContactCard
                key={contact._id || contact.id}
                contact={contact}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client Name</TableCell>
                  <TableCell>WhatsApp Numbers</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id || contact.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{contact.client_name}</Typography>
                    </TableCell>
                    <TableCell>
                      {contact.whatsapp_nos && contact.whatsapp_nos.length > 0 ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                          {contact.whatsapp_nos.map((num, idx) => (
                            <Chip
                              key={idx}
                              label={num}
                              icon={<WhatsAppIcon />}
                              color="success"
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                const url = `https://wa.me/91${num}`;
                                window.open(url, "_blank");
                              }}
                              sx={{ cursor: "pointer" }}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No numbers
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(contact)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(contact._id || contact.id!)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <ContactDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        contact={editingContact}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: "" })}
      >
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the contact for{" "}
            <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm({ open: false, id: null, name: "" })}
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientContactPage;

