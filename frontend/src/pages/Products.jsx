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
  TextField,
  Chip,
  CircularProgress,
  InputAdornment,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory2 as BoxIcon
} from '@mui/icons-material';
import API from '../api/client';
import { useNotification } from '../context/NotificationContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog controls
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Form State
  const [selectedProduct, setSelectedProduct] = useState(null); // Null for Add, Product object for Edit
  const [formValues, setFormValues] = useState({ name: '', sku: '', price: '', quantity_in_stock: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const showNotification = useNotification();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch products list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormValues({
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity_in_stock: product.quantity_in_stock
      });
    } else {
      setSelectedProduct(null);
      setFormValues({ name: '', sku: '', price: '', quantity_in_stock: '' });
    }
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    // Clear errors as user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Form validations
  const validateForm = () => {
    const errors = {};
    if (!formValues.name.trim()) errors.name = 'Product name is required';
    if (!formValues.sku.trim()) errors.sku = 'SKU is required';
    
    const priceNum = parseFloat(formValues.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    const stockNum = parseInt(formValues.quantity_in_stock);
    if (isNaN(stockNum) || stockNum < 0) {
      errors.quantity_in_stock = 'Stock quantity cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    const payload = {
      name: formValues.name.trim(),
      sku: formValues.sku.trim().toUpperCase(),
      price: parseFloat(formValues.price),
      quantity_in_stock: parseInt(formValues.quantity_in_stock)
    };

    try {
      if (selectedProduct) {
        // Edit flow
        const res = await API.put(`/products/${selectedProduct.id}`, payload);
        showNotification(`${res.data.name} updated successfully!`);
      } else {
        // Add flow
        const res = await API.post('/products', payload);
        showNotification(`${res.data.name} added to inventory successfully!`);
      }
      setFormOpen(false);
      fetchProducts();
    } catch (err) {
      if (err.raw && err.raw.errors) {
        setFormErrors(err.raw.errors);
      } else {
        showNotification(err.message || 'Operation failed.', 'error');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setSubmitLoading(true);
    try {
      await API.delete(`/products/${selectedProduct.id}`);
      showNotification('Product deleted successfully.');
      setDeleteOpen(false);
      fetchProducts();
    } catch (err) {
      showNotification(err.message || 'Could not delete product.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#F3F4F6', mb: 0.5 }}>
            Inventory Catalog
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
            List, add, edit, and keep track of active product quantities and unique SKUs.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #38BDF8 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1.2,
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)'
            }
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search catalog by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(21, 27, 38, 0.7)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              color: '#F3F4F6',
              '& fieldset': { border: 'none' },
              '&:hover': { bgcolor: 'rgba(21, 27, 38, 0.9)' },
              '&.Mui-focused': { border: '1px solid #38BDF8', boxShadow: '0 0 10px rgba(56, 189, 248, 0.15)' }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Products Data Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#38BDF8' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} className="glass-card" sx={{ p: 1, bgcolor: '#111827' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#9CA3AF', fontWeight: 600 } }}>
                <TableCell>SKU</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Quantity Left</TableCell>
                <TableCell align="center">Availability</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#9CA3AF', borderBottom: 'none' }}>
                    <BoxIcon sx={{ fontSize: 48, mb: 1.5, color: 'rgba(255,255,255,0.1)' }} />
                    <Typography variant="body1">
                      No products found matching your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => {
                  const qty = p.quantity_in_stock;
                  let stockColor = 'success';
                  let stockBg = 'rgba(16, 185, 129, 0.15)';
                  let stockText = 'In Stock';
                  if (qty === 0) {
                    stockColor = 'error';
                    stockBg = 'rgba(239, 68, 68, 0.15)';
                    stockText = 'Out of Stock';
                  } else if (qty < 10) {
                    stockColor = 'warning';
                    stockBg = 'rgba(245, 158, 11, 0.15)';
                    stockText = 'Low Stock';
                  }

                  return (
                    <TableRow
                      key={p.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#F3F4F6' }
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#38BDF8' }}>
                        {p.sku}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ${parseFloat(p.price).toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        {qty}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={stockText}
                          color={stockColor}
                          size="small"
                          sx={{ 
                            fontWeight: 700, 
                            fontSize: '0.7rem', 
                            borderRadius: '6px', 
                            background: stockBg,
                            border: `1px solid rgba(255,255,255,0.05)` 
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenForm(p)} sx={{ color: '#818CF8', mr: 1, '&:hover': { bgcolor: 'rgba(129, 140, 248, 0.1)' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleOpenDelete(p)} sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Form Modal */}
      <Dialog 
        open={formOpen} 
        onClose={() => !submitLoading && setFormOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#151B26',
            color: '#F3F4F6',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            width: '100%',
            maxWidth: 500,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          {selectedProduct ? `Update Product: ${selectedProduct.name}` : 'Create New Product'}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              name="name"
              label="Product Name"
              value={formValues.name}
              onChange={handleFormChange}
              error={!!formErrors.name}
              helperText={formErrors.name && formErrors.name[0]}
              fullWidth
              variant="outlined"
              sx={{ '& label': { color: '#9CA3AF' }, '& input': { color: '#F3F4F6' } }}
            />
            
            <TextField
              name="sku"
              label="Product SKU"
              value={formValues.sku}
              onChange={handleFormChange}
              error={!!formErrors.sku}
              helperText={formErrors.sku && formErrors.sku[0]}
              disabled={!!selectedProduct} // SKUs are immutable identifiers
              fullWidth
              variant="outlined"
              placeholder="e.g. LAPTOP-PRO-15"
              sx={{ '& label': { color: '#9CA3AF' }, '& input': { color: '#F3F4F6', textTransform: 'uppercase' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="price"
                  label="Unit Price"
                  type="number"
                  value={formValues.price}
                  onChange={handleFormChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price && formErrors.price[0]}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#9CA3AF' }}>$</Typography></InputAdornment>,
                  }}
                  sx={{ '& label': { color: '#9CA3AF' }, '& input': { color: '#F3F4F6' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="quantity_in_stock"
                  label="Initial Stock"
                  type="number"
                  value={formValues.quantity_in_stock}
                  onChange={handleFormChange}
                  error={!!formErrors.quantity_in_stock}
                  helperText={formErrors.quantity_in_stock && formErrors.quantity_in_stock[0]}
                  fullWidth
                  variant="outlined"
                  sx={{ '& label': { color: '#9CA3AF' }, '& input': { color: '#F3F4F6' } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button onClick={() => setFormOpen(false)} disabled={submitLoading} sx={{ color: '#9CA3AF', textTransform: 'none', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitLoading}
              variant="contained"
              sx={{
                bgcolor: '#6366F1',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
                '&:hover': { bgcolor: '#4F46E5' }
              }}
            >
              {submitLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : selectedProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
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
          Delete Product?
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ color: '#F3F4F6' }}>
            Are you absolutely sure you want to delete <strong>{selectedProduct?.name}</strong> (SKU: {selectedProduct?.sku})? 
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 1.5 }}>
            Warning: This action is permanent and will fail if the product has already been sold in previous orders.
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
