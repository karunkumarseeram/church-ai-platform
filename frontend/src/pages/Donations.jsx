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
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';

import {
  VolunteerActivism as DonationIcon,
  ContentCopy as CopyIcon,
  Phone as PhoneIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';

import QRCode from 'react-qr-code';
import { loadStripe } from '@stripe/stripe-js';

import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const STRIPE_PUBLIC_KEY = 'pk_test_...';

/* -----------------------------
   PAYMENT METHODS (UI → API)
------------------------------ */
const PAYMENT_METHODS = {
  UPI_PHONEPE: {
    label: 'PhonePe',
    api: 'PHONEPE'
  },
  UPI_GPAY: {
    label: 'Google Pay',
    api: 'GPAY'
  },
  CARD_STRIPE: {
    label: 'Card (Stripe)',
    api: 'CARD'
  },
  CASH: {
    label: 'Bank Transfer / Cash',
    api: 'CASH'
  }
};

const Donations = () => {
  const { userRole } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    donor_name: '',
    amount: '',
    payment_method: '',
    transaction_id: ''
  });

  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadBank();
  }, []);

  const loadBank = async () => {
    try {
      const res = await API.get('/donations/info/bank-details');
      setBankDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copied!', severity: 'success' });
  };

  /* -----------------------------
     VALIDATE AMOUNT
  ------------------------------ */
  const getValidAmount = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) return null;
    return amount;
  };

  /* -----------------------------
     STRIPE PAYMENT (FIXED)
  ------------------------------ */
  const handleStripe = async () => {
    try {
      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);

      const amount = getValidAmount();

      if (!amount) {
        setSnackbar({
          open: true,
          message: 'Enter valid amount',
          severity: 'error'
        });
        return;
      }

      setLoading(true);

      const res = await API.post('/donations/create-stripe-session', {
        donor_name: formData.donor_name?.trim(),
        amount: Math.round(amount * 100), // ✅ FIX: rupees → paise
        currency: 'inr',
        success_url: window.location.href,
        cancel_url: window.location.href
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error('Stripe session URL missing');
      }

    } catch (err) {
      console.error('Stripe error:', err.response?.data || err.message);

      setSnackbar({
        open: true,
        message:
          err.response?.data?.detail ||
          'Stripe payment failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     NORMAL PAYMENT SUBMIT
  ------------------------------ */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const amount = getValidAmount();

      if (!amount) {
        setSnackbar({
          open: true,
          message: 'Enter valid amount',
          severity: 'error'
        });
        return;
      }

      const apiMethod =
        PAYMENT_METHODS[formData.payment_method]?.api || 'CASH';

      await API.post('/donations', {
        donor_name: formData.donor_name?.trim(),
        amount,
        payment_method: apiMethod,
        transaction_id: formData.transaction_id
      });

      setSnackbar({
        open: true,
        message: 'Donation submitted successfully',
        severity: 'success'
      });

      setFormData({
        donor_name: '',
        amount: '',
        payment_method: '',
        transaction_id: ''
      });

    } catch (err) {
      console.error(err);

      setSnackbar({
        open: true,
        message: 'Error submitting donation',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const upiLink =
    bankDetails?.upi &&
    `upi://pay?pa=${bankDetails.upi}&pn=Church&am=${formData.amount || ''}&cu=INR`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        <DonationIcon /> Donate
      </Typography>

      <Grid container spacing={3}>

        {/* ---------------- FORM ---------------- */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>

              <TextField
                fullWidth
                label="Name"
                sx={{ mb: 2 }}
                value={formData.donor_name}
                onChange={(e) =>
                  setFormData({ ...formData, donor_name: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Amount (INR)"
                sx={{ mb: 2 }}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />

              {/* PAYMENT METHOD */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.payment_method}
                  label="Payment Method"
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                >
                  {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* ---------------- BANK ---------------- */}
              {formData.payment_method === 'CASH' && bankDetails && (
                <Card sx={{ mb: 2, p: 2 }}>
                  <Typography fontWeight="bold">Bank Details</Typography>

                  <div>
                    {bankDetails.bank_name}
                    <IconButton onClick={() => copy(bankDetails.bank_name)}>
                      <CopyIcon />
                    </IconButton>
                  </div>

                  <div>
                    {bankDetails.account_number}
                    <IconButton onClick={() => copy(bankDetails.account_number)}>
                      <CopyIcon />
                    </IconButton>
                  </div>

                  <div>
                    IFSC: {bankDetails.ifsc}
                    <IconButton onClick={() => copy(bankDetails.ifsc)}>
                      <CopyIcon />
                    </IconButton>
                  </div>
                </Card>
              )}

              {/* ---------------- UPI QR ---------------- */}
              {formData.payment_method === 'UPI_GPAY' && bankDetails && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <QRCode value={upiLink} size={180} />
                  <Typography sx={{ mt: 1 }}>Scan & Pay</Typography>
                </Box>
              )}

              {/* ---------------- PAY BUTTON ---------------- */}
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={() => {
                  if (formData.payment_method === 'CARD_STRIPE') {
                    handleStripe();
                  } else {
                    handleSubmit();
                  }
                }}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>

            </CardContent>
          </Card>
        </Grid>

        {/* ---------------- INFO ---------------- */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Payment Options</Typography>

              <ul>
                <li>UPI (Google Pay / PhonePe)</li>
                <li>Stripe Card Payment</li>
                <li>Bank Transfer</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* ---------------- SNACKBAR ---------------- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Donations;