const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // use your Stripe secret key

// Create PaymentIntent
const createPaymentIntent = async (amount, currency, paymentMethodId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method: paymentMethodId,
            confirm: true, // Automatically confirms the payment
        });

        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error.message);
        throw error;
    }
};

module.exports = { createPaymentIntent };

  