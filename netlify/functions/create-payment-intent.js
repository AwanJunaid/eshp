require("dotenv").config();
const stripe = require("stripe")("sk_test_51IB0pzCfi2aJ1VQ5mSpRO4kO6wzvpikkxhLfu7ylWBkGM4mDq0VMV7zqQJkMIjkO7eWVFDVWHRyCfoo8XL0Sdz8400ZDOSkbWZ");
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const { items, shipping, description } = JSON.parse(event.body);
    console.log("Received data:", { items, shipping, description });
    const calculateOrderAmount = (items) => {
      const array = [];
      items.forEach((item) => {
        const { price, cartQuantity } = item;
        const cartItemAmount = price * cartQuantity;
        array.push(cartItemAmount);
      });
      const totalAmount = array.reduce((a, b) => a + b, 0);

      return totalAmount * 100; // Amount in cents for Stripe
    };

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "usd", // Change as per your requirement
      description: description,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
    };
  } catch (error) {
    console.error({ error });

    return {
      statusCode: 400,
      body: JSON.stringify({ error }),
    };
  }
};
