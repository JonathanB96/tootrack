require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const toolRoutes = require("./routes/toolRoutes");
const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

// ✅ Put this BEFORE using cors()
const allowedOrigins = [
  "http://localhost:5173",
  "https://mytooltracker.netlify.app",
];

// DB
connectDB();

// Middleware
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true); // Postman / server-to-server
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// (Optional but helpful) handle preflight explicitly
app.options("*", cors());

// Routes
app.get("/", (req, res) => res.send("ToolTrack API running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/tickets", ticketRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
