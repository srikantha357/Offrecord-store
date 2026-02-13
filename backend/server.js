const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
require("dotenv").config();

const app = express();

/* ================= SECURITY ================= */
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});
app.use(limiter);

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

const enquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

/* ================= RAZORPAY ================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* ================= MAIL ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("🚀 Backend Running Successfully");
});

/* ================= CREATE ORDER ================= */
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

/* ================= VERIFY PAYMENT + SEND INVOICE ================= */
app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      amount
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    // Send Invoice Email
    await transporter.sendMail({
      from: `"OFF RECORD STORE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Payment Successful - Invoice",
      html: `
        <h2>Thank you for your purchase 🎉</h2>
        <p>Payment ID: ${razorpay_payment_id}</p>
        <p>Amount Paid: ₹${amount}</p>
        <p>Your order is being processed.</p>
      `
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ================= CONTACT FORM ================= */
app.post("/send-enquiry", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    // Save to DB
    await Enquiry.create({ name, email, message });

    // Send to You
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Enquiry - OFF RECORD STORE",
      html: `
        <h3>New Enquiry</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });

    // Auto Reply
    await transporter.sendMail({
      from: `"OFF RECORD STORE" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your enquiry",
      html: `
        <h3>Hi ${name},</h3>
        <p>Thank you for contacting OFF RECORD STORE.</p>
        <p>We will respond within 24 hours.</p>
      `
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: "Failed to send enquiry" });
  }
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
