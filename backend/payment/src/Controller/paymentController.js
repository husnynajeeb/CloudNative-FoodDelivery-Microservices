import Stripe from "stripe";
import nodemailer from "nodemailer";
import Payment from "../Model/paymentModel.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(
  "sk_test_51REstHCtYURynd6PsDMQvP6PF2PQqGwj6KWn0cQuJs9JfCiI1hW9XcEg6yjwYthneBoxa5qXHY8gu1GShVz4wYon00Utpjhd12",
  { apiVersion: "2023-08-16" }
);

// ✅ Send SMS using TextBee
const sendTextbeeSms = async (to, message) => {
  try {
    const response = await axios.post(
      `https://api.textbee.dev/api/v1/gateway/devices/${process.env.TEXTBEE_DEVICE_ID}/send-sms`,
      {
        recipients: [to],
        message,
      },
      {
        headers: {
          "x-api-key": process.env.TEXTBEE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("TextBee SMS failed:", error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Initiate Payment
export const initiatePayment = async (req, res) => {
  try {
    const { amount, currency = "lkr", customerEmail, customerPhone } = req.body;
    console.log(req.body);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        customerEmail,
        customerPhone,
      },
    });

    const payment = new Payment({
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
      status: "pending",
      email: customerEmail,
      phone: customerPhone,
    });
    await payment.save();

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Payment Status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const payment = await Payment.findOne({ paymentIntentId });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json({
      stripeStatus: paymentIntent.status,
      dbStatus: payment.status,
      paymentDetails: payment,
    });
  } catch (err) {
    console.error("Error fetching payment status:", err);
    res.status(500).json({ error: err.message });
  }
};

// Webhook handler
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    console.log("hi");
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("hello");

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      console.log("here");
      const payment = await Payment.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { status: "success" },
        { new: true }
      );

      if (payment) {
        console.log("there");
        const notificationResults = {};

        // ✅ Send SMS using TextBee
        if (payment.phone) {
          try {
            notificationResults.sms = await sendTextbeeSms(
              payment.phone,
              `Your payment of ${
                paymentIntent.amount / 100
              } ${paymentIntent.currency.toUpperCase()} was successful! Your order has been placed.`
            );
          } catch (smsErr) {
            console.error("SMS failed:", smsErr);
            notificationResults.smsError = smsErr.message;
          }
        }

        // Send Email using Nodemailer
        if (payment.email) {
          try {
            notificationResults.email = await transporter.sendMail({
              from: `"My Store" <${
                process.env.EMAIL_FROM || process.env.EMAIL_USER
              }>`,
              to: payment.email,
              subject: "Payment Confirmation",
              html: `
                <h1>Thank you for your payment!</h1>
                <p>You’ve successfully paid ${
                  paymentIntent.amount / 100
                } ${paymentIntent.currency.toUpperCase()}.</p>
                <p>Your transaction has been completed.</p>
                <p>Your order has been placed.</p>
                <p>Thank you. Please use our service again.</p>
              `,
            });
          } catch (emailErr) {
            console.error("Email failed:", emailErr);
            notificationResults.emailError = emailErr.message;
          }
        }

        console.log(
          "✅ Payment handled and notifications sent:",
          notificationResults
        );
      }
    } catch (err) {
      console.error("Webhook DB or Notification error:", err);
    }
  }

  res.json({ received: true });
};