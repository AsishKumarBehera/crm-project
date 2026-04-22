import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",   //  foreign key
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  }
}, { timestamps: true });

export default mongoose.model("Note", noteSchema);