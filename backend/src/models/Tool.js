const mongoose = require("mongoose");

const toolSchema = new mongoose.Schema(
  {
    toolTag: { type: String, required: true, unique: true, trim: true }, // TT-001
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    area: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["available", "checked_out", "missing", "calibration", "damaged"],
      default: "available",
    },

    currentHolderType: { type: String, enum: ["user", "station", "none"], default: "none" },
    currentHolder: { type: String, default: "" },

    lastActionNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tool", toolSchema);
