import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { registerUser, getUsers, ResetPassword } from "../api/User";
import LockResetIcon from "@mui/icons-material/LockReset";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const UserCard: React.FC<{ user: any; onReset: (user: any) => void }> = ({
  user,
  onReset,
}) => (
  <Card
    variant="outlined"
    sx={{
      mb: 2,
      borderRadius: 2,
      boxShadow:
        "0 2px 8px 0 rgba(60,72,100,0.08), 0 1.5px 4px 0 rgba(60,72,100,0.04)",
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="primary"
            gutterBottom
          >
            {user.username || "-"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <b>Email:</b> {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <b>Role:</b> {user.role}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <b>Created:</b>{" "}
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })
              : "-"}
          </Typography>
        </Box>
        <IconButton
          color="primary"
          onClick={() => onReset(user)}
          title="Reset Password"
          sx={{ ml: 1 }}
        >
          <LockResetIcon />
        </IconButton>
      </Stack>
    </CardContent>
  </Card>
);

const Users: React.FC = () => {
  // State for user list
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Register dialog state
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // Reset password dialog state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetUser, setResetUser] = useState<any | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Responsive
  const isMobile = useMediaQuery("(max-width:600px)");

  // Fetch users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res.users) ? res.users : []);
    } catch (err) {
      setUsersError("Failed to fetch users.");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Register user handler
  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRegisterLoading(true);
    try {
      await registerUser(regUsername, regEmail, regPassword);
      setSnackbar({
        open: true,
        message: "User registered successfully.",
        severity: "success",
      });
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegisterDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to register user.",
        severity: "error",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  // Open reset password dialog for a user
  const openResetDialog = (user: any) => {
    setResetUser(user);
    setResetPassword("");
    setResetDialogOpen(true);
  };

  // Reset password handler
  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resetUser) return;
    setResetLoading(true);
    try {
      await ResetPassword(resetUser._id, resetPassword);
      setSnackbar({
        open: true,
        message: "Password reset successfully.",
        severity: "success",
      });
      setResetDialogOpen(false);
      setResetUser(null);
      setResetPassword("");
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to reset password.",
        severity: "error",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: { xs: 1, sm: 4 },
        background: "#f7fafd",
        minHeight: "100vh",
      }}
    >
      <Stack
        direction={isMobile ? "column" : "row"}
        alignItems={isMobile ? "stretch" : "center"}
        justifyContent="space-between"
        mb={isMobile ? 2 : 4}
        spacing={isMobile ? 2 : 0}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: 700, color: "#1976d2" }}
        >
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setRegisterDialogOpen(true)}
          fullWidth={isMobile}
          sx={isMobile ? { mt: 1 } : {}}
        >
          Register User
        </Button>
      </Stack>

      {/* User List */}
      <Paper sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Users
        </Typography>
        {loadingUsers ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : usersError ? (
          <Alert severity="error">{usersError}</Alert>
        ) : isMobile ? (
          <Box>
            {users.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                No users found.
              </Typography>
            ) : (
              users.map((user) => (
                <UserCard key={user._id} user={user} onReset={openResetDialog} />
              ))
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Username</b>
                  </TableCell>
                  <TableCell>
                    <b>Email</b>
                  </TableCell>
                  <TableCell>
                    <b>Role</b>
                  </TableCell>
                  <TableCell>
                    <b>Created At</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                              }
                            )
                          : "-"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => openResetDialog(user)}
                          title="Reset Password"
                        >
                          <LockResetIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Register User Dialog */}
      <Dialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleRegister}>
          <DialogTitle>Register New User</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                size="small"
                autoFocus
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                size="small"
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                size="small"
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setRegisterDialogOpen(false)}
              disabled={registerLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={registerLoading}
            >
              {registerLoading ? <CircularProgress size={22} /> : "Register"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleResetPassword}>
          <DialogTitle>
            Reset Password
            {resetUser && (
              <Typography
                variant="subtitle2"
                sx={{ mt: 0.5, color: "text.secondary" }}
              >
                {resetUser.username
                  ? `User: ${resetUser.username}`
                  : resetUser.email}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="New Password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                required
                size="small"
                autoFocus
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setResetDialogOpen(false)}
              disabled={resetLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={resetLoading}
            >
              {resetLoading ? <CircularProgress size={22} /> : "Reset"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;
