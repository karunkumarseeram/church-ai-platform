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
  ContentCopy as CopyIcon
} from '@mui/icons-material';


import { loadStripe } from '@stripe/stripe-js';
import { QRCode } from 'react-qr-code';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const STRIPE_PUBLIC_KEY = 'pk_test_...';

const PAYMENT_METHODS = {
  UPI_PHONEPE: { label: 'PhonePe', api: 'PHONEPE' },
  UPI_GPAY: { label: 'Google Pay', api: 'GPAY' },
  CARD_STRIPE: { label: 'Card (Stripe)', api: 'CARD' },
  CASH: { label: 'Bank Transfer / Cash', api: 'CASH' }
};

const Donations = () => {
  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';

  const [formData, setFormData] = useState({
    donor_name: '',
    amount: '',
    payment_method: '',
    transaction_id: ''
  });

  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [adminDonations, setAdminDonations] = useState([]);
  const [topDonors, setTopDonors] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadBank();
    loadAdminData();

    // ✅ FIX: after Stripe redirect
    const params = new URLSearchParams(window.location.search);

    if (params.get("success") === "true") {
      setSnackbar({
        open: true,
        message: "Payment successful 🎉",
        severity: "success"
      });

      loadAdminData();

      window.history.replaceState({}, document.title, "/donations");
    }

  }, []);

  /* ---------------- ADMIN DATA ---------------- */
  const loadAdminData = async () => {
    try {
      if (isAdmin) {
        const [donationsRes, statsRes, topRes] = await Promise.all([
          API.get('/donations'),
          API.get('/donations/stats/summary'),
          API.get('/donations/stats/top-donors')
        ]);

        setAdminDonations(donationsRes.data);
        setStats(statsRes.data);
        setTopDonors(topRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- BANK ---------------- */
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

  const getValidAmount = () => {
    const amount = parseFloat(formData.amount);
    return amount > 0 ? amount : null;
  };

  /* ---------------- STRIPE (UNCHANGED LOGIC) ---------------- */
  const handleStripe = async () => {
    try {
      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);

      const amount = getValidAmount();
      if (!amount) return;

      setLoading(true);

      const res = await API.post('/donations/create-stripe-session', {
        donor_name: formData.donor_name,
        amount: amount,
        success_url: window.location.origin + "/donations?success=true",
        cancel_url: window.location.origin + "/donations?cancel=true"
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      }

    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Stripe failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- NORMAL PAYMENT ---------------- */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const amount = getValidAmount();
      if (!amount) return;

      await API.post('/donations', {
        donor_name: formData.donor_name,
        amount,
        payment_method:
          PAYMENT_METHODS[formData.payment_method]?.api || 'CASH',
        transaction_id: formData.transaction_id
      });

      setSnackbar({
        open: true,
        message: 'Donation saved',
        severity: 'success'
      });

      setFormData({
        donor_name: '',
        amount: '',
        payment_method: '',
        transaction_id: ''
      });

    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FIXED UPI LINK ---------------- */
  const upiLink =
    bankDetails?.upi && formData.amount
      ? `upi://pay?pa=${bankDetails.upi}&pn=Church&am=${formData.amount}&cu=INR`
      : null;

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h4">
        <DonationIcon /> Donations
      </Typography>

      {/* ---------------- ADMIN STATS ---------------- */}
      {isAdmin && stats && (
        <Grid container spacing={2} sx={{ mt: 2 }}>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography>Total Donations</Typography>
                <Typography variant="h5">{stats.total_donations}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography>Total Amount</Typography>
                <Typography variant="h5">₹{stats.total_amount}</Typography>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      )}

      {/* ---------------- FORM ---------------- */}
      <Grid container spacing={3} sx={{ mt: 2 }}>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>

              <TextField
                label="Name"
                fullWidth
                sx={{ mb: 2 }}
                value={formData.donor_name}
                onChange={(e) =>
                  setFormData({ ...formData, donor_name: e.target.value })
                }
              />

              <TextField
                label="Amount"
                fullWidth
                sx={{ mb: 2 }}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment</InputLabel>
                <Select
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                >
                  {Object.entries(PAYMENT_METHODS).map(([k,v]) => (
                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* CASH */}
              {formData.payment_method === 'CASH' && bankDetails && (
                <Box>
                  <div>{bankDetails.bank_name}</div>
                  <div>{bankDetails.account_number}</div>
                  <div>{bankDetails.ifsc}</div>
                </Box>
              )}

              {/* UPI FIXED */}
              {formData.payment_method === 'UPI_GPAY' && upiLink && (
                <Box sx={{ textAlign: 'center' }}>
                  <QRCode value={upiLink} size={150} />
                  <Typography>Scan with Google Pay / PhonePe</Typography>

                  <Button
                    fullWidth
                    sx={{ mt: 1 }}
                    variant="outlined"
                    onClick={() => window.location.href = upiLink}
                  >
                    Pay via UPI App
                  </Button>
                </Box>
              )}

              {/* STRIPE / NORMAL */}
              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  formData.payment_method === 'CARD_STRIPE'
                    ? handleStripe()
                    : handleSubmit()
                }
              >
                Pay Now
              </Button>

            </CardContent>
          </Card>
        </Grid>

        {/* ADMIN TABLE */}
        {isAdmin && (
          <Grid item xs={12}>
            <Card>
              <CardContent>

                <Typography variant="h6">All Donations</Typography>

                <table width="100%">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminDonations.map(d => (
                      <tr key={d.id}>
                        <td>{d.donor_name}</td>
                        <td>₹{d.amount}</td>
                        <td>{d.payment_method}</td>
                        <td>{d.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </CardContent>
            </Card>
          </Grid>
        )}

      </Grid>

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