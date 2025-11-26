import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Pending as PendingIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import adminService from '../../services/adminService';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalReports, setTotalReports] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  
  // Review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewData, setReviewData] = useState({
    status: '',
    actionTaken: '',
    adminNotes: '',
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0,
  });

  useEffect(() => {
    loadReports();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await adminService.getAllReports(params);
      setReports(response.data || []);
      setTotalReports(response.pagination?.total || 0);
      
      // Calculate stats from loaded data
      calculateStats(response.data || []);
    } catch (err) {
      console.error('Load reports error:', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response.success && response.data.reports) {
        setStats(prev => ({
          ...prev,
          pending: response.data.reports.pending || 0,
        }));
      }
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  const calculateStats = (reportsData) => {
    const resolved = reportsData.filter(r => r.status === 'resolved').length;
    const dismissed = reportsData.filter(r => r.status === 'dismissed').length;
    
    setStats(prev => ({
      ...prev,
      total: reportsData.length,
      resolved,
      dismissed,
    }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleReviewClick = (report) => {
    setSelectedReport(report);
    setReviewData({
      status: report.status || 'pending',
      actionTaken: report.actionTaken || '',
      adminNotes: report.adminNotes || '',
    });
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = async () => {
    try {
      await adminService.updateReport(selectedReport._id, reviewData);
      toast.success('Report updated successfully');
      setReviewDialogOpen(false);
      loadReports();
    } catch (err) {
      console.error('Update report error:', err);
      toast.error(err.response?.data?.message || 'Failed to update report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'dismissed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (category) => {
    switch (category) {
      case 'harassment':
      case 'inappropriate_content':
        return 'error';
      case 'spam':
      case 'fake_profile':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Report Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and manage user reports
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Reports
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {totalReports}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <ReportIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.pending}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <PendingIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Resolved
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.resolved}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircleIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Dismissed
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.dismissed}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'grey.500', width: 56, height: 56 }}>
                  <BlockIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterListIcon color="action" />
          <Typography variant="h6">Filters</Typography>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="dismissed">Dismissed</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadReports}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Alert for pending reports */}
      {stats.pending > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have {stats.pending} pending report{stats.pending > 1 ? 's' : ''} that need{stats.pending === 1 ? 's' : ''} review.
        </Alert>
      )}

      {/* Reports Table */}
      <Paper elevation={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report ID</TableCell>
                    <TableCell>Reported By</TableCell>
                    <TableCell>Reported User</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No reports found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{report._id.slice(-6)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.reportedBy?.email || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.reportedUser?.email || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.category?.replace(/_/g, ' ') || 'Other'}
                            size="small"
                            color={getSeverityColor(report.category)}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={report.reason || 'No reason provided'}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {report.reason || 'No reason provided'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={report.status || 'pending'}
                            size="small"
                            color={getStatusColor(report.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.createdAt ? format(new Date(report.createdAt), 'MMM dd, yyyy') : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Review Report">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleReviewClick(report)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalReports}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Review Report #{selectedReport?._id?.slice(-6)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Report Details */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Report Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Reported By:</strong> {selectedReport?.reportedBy?.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Reported User:</strong> {selectedReport?.reportedUser?.email || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Category:</strong> {selectedReport?.category?.replace(/_/g, ' ') || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Date:</strong> {selectedReport?.createdAt ? format(new Date(selectedReport.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Reason:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedReport?.reason || 'No reason provided'}
                  </Typography>
                </Grid>
                {selectedReport?.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Description:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedReport.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Review Form */}
            <Typography variant="subtitle2" gutterBottom>
              Admin Review
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={reviewData.status}
                label="Status"
                onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="dismissed">Dismissed</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Action Taken"
              multiline
              rows={2}
              value={reviewData.actionTaken}
              onChange={(e) => setReviewData({ ...reviewData, actionTaken: e.target.value })}
              placeholder="e.g., User suspended for 7 days, Warning sent, etc."
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Admin Notes"
              multiline
              rows={3}
              value={reviewData.adminNotes}
              onChange={(e) => setReviewData({ ...reviewData, adminNotes: e.target.value })}
              placeholder="Internal notes about this report..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReviewSubmit} variant="contained" color="primary">
            Update Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
