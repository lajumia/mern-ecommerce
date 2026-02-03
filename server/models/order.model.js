import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    orderId: [
      {
        type: String,
        required: true,
        unique: true,
        trim: true
      }
    ],

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    productDetails: {
      name: { type: String, required: true, trim: true },
      images: { type: [String], default: [] },
      price: { type: Number, required: true, min: 0 }
    },

    paymentId: {
      type: String,
      required: true,
      default: "",
      trim: true
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    paymentStatus: {
      type: Boolean,
      default: false
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    shippingDate: {
      type: Date,
      default: null
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const OrderModel = mongoose.model("Order", orderSchema);
export default OrderModel;
