import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  VerifiedUser as VerifiedIcon,
  AccountBox as ProfileIcon,
  Favorite as MatchIcon,
  Report as ReportIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (error) {
      console.error('Fetch dashboard stats error:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h3" component="div" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.100`,
              color: `${color}.main`,
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon sx={{ fontSize: 40 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Main Stats Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.users?.total || 0}
            subtitle={`${stats?.users?.recentRegistrations || 0} new this week`}
            icon={PeopleIcon}
            color="primary"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats?.users?.active || 0}
            subtitle={`${stats?.users?.verified || 0} verified`}
            icon={VerifiedIcon}
            color="success"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>

        {/* Total Profiles */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Profiles"
            value={stats?.profiles?.total || 0}
            subtitle={`${stats?.profiles?.premium || 0} premium`}
            icon={ProfileIcon}
            color="info"
            onClick={() => navigate('/admin/profiles')}
          />
        </Grid>

        {/* Total Matches */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Matches"
            value={stats?.matches?.total || 0}
            subtitle={`${stats?.interactions?.recentInterests || 0} interests this week`}
            icon={MatchIcon}
            color="secondary"
          />
        </Grid>

        {/* Pending Reports */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Reports"
            value={stats?.reports?.pending || 0}
            subtitle="Requires attention"
            icon={ReportIcon}
            color="error"
            onClick={() => navigate('/admin/reports')}
          />
        </Grid>

        {/* Verified Users */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Users"
            value={stats?.users?.verified || 0}
            subtitle={`${Math.round((stats?.users?.verified / stats?.users?.total) * 100) || 0}% of total`}
            icon={VerifiedIcon}
            color="success"
          />
        </Grid>

        {/* Recent Registrations */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Week"
            value={stats?.users?.recentRegistrations || 0}
            subtitle="New registrations"
            icon={TrendingUpIcon}
            color="warning"
          />
        </Grid>

        {/* Premium Profiles */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Premium Profiles"
            value={stats?.profiles?.premium || 0}
            subtitle={`${Math.round((stats?.profiles?.premium / stats?.profiles?.total) * 100) || 0}% of profiles`}
            icon={ProfileIcon}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              onClick={() => navigate('/admin/users')}
              sx={{
                p: 2,
                bgcolor: 'primary.50',
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'primary.100',
                  transform: 'scale(1.02)'
                }
              }}
            >
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
                Manage Users
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              onClick={() => navigate('/admin/profiles')}
              sx={{
                p: 2,
                bgcolor: 'info.50',
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'info.100',
                  transform: 'scale(1.02)'
                }
              }}
            >
              <ProfileIcon sx={{ fontSize: 40, color: 'info.main' }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
                Manage Profiles
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              onClick={() => navigate('/admin/reports')}
              sx={{
                p: 2,
                bgcolor: 'error.50',
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'error.100',
                  transform: 'scale(1.02)'
                }
              }}
            >
              <ReportIcon sx={{ fontSize: 40, color: 'error.main' }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
                View Reports
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'success.50',
                borderRadius: 2,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'success.100',
                  transform: 'scale(1.02)'
                }
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
                Analytics
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
