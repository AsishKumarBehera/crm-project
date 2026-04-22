import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Name should contain only letters"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },

    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },

    dob: {
      type: Date,
    },

    profilePic: {
      type: String,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    address: {
  type: String,
  trim: true,
},
language: {
  type: String,
  default: 'English'
},
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// module.exports = mongoose.model("User", userSchema);
export default mongoose.model("User", userSchema);