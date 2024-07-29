import Stripe from "stripe";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import dotenv from "dotenv";
dotenv.config();
console.log("stripe secret key:", process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const addCart = async (req, res) => {
  const { userId, course } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingCourseIndex = user.cart.findIndex(
      (c) => c._id.toString() === course._id
    );
    if (existingCourseIndex === -1) {
      user.cart.push(course);
      await user.save();
    }

    res
      .status(200)
      .json({ message: "Course added to the cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCart = async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      (course) => course._id.toString() !== courseId
    );
    await user.save();

    res
      .status(200)
      .json({ message: "Course removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchCart = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Cart details fetched", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkOut = async (req, res) => {
  const { userId } = req.body;

  try {
    console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: user.cart.map((course) => ({
        price_data: {
          currency: "INR",
          product_data: {
            name: course.title,
          },
          unit_amount: course.price * 100,
        },
        quantity: 1,
      })),
      mode: "payment",
      success_url: `https://lukskill.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://lukskill.vercel.app/failure`,
      metadata: {
        userId: user._id.toString(),
      },
    });

    console.log("Session:", session);

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const paymentConfirmation = async (req, res) => {
  const { session_id } = req.body; 
  console.log("Received session ID:", session_id);

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Stripe session:", session);

    const userId = session.metadata.userId;
    console.log("User ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const payment = new Payment({
      userId,
      courses: user.cart.map((course) => course._id),
      paymentId: session.payment_intent,
      paymentStatus: session.payment_status,
    });
    await payment.save();

    const courseIds = user.cart.map((course) => course._id);
    user.courses = [...user.courses, ...courseIds];

    user.cart = [];
    await user.save();

    console.log("Cart after payment:", user.cart);
    console.log("Courses after payment:", user.courses);
    console.log("Payment details saved:", payment);

    res.status(200).json({ message: "Payment confirmed", payment,user });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: error.message });
  }
};

//India (IN)	4000003560000008	Visa
// Generic decline	4000000000000002	card_declined	generic_decline
// Insufficient funds decline	4000000000009995	card_declined	insufficient_funds
// Lost card decline	4000000000009987	card_declined	lost_card
// Stolen card decline	4000000000009979	card_declined	stolen_card
// Expired card decline	4000000000000069	expired_card	n/a
// Incorrect CVC decline	4000000000000127	incorrect_cvc	n/a
// Processing error decline	4000000000000119	processing_error	n/a
// Incorrect number decline	4242424242424241	incorrect_number	n/a
// Exceeding velocity limit decline	4000000000006975	card_declined	card_velocity_exceeded

