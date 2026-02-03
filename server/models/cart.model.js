import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },

    isActive: {
      type: Boolean,
      default: true // soft-delete if user removes from cart
    },

    selectedVariant: {
      type: Object,
      default: {} // store size/color/options if product has variants
    },

    priceAtAdded: {
      type: Number,
      required: true,
      min: 0 // store snapshot of price when added to cart
    }
  },
  {
    timestamps: true
  }
);

const CartModel = mongoose.model("Cart", cartSchema);
export default CartModel;
