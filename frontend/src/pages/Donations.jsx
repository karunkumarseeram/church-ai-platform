import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import {
  VolunteerActivism as DonationIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  CreditCard as CardIcon,
  Money as CashIcon,
  Smartphone as PhoneIcon,
  Analytics as AnalyticsIcon,
  Receipt as ReceiptIcon,
  QrCode as QrCodeIcon,
  AccountBalance as BankIcon,
  // Bank as BankIcon,
  // AccountBalance as BankIcon,   // ✅ FIXED HERE
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Donations = () => {
  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === "ADMIN" || userRole === "PASTOR";

  const [donations, setDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    donor_name: '',
    amount: '',
    payment_method: '',
    transaction_id: ''
  });

  // Preset donation amounts
  const presetAmounts = [100, 500, 1000, 2500, 5000];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load bank details
      try {
        const bankRes = await API.get('/scanner/info/bank-details');
        setBankDetails(bankRes.data);
      } catch (error) {
        console.warn('Could not load bank details');
      }

      // Load user's own donations
      const myDonationsRes = await API.get('/donations/my-donations');
      setMyDonations(myDonationsRes.data);

      // Load all donations if admin
      if (isAdmin) {
        const [donationsRes, statsRes] = await Promise.all([
          API.get('/donations'),
          API.get('/donations/stats/summary')
        ]);
        setDonations(donationsRes.data);
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading donations:', error);
      setSnackbar({ open: true, message: 'Error loading donations', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (donation = null) => {
    if (donation) {
      setEditingDonation(donation);
      setFormData({
        donor_name: donation.donor_name,
        amount: donation.amount,
        payment_method: donation.payment_method,
        transaction_id: donation.transaction_id || ''
      });
    } else {
      setEditingDonation(null);
      setFormData({
        donor_name: '',
        amount: '',
        payment_method: '',
        transaction_id: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDonation(null);
    setFormData({
      donor_name: '',
      amount: '',
      payment_method: '',
      transaction_id: ''
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingDonation) {
        // Update donation status (admin only)
        await API.put(`/donations/${editingDonation.id}/status`, { status: 'SUCCESS' });
        setSnackbar({ open: true, message: 'Donation status updated', severity: 'success' });
      } else {
        // Create new donation
        await API.post('/donations', data);
        setSnackbar({ open: true, message: 'Donation submitted successfully!', severity: 'success' });
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving donation:', error);
      setSnackbar({ open: true, message: 'Error saving donation', severity: 'error' });
    }
  };

  const handleDelete = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;

    try {
      await API.delete(`/donations/${donationId}`);
      setSnackbar({ open: true, message: 'Donation deleted successfully', severity: 'success' });
      loadData();
    } catch (error) {
      console.error('Error deleting donation:', error);
      setSnackbar({ open: true, message: 'Error deleting donation', severity: 'error' });
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'GPAY':
      case 'PHONEPE':
        return <PhoneIcon />;
      case 'CARD':
        return <CardIcon />;
      case 'CASH':
        return <CashIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main' }}>
        <DonationIcon fontSize="large" />
        Church Donations
      </Typography>

      {/* Admin Stats */}
      {isAdmin && stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.total_donations}
                    </Typography>
                    <Typography variant="body2">Total Donations</Typography>
                  </Box>
                  <ReceiptIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(stats.total_amount)}
                    </Typography>
                    <Typography variant="body2">Total Amount</Typography>
                  </Box>
                  <WalletIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {Object.values(stats.monthly_stats).reduce((a, b) => a + b, 0)}
                    </Typography>
                    <Typography variant="body2">This Year</Typography>
                  </Box>
                  <AnalyticsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Donation Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon />
                Make a Donation
              </Typography>

              {/* Bank Details Section */}
              {bankDetails && (
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BankIcon />
                      Bank Transfer Details
                    </Typography>
                    <Grid container spacing={1}>
                      {bankDetails.bank_name && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: '80px' }}>
                              Bank:
                            </Typography>
                            <Typography variant="body2">{bankDetails.bank_name}</Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(bankDetails.bank_name)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      )}
                      {bankDetails.account_number && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: '80px' }}>
                              Account:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {bankDetails.account_number}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(bankDetails.account_number)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      )}
                      {bankDetails.ifsc && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: '80px' }}>
                              IFSC:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {bankDetails.ifsc}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(bankDetails.ifsc)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      )}
                      {bankDetails.upi && (
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: '80px' }}>
                              UPI:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {bankDetails.upi}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(bankDetails.upi)}>
                              <CopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => generateUPIQR(formData.amount)}
                              disabled={!formData.amount}
                            >
                              <QrCodeIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Preset Amounts */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quick Donate:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outlined"
                      size="small"
                      onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                      sx={{ minWidth: '80px' }}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Your Name"
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  required
                  fullWidth
                />

                <TextField
                  label="Amount (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: '₹'
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    label="Payment Method"
                  >
                    <MenuItem value="GPAY">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon /> Google Pay
                      </Box>
                    </MenuItem>
                    <MenuItem value="PHONEPE">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon /> PhonePe
                      </Box>
                    </MenuItem>
                    <MenuItem value="CARD">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CardIcon /> Credit/Debit Card
                      </Box>
                    </MenuItem>
                    <MenuItem value="CASH">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CashIcon /> Cash
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Transaction ID (Optional)"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  fullWidth
                  helperText="Enter transaction ID for online payments"
                />

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!formData.donor_name || !formData.amount || !formData.payment_method}
                  sx={{ mt: 2 }}
                >
                  Donate Now
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* My Donations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Donations
              </Typography>

              {myDonations.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No donations yet. Make your first donation!
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {myDonations.map((donation) => (
                    <Box key={donation.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {formatCurrency(donation.amount)}
                        </Typography>
                        <Chip
                          label={donation.status}
                          color={getStatusColor(donation.status)}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getPaymentMethodIcon(donation.payment_method)}
                        <Typography variant="body2" color="text.secondary">
                          {donation.payment_method}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(donation.donated_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Admin Donations Table */}
      {isAdmin && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">All Donations</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Donation
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Donor</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Method</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {donation.donor_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {donation.donor_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {formatCurrency(donation.amount)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getPaymentMethodIcon(donation.payment_method)}
                          <Typography variant="body2">{donation.payment_method}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={donation.status}
                          color={getStatusColor(donation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(donation.donated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Status">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(donation)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(donation.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Donation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDonation ? 'Update Donation Status' : 'Add New Donation'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {editingDonation ? (
              <Alert severity="info">
                Update the status for donation by {editingDonation.donor_name} of {formatCurrency(editingDonation.amount)}
              </Alert>
            ) : (
              <>
                <TextField
                  label="Donor Name"
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  required
                  fullWidth
                />

                <TextField
                  label="Amount (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    label="Payment Method"
                  >
                    <MenuItem value="GPAY">Google Pay</MenuItem>
                    <MenuItem value="PHONEPE">PhonePe</MenuItem>
                    <MenuItem value="CARD">Credit/Debit Card</MenuItem>
                    <MenuItem value="CASH">Cash</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Transaction ID"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  fullWidth
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={editingDonation ? false : (!formData.donor_name || !formData.amount || !formData.payment_method)}
          >
            {editingDonation ? 'Update Status' : 'Submit Donation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Donations;