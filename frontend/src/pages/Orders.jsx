import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  MenuItem,
  TextField,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  ShoppingBag as OrderIcon,
  RemoveCircleOutline as RemoveIcon,
  ReceiptLong as InvoiceIcon,
  Person as PersonIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
import API from '../api/client';
import { useNotification } from '../context/NotificationContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal controls
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Selected items
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Creation Form State
  const [customerId, setCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const showNotification = useNotification();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, custRes] = await Promise.all([
        API.get('/orders'),
        API.get('/products'),
        API.get('/customers')
      ]);
      setOrders(ordRes.data);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch transaction logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleOpenCreate = () => {
    setCustomerId('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setFormErrors({});
    setCreateOpen(true);
  };

  const handleAddLineItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveLineItem = (index) => {
    if (orderItems.length === 1) return;
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  // Live order calculations
  const calculateTotal = () => {
    return orderItems.reduce((acc, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        return acc + (parseFloat(product.price) * parseInt(item.quantity || 0));
      }
      return acc;
    }, 0);
  };

  // Form validations
  const validateForm = () => {
    const errors = {};
    if (!customerId) errors.customer_id = 'Customer selection is required';
    
    const itemErrors = [];
    orderItems.forEach((item, index) => {
      const err = {};
      if (!item.product_id) {
        err.product_id = 'Product is required';
      } else {
        const product = products.find(p => p.id === item.product_id);
        if (product && parseInt(item.quantity) > product.quantity_in_stock) {
          err.quantity = `Stock insufficient (${product.quantity_in_stock} available)`;
        }
      }
      
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        err.quantity = 'Quantity must be positive';
      }
      
      if (Object.keys(err).length > 0) {
        itemErrors[index] = err;
      }
    });

    if (itemErrors.length > 0) {
      errors.items = itemErrors;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    const payload = {
      customer_id: customerId,
      status: 'completed',
      items: orderItems.map(item => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity)
      }))
    };

    try {
      await API.post('/orders', payload);
      setCreateOpen(false);
      
      // Confetti celebration for successful transaction
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#38BDF8', '#EC4899', '#10B981']
      });
      
      showNotification('Order processed and inventory reduced successfully!', 'success');
      fetchInitialData();
    } catch (err) {
      showNotification(err.message || 'Failed to complete transaction.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenDelete = (order) => {
    setSelectedOrder(order);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setSubmitLoading(true);
    try {
      await API.delete(`/orders/${selectedOrder.id}`);
      showNotification('Order invoice deleted successfully.');
      setDeleteOpen(false);
      fetchInitialData();
    } catch (err) {
      showNotification(err.message || 'Could not delete order.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#F3F4F6', mb: 0.5 }}>
            Transaction Logs
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
            Process sales invoices, track shipments, and review invoice details.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1.2,
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #0EA5E9 100%)',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)'
            }
          }}
        >
          Create Order
        </Button>
      </Box>

      {/* Orders Data Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#10B981' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} className="glass-card" sx={{ p: 1, bgcolor: '#111827' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#9CA3AF', fontWeight: 600 } }}>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="center">Items Count</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Transaction Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8, color: '#9CA3AF', borderBottom: 'none' }}>
                    <InvoiceIcon sx={{ fontSize: 48, mb: 1.5, color: 'rgba(255,255,255,0.1)' }} />
                    <Typography variant="body1">
                      No invoices found. Click "Create Order" to complete your first transaction.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow
                    key={o.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#F3F4F6' }
                    }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#38BDF8' }}>
                      #INV-{o.id.toString().padStart(5, '0')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {o.customer?.full_name || 'Deleted Customer'}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {o.order_items?.reduce((acc, item) => acc + item.quantity, 0) || 0}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: '#10B981' }}>
                      ${parseFloat(o.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={o.status.toUpperCase()}
                        color="success"
                        size="small"
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.65rem', 
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                      {new Date(o.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDetails(o)} sx={{ color: '#38BDF8', mr: 1, '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)' } }}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Invoice Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#151B26',
            color: '#F3F4F6',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            width: '100%',
            maxWidth: 600,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InvoiceIcon sx={{ color: '#38BDF8' }} />
            <Typography variant="h6" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
              Invoice Details
            </Typography>
          </Box>
          <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', color: '#9CA3AF' }}>
            #INV-{selectedOrder?.id.toString().padStart(5, '0')}
          </Typography>
        </DialogTitle>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 3 }} />
        
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Customer & Order Metadata */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ color: '#9CA3AF', mb: 0.5 }}>Customer Information</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8' }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedOrder?.customer?.full_name || 'Deleted Customer'}</Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{selectedOrder?.customer?.email}</Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} align={ {xs: 'left', sm: 'right'} }>
              <Typography variant="subtitle2" sx={{ color: '#9CA3AF', mb: 0.5 }}>Transaction Summary</Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                Date: {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={selectedOrder?.status.toUpperCase()}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: '4px', bgcolor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Invoice Items Table */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#9CA3AF', mb: 1 }}>Line Items Purchased</Typography>
            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#9CA3AF', fontWeight: 600 } }}>
                    <TableCell>Product / SKU</TableCell>
                    <TableCell align="center">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder?.order_items?.map((item) => (
                    <TableRow key={item.id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#F3F4F6' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.product?.name || 'Deleted Product'}</Typography>
                        <Typography variant="caption" sx={{ color: '#38BDF8', fontFamily: 'monospace' }}>{item.product?.sku}</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>{item.quantity}</TableCell>
                      <TableCell align="right">${parseFloat(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#38BDF8' }}>${parseFloat(item.subtotal).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Grand Total */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#9CA3AF', fontWeight: 600 }}>Invoice Total:</Typography>
            <Typography variant="h5" sx={{ color: '#10B981', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
              ${selectedOrder && parseFloat(selectedOrder.total_amount).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsOpen(false)} variant="contained" sx={{ bgcolor: '#6366F1', textTransform: 'none', fontWeight: 600, px: 4, '&:hover': { bgcolor: '#4F46E5' } }}>
            Close Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Order Wizard Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => !submitLoading && setCreateOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: '#151B26',
            color: '#F3F4F6',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <OrderIcon sx={{ color: '#10B981' }} />
          Create Order
        </DialogTitle>
        <form onSubmit={handleCreateOrder}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 1 }}>
            {/* Customer Picker */}
            <TextField
              select
              label="Select Customer Account"
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                if (formErrors.customer_id) setFormErrors(prev => ({ ...prev, customer_id: null }));
              }}
              error={!!formErrors.customer_id}
              helperText={formErrors.customer_id}
              fullWidth
              variant="outlined"
              sx={{ '& label': { color: '#9CA3AF' }, '& .MuiSelect-select': { color: '#F3F4F6' } }}
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </MenuItem>
              ))}
            </TextField>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

            {/* Line Items Builder */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#F3F4F6', fontFamily: "'Outfit', sans-serif" }}>
                  Items Basket
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddLineItem}
                  sx={{ color: '#38BDF8', fontWeight: 600, textTransform: 'none' }}
                >
                  Add Item
                </Button>
              </Box>

              {orderItems.map((item, index) => {
                const selectedProd = products.find(p => p.id === item.product_id);
                const maxStock = selectedProd ? selectedProd.quantity_in_stock : 0;
                const price = selectedProd ? parseFloat(selectedProd.price) : 0.00;
                const subtotal = price * parseInt(item.quantity || 0);

                const itemError = formErrors.items && formErrors.items[index];

                return (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      bgcolor: 'rgba(255,255,255,0.01)', 
                      border: '1px solid rgba(255,255,255,0.03)', 
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      {/* Product Selector */}
                      <Grid item xs={12} sm={5}>
                        <TextField
                          select
                          label="Choose Product"
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          error={itemError && !!itemError.product_id}
                          helperText={itemError && itemError.product_id}
                          fullWidth
                          size="small"
                          sx={{ '& label': { color: '#9CA3AF' }, '& .MuiSelect-select': { color: '#F3F4F6' } }}
                        >
                          {products.map((p) => (
                            <MenuItem key={p.id} value={p.id} disabled={p.quantity_in_stock <= 0}>
                              {p.name} (SKU: {p.sku}) | Stock: {p.quantity_in_stock}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {/* Quantity */}
                      <Grid item xs={12} sm={2.5}>
                        <TextField
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          error={itemError && !!itemError.quantity}
                          helperText={itemError && itemError.quantity}
                          fullWidth
                          size="small"
                          InputProps={{ inputProps: { min: 1 } }}
                          sx={{ '& label': { color: '#9CA3AF' }, '& input': { color: '#F3F4F6' } }}
                        />
                      </Grid>

                      {/* Price display */}
                      <Grid item xs={6} sm={2} align="right">
                        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>Unit Price</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#F3F4F6' }}>
                          ${price.toFixed(2)}
                        </Typography>
                      </Grid>

                      {/* Subtotal */}
                      <Grid item xs={6} sm={2} align="right">
                        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>Subtotal</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#38BDF8' }}>
                          ${subtotal.toFixed(2)}
                        </Typography>
                      </Grid>

                      {/* Action Delete */}
                      <Grid item xs={12} sm={0.5} align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveLineItem(index)}
                          disabled={orderItems.length === 1}
                          sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>

            {/* Total Indicator Block */}
            <Box sx={{ p: 3, borderRadius: '12px', bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#F3F4F6' }}>Basket Total</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', fontFamily: "'Outfit', sans-serif" }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} disabled={submitLoading} sx={{ color: '#9CA3AF', textTransform: 'none', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitLoading}
              variant="contained"
              sx={{
                bgcolor: '#10B981',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              {submitLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Place Order'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Invoice Confirmation Modal */}
      <Dialog
        open={deleteOpen}
        onClose={() => !submitLoading && setDeleteOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#151B26',
            color: '#F3F4F6',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            width: '100%',
            maxWidth: 400,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#EF4444' }}>
          Delete Invoice?
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ color: '#F3F4F6' }}>
            Are you sure you want to delete invoice <strong>#INV-{selectedOrder?.id.toString().padStart(5, '0')}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 1.5 }}>
            Warning: This action is permanent and will delete the invoice record from database logs. It will not automatically restore stock.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={submitLoading} sx={{ color: '#9CA3AF', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={submitLoading}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: 3
            }}
          >
            {submitLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
