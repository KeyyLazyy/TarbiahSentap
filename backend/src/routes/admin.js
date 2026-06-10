// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { verifyToken, permit } = require('../middleware/auth');
const db = require('../services/db');

// Get all orders (Admin only)
router.get('/orders', verifyToken, permit('admin'), async (req, res) => {
  try {
    const orders = await db.orders.findAll();
    const users = await db.users.findAll();
    
    console.log('[DEBUG] /admin/orders -> orders.length:', orders.length);
    console.log('[DEBUG] /admin/orders -> users.length:', users.length);
    
    const enrichedOrders = orders.map(order => {
        const user = users.find(u => u.id === order.user_id);
        return {
            ...order,
            user: user ? { id: user.id, name: user.user_metadata?.name || user.email, email: user.email } : null
        };
    });
    
    console.log('[DEBUG] /admin/orders -> enrichedOrders.length:', enrichedOrders.length);
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: enrichedOrders });
  } catch (err) {
    console.error('[DEBUG] /admin/orders error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order status (Admin only)
router.put('/orders/:id/status', verifyToken, permit('admin'), async (req, res) => {
  try {
    const { supabase } = require('../services/supabase');
    const { status } = req.body;
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete order
router.delete('/orders/:id', verifyToken, permit('admin'), async (req, res) => {
  try {
    const { supabase } = require('../services/supabase');
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all users (Admin only)
router.get('/users', verifyToken, permit('admin'), async (req, res) => {
  try {
    const users = await db.users.findAll();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create user (Admin only)
router.post('/users', verifyToken, permit('admin'), async (req, res) => {
  try {
    const { supabase } = require('../services/supabase');
    const { email, password, name, role } = req.body;
    
    if (!supabase.auth.admin) {
        return res.status(500).json({ success: false, error: 'Service role key not configured' });
    }

    const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: name }
    });
    
    if (createError) throw createError;
    
    await supabase.auth.admin.updateUserById(newUserData.user.id, {
      app_metadata: { role: role || 'customer' }
    });

    res.json({ success: true, data: newUserData.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user (Admin only)
router.put('/users/:id', verifyToken, permit('admin'), async (req, res) => {
  try {
    const { supabase } = require('../services/supabase');
    const { name, role, password } = req.body;
    const uid = req.params.id;

    if (!supabase.auth.admin) {
        return res.status(500).json({ success: false, error: 'Service role key not configured' });
    }

    let updatePayload = {
      user_metadata: { name: name },
      app_metadata: { role: role }
    };
    if (password) updatePayload.password = password;

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(uid, updatePayload);
    
    if (updateError) throw updateError;
    
    res.json({ success: true, data: updatedUser.user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', verifyToken, permit('admin'), async (req, res) => {
  try {
    const { supabase } = require('../services/supabase');
    const uid = req.params.id;

    if (!supabase.auth.admin) {
        return res.status(500).json({ success: false, error: 'Service role key not configured' });
    }

    // Pre-emptively delete user's orders and carts to avoid Foreign Key constraint errors
    await supabase.from('orders').delete().eq('user_id', uid);
    await supabase.from('carts').delete().eq('user_id', uid);

    const { data, error } = await supabase.auth.admin.deleteUser(uid);
    if (error) throw error;

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Data Export (JSON to CSV simulation)
router.get('/export/csv', verifyToken, permit('admin'), async (req, res) => {
  try {
    const orders = await db.orders.findAll();
    
    // Basic CSV conversion simulation
    if (orders.length === 0) {
      return res.status(400).json({ success: false, error: 'No orders to export' });
    }

    const headers = 'id,user_id,status,total_amount,created_at\n';
    const rows = orders.map(o => `${o.id},${o.user_id},${o.status},${o.total_amount},${o.created_at}`).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    res.send(headers + rows);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const { Client } = require('pg');

// Stripe Revenue (Live Data from Stripe API)
router.get('/stripe-revenue', verifyToken, permit('admin'), async (req, res) => {
  try {
    const Stripe = require('stripe');
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
    const stripe = Stripe(stripeSecretKey);
    
    // Fetch live balance from Stripe
    const balance = await stripe.balance.retrieve();
    
    // Sum available and pending balances
    const available = balance.available.reduce((acc, curr) => acc + curr.amount, 0);
    const pending = balance.pending.reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalBalance = (available + pending) / 100; // Convert cents to dollars
    
    res.json({ success: true, data: totalBalance });
  } catch (err) {
    console.error('Stripe API Error:', err.message);
    res.json({ success: true, data: 1250000, isMock: true, error: err.message });
  }
});

// Stripe Overview (Detailed Metrics for Dashboard)
router.get('/stripe-overview', verifyToken, permit('admin'), async (req, res) => {
  try {
    const Stripe = require('stripe');
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
    const stripe = Stripe(stripeSecretKey);

    // Calculate timestamps for last 7 days and previous 7 days
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60);
    const fourteenDaysAgo = sevenDaysAgo - (7 * 24 * 60 * 60);

    // 1. Gross Volume & Failed Payments (Last 7 Days)
    const recentCharges = await stripe.charges.list({ created: { gte: sevenDaysAgo }, limit: 100 });
    let grossVolume = 0;
    let failedPayments = 0;
    
    recentCharges.data.forEach(charge => {
      if (charge.status === 'succeeded') grossVolume += charge.amount;
      if (charge.status === 'failed') failedPayments++;
    });

    // 2. Net Volume (Requires Balance Transactions to subtract fees)
    const recentTransactions = await stripe.balanceTransactions.list({ created: { gte: sevenDaysAgo }, limit: 100 });
    let netVolume = 0;
    recentTransactions.data.forEach(txn => {
      if (txn.type === 'charge' || txn.type === 'payment') netVolume += txn.net;
    });

    // 3. New Customers
    const recentCustomers = await stripe.customers.list({ created: { gte: sevenDaysAgo }, limit: 100 });
    const newCustomersCount = recentCustomers.data.length;

    // We can simulate the "previous period" since fetching all paginated historical data in one go can be slow for a prototype
    res.json({
      success: true,
      data: {
        grossVolume: grossVolume / 100, // Convert to MYR
        netVolume: netVolume / 100,
        failedPayments: failedPayments,
        newCustomers: newCustomersCount,
        previousPeriod: {
          grossVolume: 0.00, // Simulated or you can do a second query to fourteenDaysAgo
          netVolume: 0.00,
          newCustomers: 0
        }
      }
    });

  } catch (err) {
    console.error('Stripe Overview API Error:', err.message);
    // Fallback Mock Data if Stripe key isn't setup
    res.json({
      success: true,
      isMock: true,
      data: {
        grossVolume: 219.24,
        netVolume: 200.48,
        failedPayments: 0,
        newCustomers: 0,
        previousPeriod: {
          grossVolume: 0.00,
          netVolume: 0.00,
          newCustomers: 0
        }
      }
    });
  }
});
// Dashboard Stats using Supabase REST API
router.get('/dashboard-stats', verifyToken, permit('admin'), async (req, res) => {
  try {
    const { supabase } = require('../services/supabase');

    // 1. Gross Revenue from Orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, created_at')
      .neq('status', 'cancelled');
      
    if (ordersError) throw ordersError;

    let totalOrders = 0;
    let grossRevenue = 0;
    let uniqueCustomersSet = new Set();
    
    // Group monthly revenue (Jan=0, Feb=1, etc.)
    let monthlyRevenue = [0, 0, 0, 0, 0, 0];
    const currentYear = new Date().getFullYear();

    if (orders && orders.length > 0) {
      totalOrders = orders.length;
      orders.forEach(o => {
        const amt = parseFloat(o.total_amount) || 0;
        grossRevenue += amt;
        if (o.user_id) uniqueCustomersSet.add(o.user_id);
        
        const date = new Date(o.created_at);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth(); // 0-11
          if (monthIndex < 6) {
            monthlyRevenue[monthIndex] += amt;
          }
        }
      });
    }

    const uniqueCustomers = uniqueCustomersSet.size || 1; // avoid division by zero
    const netProfit = grossRevenue * 0.35; // 35% margin
    const aov = totalOrders > 0 ? (grossRevenue / totalOrders) : 0;
    const ltv = uniqueCustomersSet.size > 0 ? (grossRevenue / uniqueCustomers) : 0;

    // Simulate dividing revenue between Naskhah Nadir (40%) and Edisi Baharu (60%)
    const naskhahNadir = monthlyRevenue.map(v => v * 0.4);
    const edisiBaharu = monthlyRevenue.map(v => v * 0.6);

    res.json({
      success: true,
      data: {
        perolehanKasar: grossRevenue,
        keuntunganBersih: netProfit,
        purataNilaiPesanan: aov,
        nilaiSepanjangHayat: ltv,
        stripeRevenue: grossRevenue, // Fallback to gross revenue if stripe tables aren't set up yet
        chart: {
          naskhahNadir: naskhahNadir,
          edisiBaharu: edisiBaharu,
          labels: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun']
        }
      }
    });
  } catch (err) {
    console.error('Dashboard Stats Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
