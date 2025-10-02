import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    provider: { type: String, default: "manual" },
    providerRef: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);