import Stripe from "stripe";
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import Payment from "../Model/paymentModel.js";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(
  "sk_test_51REstHCtYURynd6PsDMQvP6PF2PQqGwj6KWn0cQuJs9JfCiI1hW9XcEg6yjwYthneBoxa5qXHY8gu1GShVz4wYon00Utpjhd12",
  {
    apiVersion: "2023-08-16",
  }
);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// Initialize Twilio
const client = twilio(accountSid,authToken);


// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Initiate Payment
export const initiatePayment = async (req, res) => {
  try {
    const { amount, currency = 'lkr', customerEmail, customerPhone } = req.body;
    console.log(req.body)
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        customerEmail,
        customerPhone
      }
    });

    // Create payment record in database
    const payment = new Payment({
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
      status: 'pending',
      email:customerEmail,
      phone:customerPhone
    });
    await payment.save();

    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Confirm Payment and Send Notifications
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // 1. Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Payment not completed',
        status: paymentIntent.status 
      });
    }

    // 2. Update payment status in database
    const payment = await Payment.findOneAndUpdate(
      { paymentIntentId },
      { status: 'success' },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    // 3. Send notifications
    const notificationResults = {};
    
    // SMS via Twilio
    if (payment.phone) {
      try {
        console.log(payment.phone,process.env.TWILIO_PHONE,process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN)
        notificationResults.sms = await client.messages.create({
          body: `Your payment of ${paymentIntent.amount/100} ${paymentIntent.currency.toUpperCase()} was successful!`,
          from: process.env.TWILIO_PHONE,
          to: payment.phone
        });
        
      } catch (smsError) {
        console.error('SMS failed:', smsError);
        notificationResults.smsError = smsError.message;
      }
      
    }

    // Email via Nodemailer
    if (payment.email) {
      try {
        notificationResults.email = await transporter.sendMail({
          from: `"My Store" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
          to: payment.email,
          subject: 'Payment Confirmation',
          html: `
            <h1>Thank you for your payment!</h1>
<p>You’ve successfully paid ${paymentIntent.amount/100} ${paymentIntent.currency.toUpperCase()}.</p>
<p>Your transaction has been completed.</p>
<p>Thank you. Please use our service again.</p>
          `
        });
      } catch (emailError) {
        console.error('Email failed:', emailError);
        notificationResults.emailError = emailError.message;
      }
    }

    res.status(200).json({ 
      success: true,
      paymentId: payment._id,
      notifications: notificationResults
    });

  } catch (err) {
    console.error("Payment confirmation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    // Check Stripe status first
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Then check our database
    const payment = await Payment.findOne({ paymentIntentId });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json({
      stripeStatus: paymentIntent.status,
      dbStatus: payment.status,
      paymentDetails: payment
    });
  } catch (err) {
    console.error("Error fetching payment status:", err);
    res.status(500).json({ error: err.message });
  }
};

// Webhook handler
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle real payment success
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // 1. Update database
    const payment = await Payment.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { status: 'success' },
      { new: true }
    );

    // 2. Send notifications
    if (payment) {
      // SMS via Twilio
      if (payment.customerPhone) {
        await twilioClient.messages.create({
          body: `Payment of ${paymentIntent.amount/100}${paymentIntent.currency.toUpperCase()} received! Order #${payment._id}`,
          from: process.env.TWILIO_NUMBER,
          to: payment.customerPhone
        });
      }

      // Email via Nodemailer
      if (payment.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: payment.email,
          subject: 'Payment Confirmation',
          html: `<h1>Thank you for your payment!</h1>
                 <p>Amount: ${paymentIntent.amount/100}${paymentIntent.currency.toUpperCase()}</p>`
        });
      }
    }
  }

  res.json({ received: true });
};
