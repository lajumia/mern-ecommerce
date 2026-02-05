import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: ""
    },

    avatar: {
      type: String,
      default: ""
    }, 

    refreshToken: {
      type: String,
      default: ""
    },

    emailVerified: {
      type: Boolean,
      default: false
    },

    emailOtp:
      {
        type: Number,
        default: null
      },

    emailOtpExpiry: {
      type: Date,
      default: null
    },

    lastLoginAt: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    addressList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address"
      }
    ],

    shoppingCart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartProduct"
      }
    ],

    orderHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order"
      }
    ],

    forgotPasswordOtp: {
      type: String,
      default: null
    },

    forgotPasswordOtpExpiry: {
      type: Date,
      default: null
    },

    passwordChangedAt: {
      type: Date
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local"
    }
  },
  {
    timestamps: true
  }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
