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
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Grid,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProfiles, setTotalProfiles] = useState(0);
  
  // Filters
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [premiumFilter, setPremiumFilter] = useState('');
  
  // Verification dialog
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [verificationData, setVerificationData] = useState({
    idVerified: false,
    photoVerified: false,
    educationVerified: false,
    incomeVerified: false,
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    premium: 0,
  });

  useEffect(() => {
    loadProfiles();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, verifiedFilter, premiumFilter]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      if (verifiedFilter !== '') {
        params.verified = verifiedFilter;
      }
      
      if (premiumFilter !== '') {
        params.premium = premiumFilter;
      }

      const response = await adminService.getAllProfiles(params);
      setProfiles(response.data || []);
      setTotalProfiles(response.pagination?.total || 0);
    } catch (err) {
      console.error('Load profiles error:', err);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response.success && response.data.profiles) {
        setStats({
          total: response.data.profiles.total || 0,
          verified: 0, // You can add this to backend if needed
          premium: response.data.profiles.premium || 0,
        });
      }
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleVerifyClick = (profile) => {
    setSelectedProfile(profile);
    setVerificationData({
      idVerified: profile.verification?.idVerified || false,
      photoVerified: profile.verification?.photoVerified || false,
      educationVerified: profile.verification?.educationVerified || false,
      incomeVerified: profile.verification?.incomeVerified || false,
    });
    setVerifyDialogOpen(true);
  };

  const handleVerificationSubmit = async () => {
    try {
      await adminService.verifyProfile(selectedProfile.profileId, verificationData);
      toast.success('Profile verification updated successfully');
      setVerifyDialogOpen(false);
      loadProfiles();
    } catch (err) {
      console.error('Verification error:', err);
      toast.error(err.response?.data?.message || 'Failed to update verification');
    }
  };

  const getVerificationLevel = (profile) => {
    if (!profile.verification) return 0;
    const { idVerified, photoVerified, educationVerified, incomeVerified } = profile.verification;
    let count = 0;
    if (idVerified) count++;
    if (photoVerified) count++;
    if (educationVerified) count++;
    if (incomeVerified) count++;
    return count;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Profile Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and verify user profiles
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Profiles
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <VisibilityIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Premium Profiles
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.premium}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <PremiumIcon fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Verified Profiles
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {profiles.filter(p => getVerificationLevel(p) >= 2).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <VerifiedIcon fontSize="large" />
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
            <InputLabel>Verification</InputLabel>
            <Select
              value={verifiedFilter}
              label="Verification"
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Verified</MenuItem>
              <MenuItem value="false">Not Verified</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Premium</InputLabel>
            <Select
              value={premiumFilter}
              label="Premium"
              onChange={(e) => {
                setPremiumFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Premium</MenuItem>
              <MenuItem value="false">Free</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadProfiles}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Profiles Table */}
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
                    <TableCell>Profile ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Verification</TableCell>
                    <TableCell>Premium</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                          No profiles found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile._id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {profile.profileId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={profile.profilePhoto}
                              alt={profile.firstName}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Typography variant="body2">
                              {profile.firstName} {profile.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {profile.userId?.email || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={profile.gender || 'N/A'}
                            size="small"
                            color={profile.gender === 'male' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>{profile.age || 'N/A'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {profile.city}, {profile.state}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={`ID: ${profile.verification?.idVerified ? '✓' : '✗'}, Photo: ${profile.verification?.photoVerified ? '✓' : '✗'}, Education: ${profile.verification?.educationVerified ? '✓' : '✗'}, Income: ${profile.verification?.incomeVerified ? '✓' : '✗'}`}>
                            <Chip
                              icon={<VerifiedIcon />}
                              label={`${getVerificationLevel(profile)}/4`}
                              size="small"
                              color={getVerificationLevel(profile) >= 2 ? 'success' : 'default'}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {profile.isPremium ? (
                            <Chip icon={<PremiumIcon />} label="Premium" size="small" color="warning" />
                          ) : (
                            <Chip label="Free" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          {profile.isActive ? (
                            <Chip label="Active" size="small" color="success" />
                          ) : (
                            <Chip label="Inactive" size="small" color="error" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Verify Profile">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleVerifyClick(profile)}
                            >
                              <VerifiedIcon />
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
              count={totalProfiles}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Verify Profile: {selectedProfile?.profileId}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select verification types for this profile:
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationData.idVerified}
                    onChange={(e) => setVerificationData({ ...verificationData, idVerified: e.target.checked })}
                  />
                }
                label="ID Verified"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationData.photoVerified}
                    onChange={(e) => setVerificationData({ ...verificationData, photoVerified: e.target.checked })}
                  />
                }
                label="Photo Verified"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationData.educationVerified}
                    onChange={(e) => setVerificationData({ ...verificationData, educationVerified: e.target.checked })}
                  />
                }
                label="Education Verified"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={verificationData.incomeVerified}
                    onChange={(e) => setVerificationData({ ...verificationData, incomeVerified: e.target.checked })}
                  />
                }
                label="Income Verified"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleVerificationSubmit} variant="contained" color="primary">
            Update Verification
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
