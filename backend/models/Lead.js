const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true, 
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"]
  },

  phone: {
    type: String,
    required: [true, "Phone is required"],
    match: [/^[0-9]{10}$/, "Phone must be 10 digits"]
  },

  //  STAGE ENUM (important)
  stage: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'],
    default: 'New'
  },

  //  STATUS ENUM (optional but recommended)
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Lead", leadSchema);