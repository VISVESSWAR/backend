import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/db.js";
//import Stripe from "stripe";
import cors from "cors";

//const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const session = await stripe.checkout.sessions.create({
//   line_items: {},
//   mode: "payment",
//   success_url: "http://localhost:3001/api/payment/success",
//   cancel_url: "http://localhost:3001/api/payment/failure",
// });

dotenv.config();

// Initialize express
const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
const port = process.env.PORT;

// Render home page
app.get("/", (req, res) => {
  console.log("Home page rendered");
  res.send("Server is working");
});

// Import routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import cartRoutes from "./routes/cart.js";
app.use("/api/user", userRoutes);
app.use("/api/user/cart", cartRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);

// Start the server
app.listen(port, () => {
  console.log("Server running on port " + port);
  connectDB();
});
