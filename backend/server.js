const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors({
  origin: "*", // Later change to your domain for security
}));
app.use(express.json());

/* ============================
   RAZORPAY INSTANCE
============================ */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ============================
   ROOT ROUTE (Render Health)
============================ */
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

/* ============================
   CREATE ORDER ROUTE
============================ */
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: amount * 100, // convert ₹ to paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

/* ============================
   VERIFY PAYMENT ROUTE
============================ */
app.post("/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully ✅" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature ❌" });
    }

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ============================
   START SERVER
============================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
