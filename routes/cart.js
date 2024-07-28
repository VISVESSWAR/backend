import express from "express";
import {
  addCart,
  removeCart,
  checkOut,
  paymentConfirmation,
  fetchCart,
} from "../controllers/Cart.js";

const router = express.Router();

router.post("/add", addCart);
router.post("/remove", removeCart);
router.get("/:id", fetchCart);
router.post("/checkout", checkOut);
router.post("/payment-confirmation", paymentConfirmation);

export default router;
