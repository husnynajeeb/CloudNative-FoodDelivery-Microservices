import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(
  "sk_test_51REstHCtYURynd6PsDMQvP6PF2PQqGwj6KWn0cQuJs9JfCiI1hW9XcEg6yjwYthneBoxa5qXHY8gu1GShVz4wYon00Utpjhd12",
  {
    apiVersion: "2023-08-16",
  }
);

import Payment from "../Model/paymentModel.js";

// Initiate Payment
export const initiatePayment = async (req, res) => {

  console.log("Here")
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(req.body.amount * 100),
      currency: "lkr",
      automatic_payment_methods: { enabled: true },
    });
    console.log(paymentIntent.client_secret)
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Webhook handler
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ error: "Order not found" });
    }

    payment.status = "success";
    await payment.save();
  }

  res.json({ received: true });
};

