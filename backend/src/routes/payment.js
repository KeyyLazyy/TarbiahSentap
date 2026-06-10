const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { verifyToken } = require('../middleware/auth');

// Create a Stripe checkout session
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, success_url, cancel_url } = req.body;
    
    // Fallback to dummy key if not present
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
    const stripe = Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'myr',
            product_data: {
              name: 'Tarbiah Sentap Book Purchase',
            },
            unit_amount: Math.round(amount * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${process.env.CLIENT_ORIGIN}/?payment=success`,
      cancel_url: cancel_url || `${process.env.CLIENT_ORIGIN}/?payment=cancel`,
    });

    res.json({ success: true, id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
