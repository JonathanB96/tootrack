require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Tool = require("./models/Tool");

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing in .env");

  const isLocal = uri.includes("127.0.0.1") || uri.includes("localhost");

  const ALLOW_REMOTE = process.argv.includes("--allow-remote");
  const RESET = process.argv.includes("--reset");

  // Safety: block remote unless explicitly allowed
  if (!isLocal && !ALLOW_REMOTE) {
    throw new Error(
      "Refusing to seed remote DB. Re-run with --allow-remote (or use npm run seed:atlas)."
    );
  }

  // Extra safety: if reset is requested on remote, require a stronger confirmation flag too
  const CONFIRM_RESET = process.argv.includes("--confirm-reset");
  if (!isLocal && RESET && !CONFIRM_RESET) {
    throw new Error(
      "Refusing to RESET remote DB without --confirm-reset. (Use npm run seed:atlas:reset)"
    );
  }

  await mongoose.connect(uri);
  console.log(`✅ Connected to MongoDB (${isLocal ? "LOCAL" : "REMOTE/ATLAS"})`);

  if (RESET) {
    console.log("⚠️ RESET enabled: clearing Users + Tools collections...");
    await User.deleteMany({});
    await Tool.deleteMany({});
  }

  // ---- USERS ----
  const usersToCreate = [
    {
      name: "Jonathan (Admin Tech)",
      email: "admin@test.com",
      password: "Password123!",
      role: "admin",
      area: "Area-1",
    },
    {
      name: "Line Leader A",
      email: "leader@test.com",
      password: "Password123!",
      role: "leader",
      area: "Area-1",
    },
    {
      name: "Operator One",
      email: "op1@test.com",
      password: "Password123!",
      role: "operator",
      area: "Area-1",
    },
    {
      name: "Operator Two",
      email: "op2@test.com",
      password: "Password123!",
      role: "operator",
      area: "Area-1",
    },
  ];

  const createdUsers = [];
  for (const u of usersToCreate) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      createdUsers.push(exists);
      continue;
    }
    const newUser = await User.create(u);
    createdUsers.push(newUser);
  }

  console.log(
    "✅ Users ready:",
    createdUsers.map((u) => `${u.role}:${u.email}`).join(", ")
  );

  // ---- TOOLS ----
  const toolsToCreate = [
    { toolTag: "TT-001", name: "Torque Wrench 10–50 Nm", category: "Torque", area: "Area-1", status: "available" },
    { toolTag: "TT-002", name: "Torque Wrench 50–200 Nm", category: "Torque", area: "Area-1", status: "calibration" },
    { toolTag: "TT-003", name: "Tape Measure 25ft", category: "Measuring", area: "Area-1", status: "available" },
    { toolTag: "TT-004", name: "3/8 Ratchet", category: "Sockets", area: "Area-1", status: "checked_out", currentHolderType: "user", currentHolder: "Operator One" },
    { toolTag: "TT-005", name: "1/4 Ratchet", category: "Sockets", area: "Area-1", status: "available" },
    { toolTag: "TT-006", name: "Socket Set Metric", category: "Sockets", area: "Area-1", status: "available" },
    { toolTag: "TT-007", name: "Socket Set SAE", category: "Sockets", area: "Area-1", status: "available" },
    { toolTag: "TT-008", name: "Phillips Screwdriver #2", category: "Hand Tools", area: "Area-1", status: "available" },
    { toolTag: "TT-009", name: "Flathead Screwdriver", category: "Hand Tools", area: "Area-1", status: "available" },
    { toolTag: "TT-010", name: "Allen Key Set", category: "Hand Tools", area: "Area-1", status: "missing" },
    { toolTag: "TT-011", name: "Adapter 3/8 to 1/2", category: "Adapters", area: "Area-1", status: "available" },
    { toolTag: "TT-012", name: "Adjustable Wrench", category: "Wrenches", area: "Area-1", status: "damaged" },
  ];

  let createdToolsCount = 0;
  for (const t of toolsToCreate) {
    const exists = await Tool.findOne({ toolTag: t.toolTag });
    if (exists) continue;
    await Tool.create({ ...t, lastActionNote: "Seeded by script" });
    createdToolsCount++;
  }

  console.log(`✅ Tools created: ${createdToolsCount} (existing tools skipped)`);

  await mongoose.disconnect();
  console.log("✅ Done. Disconnected.");
}

seed().catch(async (err) => {
  console.error("❌ Seed failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
