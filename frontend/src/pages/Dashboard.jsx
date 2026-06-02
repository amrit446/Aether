import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  LinearProgress
} from '@mui/material';
import {
  Inventory as ProductIcon,
  People as CustomerIcon,
  ShoppingBag as OrderIcon,
  Warning as AlertIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import API from '../api/client';
import { useNotification } from '../context/NotificationContext';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const showNotification = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await API.get('/dashboard');
      setMetrics(res.data);
    } catch (err) {
      showNotification(err.message || 'Failed to load dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#38BDF8' }} />
      </Box>
    );
  }

  const kpis = [
    {
      title: 'Total Products',
      value: metrics?.total_products || 0,
      icon: <ProductIcon sx={{ fontSize: 32, color: '#38BDF8' }} />,
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)',
      borderColor: 'rgba(56, 189, 248, 0.2)',
      path: '/products'
    },
    {
      title: 'Total Customers',
      value: metrics?.total_customers || 0,
      icon: <CustomerIcon sx={{ fontSize: 32, color: '#EC4899' }} />,
      gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(244, 63, 94, 0.05) 100%)',
      borderColor: 'rgba(236, 72, 153, 0.2)',
      path: '/customers'
    },
    {
      title: 'Total Orders',
      value: metrics?.total_orders || 0,
      icon: <OrderIcon sx={{ fontSize: 32, color: '#10B981' }} />,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      path: '/orders'
    },
    {
      title: 'Low Stock Alerts',
      value: metrics?.low_stock_products?.length || 0,
      icon: <AlertIcon sx={{ fontSize: 32, color: '#F59E0B' }} />,
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6) 05%)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      path: '#low-stock'
    }
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Welcome Banner */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: "'Outfit', sans-serif", 
            fontWeight: 800, 
            mb: 1,
            color: '#F3F4F6'
          }}
        >
          Control Center
        </Typography>
        <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
          Real-time metrics, order execution tracker, and inventory statuses.
        </Typography>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {kpis.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.title}>
            <Paper
              className="glass-card"
              onClick={() => kpi.path.startsWith('/') && navigate(kpi.path)}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: kpi.gradient,
                borderColor: kpi.borderColor,
                cursor: kpi.path.startsWith('/') ? 'pointer' : 'default',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#9CA3AF', fontFamily: "'Inter', sans-serif" }}>
                  {kpi.title}
                </Typography>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.02)', display: 'flex' }}>
                  {kpi.icon}
                </Box>
              </Box>
              
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 1, color: '#F3F4F6' }}>
                  {kpi.value}
                </Typography>
                {kpi.path.startsWith('/') && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#818CF8', fontSize: '0.8rem', fontWeight: 600 }}>
                    Manage Items <ArrowIcon sx={{ fontSize: 14 }} />
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Low Stock Warning Section */}
      <Box id="low-stock" sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AlertIcon sx={{ color: '#F59E0B' }} />
            <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#F3F4F6' }}>
              Inventory Shortage Alerts
            </Typography>
          </Box>
          <Chip 
            label={`${metrics?.low_stock_products?.length || 0} Products Need Attention`} 
            color={metrics?.low_stock_products?.length > 0 ? 'warning' : 'success'} 
            sx={{ fontWeight: 600, borderRadius: '8px' }}
          />
        </Box>

        <TableContainer component={Paper} className="glass-card" sx={{ p: 1, bgcolor: '#111827' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#9CA3AF', fontWeight: 600 } }}>
                <TableCell>SKU</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="center">Quantity Left</TableCell>
                <TableCell align="left">Stock Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics?.low_stock_products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#9CA3AF', borderBottom: 'none' }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      All items are fully stocked! No shortages detected.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                metrics?.low_stock_products?.map((row) => {
                  const percent = Math.min((row.quantity_in_stock / 10) * 100, 100);
                  const isOutOfStock = row.quantity_in_stock === 0;

                  return (
                    <TableRow 
                      key={row.id} 
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#F3F4F6' }
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#38BDF8' }}>
                        {row.sku}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ${parseFloat(row.price).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 0.5, px: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: isOutOfStock ? '#EF4444' : '#F59E0B' }}>
                            {row.quantity_in_stock} / 10
                          </Typography>
                          <Box sx={{ width: '100%' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={percent} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3, 
                                bgcolor: 'rgba(255,255,255,0.05)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: isOutOfStock ? '#EF4444' : '#F59E0B',
                                  borderRadius: 3
                                }
                              }} 
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK'}
                          color={isOutOfStock ? 'error' : 'warning'}
                          size="small"
                          sx={{ 
                            fontWeight: 700, 
                            fontSize: '0.7rem', 
                            borderRadius: '6px',
                            background: isOutOfStock ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            border: isOutOfStock ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
