const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    tool: { type: mongoose.Schema.Types.ObjectId, ref: "Tool", required: true },
    issueType: { type: String, enum: ["missing", "replace", "calibration", "damaged"], required: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
