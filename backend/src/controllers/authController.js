const User = require("../models/User");
const { signToken } = require("../utils/jwt");

async function register(req, res) {
  const { name, email, password, role = "operator", area = "Area-1" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role, area });

  res.status(201).json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, area: user.area },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await user.matchPassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  res.json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role, area: user.area },
  });
}

async function me(req, res) {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
}

module.exports = { register, login, me };
