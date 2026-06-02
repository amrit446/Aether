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
  Avatar,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import API from '../api/client';
import { useNotification } from '../context/NotificationContext';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog controls
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Form state
  const [formValues, setFormValues] = useState({ full_name: '', email: '', phone_number: '' });
  const [formErrors, setFormErrors] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const showNotification = useNotification();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      showNotification(err.message || 'Failed to fetch customer list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = () => {
    setFormValues({ full_name: '', email: '', phone_number: '' });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validations
  const validateForm = () => {
    const errors = {};
    if (!formValues.full_name.trim()) errors.full_name = 'Full name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formValues.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formValues.email.trim())) {
      errors.email = 'Please provide a valid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    const payload = {
      full_name: formValues.full_name.trim(),
      email: formValues.email.trim().toLowerCase(),
      phone_number: formValues.phone_number.trim() || null
    };

    try {
      const res = await API.post('/customers', payload);
      showNotification(`${res.data.full_name} added successfully!`);
      setFormOpen(false);
      fetchCustomers();
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

  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setSubmitLoading(true);
    try {
      await API.delete(`/customers/${selectedCustomer.id}`);
      showNotification('Customer and their order logs deleted.');
      setDeleteOpen(false);
      fetchCustomers();
    } catch (err) {
      showNotification(err.message || 'Could not delete customer.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper to extract initials for user avatars
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#F3F4F6', mb: 0.5 }}>
            Customer Directory
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF' }}>
            Store and review registered customer profiles and reference contact information.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
          sx={{
            background: 'linear-gradient(135deg, #EC4899 0%, #818CF8 100%)',
            color: '#FFFFFF',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1.2,
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #DB2777 0%, #6366F1 100%)',
              boxShadow: '0 6px 20px rgba(236, 72, 153, 0.5)'
            }
          }}
        >
          Add Customer
        </Button>
      </Box>

      {/* Search Field */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search directory by name or email address..."
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
              '&.Mui-focused': { border: '1px solid #EC4899', boxShadow: '0 0 10px rgba(236, 72, 153, 0.15)' }
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

      {/* Customers List Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#EC4899' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} className="glass-card" sx={{ p: 1, bgcolor: '#111827' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#9CA3AF', fontWeight: 600 } }}>
                <TableCell align="center" style={{ width: 80 }}>Profile</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Email Address</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell align="center">Registered Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#9CA3AF', borderBottom: 'none' }}>
                    <PersonIcon sx={{ fontSize: 48, mb: 1.5, color: 'rgba(255,255,255,0.1)' }} />
                    <Typography variant="body1">
                      No customer files match your lookup criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c) => (
                  <TableRow
                    key={c.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#F3F4F6' }
                    }}
                  >
                    <TableCell align="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: 'rgba(236, 72, 153, 0.1)', 
                          color: '#EC4899', 
                          border: '1px solid rgba(236, 72, 153, 0.3)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          width: 36,
                          height: 36,
                          mx: 'auto'
                        }}
                      >
                        {getInitials(c.full_name)}
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{c.full_name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9CA3AF' }}>
                        <EmailIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="body2" sx={{ color: '#F3F4F6', textDecoration: 'none' }} component="a" href={`mailto:${c.email}`}>
                          {c.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9CA3AF' }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="body2" sx={{ color: '#F3F4F6' }}>
                          {c.phone_number || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                      {new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDelete(c)} sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Customer Modal Form */}
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
            maxWidth: 450,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          Register Customer Profile
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              name="full_name"
              label="Full Name"
              value={formValues.full_name}
              onChange={handleFormChange}
              error={!!formErrors.full_name}
              helperText={formErrors.full_name && formErrors.full_name[0]}
              fullWidth
              variant="outlined"
              sx={{ '& label': { color: '#9CA3AF' }, '& input': { color: '#F3F4F6' } }}
            />
            
            <TextField
              name="email"
              label="Email Address"
              type="email"
              value={formValues.email}
              onChange={handleFormChange}
              error={!!formErrors.email}
              helperText={formErrors.email && formErrors.email[0]}
              fullWidth
              variant="outlined"
              sx={{ '& label': { color: '#9CA3AF' }, '& input': { color: '#F3F4F6' } }}
            />

            <TextField
              name="phone_number"
              label="Phone Number"
              value={formValues.phone_number}
              onChange={handleFormChange}
              error={!!formErrors.phone_number}
              helperText={formErrors.phone_number && formErrors.phone_number[0]}
              fullWidth
              variant="outlined"
              placeholder="e.g. +1 (555) 019-2834"
              sx={{ '& label': { color: '#9CA3AF' }, '& input': { color: '#F3F4F6' } }}
            />
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
                bgcolor: '#EC4899',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
                '&:hover': { bgcolor: '#DB2777' }
              }}
            >
              {submitLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Register'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Customer Confirmation Modal */}
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
          Remove Customer File?
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ color: '#F3F4F6' }}>
            Are you sure you want to delete <strong>{selectedCustomer?.full_name}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 1.5 }}>
            Warning: This action is permanent and will cascade, automatically deleting all order invoices and tracking history linked to this customer!
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
            {submitLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Delete Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
