import { Router } from "express";
import mongoose from "mongoose";
import { Payment } from "../models/Payment.js";
import { Booking } from "../models/Booking.js";

const router = Router();

// POST /api/payments/create-order - Mock Razorpay order creation
router.post("/create-order", async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    if (!mongoose.isValidObjectId(bookingId) || !amount) {
      return res.status(400).json({ error: "Missing bookingId or amount" });
    }

    // Verify booking exists
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Mock: generate a fake Razorpay order ID
    const razorpayOrderId = `order_${Date.now()}`;

    const payment = await Payment.create({
      bookingId,
      amount,
      razorpayOrderId,
      status: "pending",
    });

    res.json({
      orderId: payment._id,
      razorpayOrderId,
      amount,
      currency: "INR",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/payments/verify - Mock payment verification
router.post("/verify", async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId } = req.body;
    if (!mongoose.isValidObjectId(paymentId) || !razorpayPaymentId) {
      return res
        .status(400)
        .json({ error: "Missing paymentId or razorpayPaymentId" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // Mock: accept all payments (in real scenario, verify with Razorpay API)
    payment.status = "success";
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();

    res.json({ status: "success", paymentId: payment._id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/payments/:paymentId
router.get("/:paymentId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.paymentId)) {
      return res.status(400).json({ error: "Invalid paymentId" });
    }
    const payment = await Payment.findById(req.params.paymentId).lean();
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
