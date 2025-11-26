import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  
  // Dialogs
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, email: '' });
  const [suspendDialog, setSuspendDialog] = useState({ open: false, userId: null, email: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState(7);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filterStatus, filterVerified]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (filterStatus) params.status = filterStatus;
      if (filterVerified) params.verified = filterVerified;

      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data);
      setTotalUsers(res.data.pagination.total);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleToggleVerified = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, {
        isVerified: !currentStatus
      });
      toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Toggle verified error:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleSuspendUser = async () => {
    try {
      await api.put(`/admin/users/${suspendDialog.userId}/suspend`, {
        reason: suspendReason,
        duration: suspendDuration
      });
      toast.success('User suspended successfully');
      setSuspendDialog({ open: false, userId: null, email: '' });
      setSuspendReason('');
      setSuspendDuration(7);
      fetchUsers();
    } catch (error) {
      console.error('Suspend user error:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/users/${deleteDialog.userId}`);
      toast.success('User deleted successfully');
      setDeleteDialog({ open: false, userId: null, email: '' });
      fetchUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('Failed to delete user');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        User Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Verified</InputLabel>
            <Select
              value={filterVerified}
              label="Verified"
              onChange={(e) => setFilterVerified(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Verified</MenuItem>
              <MenuItem value="false">Unverified</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => {
              setFilterStatus('');
              setFilterVerified('');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Phone</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Verified</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Registered</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'secondary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                      icon={user.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isVerified ? 'Verified' : 'Unverified'}
                      color={user.isVerified ? 'success' : 'warning'}
                      size="small"
                      variant={user.isVerified ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color={user.isActive ? 'error' : 'success'}
                        onClick={() => handleToggleActive(user._id, user.isActive)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                        disabled={user.role === 'admin'}
                      >
                        {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </IconButton>

                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleToggleVerified(user._id, user.isVerified)}
                        title={user.isVerified ? 'Unverify' : 'Verify'}
                        disabled={user.role === 'admin'}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => setSuspendDialog({ open: true, userId: user._id, email: user.email })}
                        title="Suspend User"
                        disabled={user.role === 'admin'}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, userId: user._id, email: user.email })}
                        title="Delete User"
                        disabled={user.role === 'admin'}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog.open} onClose={() => setSuspendDialog({ open: false, userId: null, email: '' })}>
        <DialogTitle>Suspend User</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are about to suspend: <strong>{suspendDialog.email}</strong>
          </Alert>
          
          <TextField
            fullWidth
            label="Reason for Suspension"
            multiline
            rows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />

          <FormControl fullWidth>
            <InputLabel>Duration (Days)</InputLabel>
            <Select
              value={suspendDuration}
              label="Duration (Days)"
              onChange={(e) => setSuspendDuration(e.target.value)}
            >
              <MenuItem value={1}>1 Day</MenuItem>
              <MenuItem value={3}>3 Days</MenuItem>
              <MenuItem value={7}>7 Days</MenuItem>
              <MenuItem value={14}>14 Days</MenuItem>
              <MenuItem value={30}>30 Days</MenuItem>
              <MenuItem value={90}>90 Days</MenuItem>
              <MenuItem value={365}>1 Year</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialog({ open: false, userId: null, email: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleSuspendUser}
            color="warning"
            variant="contained"
            disabled={!suspendReason.trim()}
          >
            Suspend User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null, email: '' })}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Are you sure you want to permanently delete: <strong>{deleteDialog.email}</strong>?
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. All user data including profile, matches, and interactions will be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null, email: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
