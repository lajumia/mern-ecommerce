import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    addressLine: {
      type: String,
      required: true,
      trim: true
    },

    city: {
      type: String,
      required: true,
      trim: true
    },

    state: {
      type: String,
      required: true,
      trim: true
    },

    postalCode: {
      type: String,
      required: true,
      trim: true
    },

    country: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const AddressModel = mongoose.model("Address", addressSchema);
export default AddressModel;
