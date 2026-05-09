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
  Alert
} from '@mui/material';

import { VolunteerActivism as DonationIcon } from '@mui/icons-material';

import { loadStripe } from '@stripe/stripe-js';
import { QRCode } from 'react-qr-code';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

/* ---------------- CONFIG ---------------- */
const STRIPE_PUBLIC_KEY = 'pk_test_...';

const PAYMENT_METHODS = {
  UPI: { label: 'UPI (PhonePe / GPay / Paytm)', api: 'UPI' },
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    loadBank();
    loadAdminData();

    const params = new URLSearchParams(window.location.search);

    if (params.get("success") === "true") {
      setPaymentSuccess(true);
      loadAdminData();
      window.history.replaceState({}, document.title, "/donations");
    }
  }, []);

  /* ---------------- RESET transaction when method changes ---------------- */
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      transaction_id: ''
    }));
  }, [formData.payment_method]);

  /* ---------------- ADMIN DATA ---------------- */
  const loadAdminData = async () => {
    try {
      if (isAdmin) {
        const [donationsRes, statsRes] = await Promise.all([
          API.get('/donations'),
          API.get('/donations/stats/summary')
        ]);

        setAdminDonations(donationsRes.data);
        setStats(statsRes.data);
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

  /* ---------------- VALID AMOUNT ---------------- */
  const getValidAmount = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) return null;
    return amount;
  };

  /* ---------------- STRIPE ---------------- */
  const handleStripe = async () => {
    try {
      const amount = getValidAmount();

      // 🔥 HARD GUARD (fixes your 400 error)
      if (!formData.donor_name || !amount) {
        setSnackbar({
          open: true,
          message: "Enter valid name and amount",
          severity: "warning"
        });
        return;
      }

      setLoading(true);

      const res = await API.post('/donations/create-stripe-session', {
        donor_name: formData.donor_name,
        amount: Number(amount), // 🔥 FIX: force number
        success_url: window.location.origin + "/donations?success=true",
        cancel_url: window.location.origin + "/donations?cancel=true"
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      }

    } catch (err) {
      console.error("Stripe error:", err?.response?.data || err.message);

      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Stripe failed",
        severity: "error"
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
      if (!formData.donor_name || !amount) {
        setSnackbar({
          open: true,
          message: "Enter valid details",
          severity: "warning"
        });
        return;
      }

      await API.post('/donations', {
        donor_name: formData.donor_name,
        amount,
        payment_method: PAYMENT_METHODS[formData.payment_method]?.api || 'CASH',
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

      loadAdminData();

    } catch (err) {
      setSnackbar({ open: true, message: 'Error', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPI LINK ---------------- */
  const upiLink =
    bankDetails?.upi && formData.amount
      ? `upi://pay?pa=${bankDetails.upi}&pn=Church&am=${formData.amount}&cu=INR`
      : null;

  /* ---------------- SUCCESS SCREEN ---------------- */
  if (paymentSuccess) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h4" color="success.main">
          🎉 Payment Successful
        </Typography>

        <Typography sx={{ mt: 2 }}>
          Thank you for your donation
        </Typography>

        <Button
          sx={{ mt: 3 }}
          variant="contained"
          onClick={() => {
            setPaymentSuccess(false);
            loadAdminData();
          }}
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h4">
        <DonationIcon /> Donations
      </Typography>

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
                  {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>
                      {v.label}
                    </MenuItem>
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

              {/* UPI */}
              {formData.payment_method === 'UPI' && upiLink && (
                <Box sx={{ textAlign: 'center' }}>
                  <QRCode value={upiLink} size={160} />
                  <Typography sx={{ mt: 1 }}>
                    Scan with any UPI app
                  </Typography>

                  <Button
                    fullWidth
                    sx={{ mt: 1 }}
                    variant="outlined"
                    onClick={() => window.location.href = upiLink}
                  >
                    Pay via UPI
                  </Button>
                </Box>
              )}

              {/* BUTTON */}
              <Button
                fullWidth
                variant="contained"
                disabled={loading}
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