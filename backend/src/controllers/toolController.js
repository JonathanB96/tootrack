const Tool = require("../models/Tool");

async function getTools(req, res) {
  const tools = await Tool.find().sort({ updatedAt: -1 });
  res.json(tools);
}

async function createTool(req, res) {
  const { toolTag, name, category = "General", area } = req.body;

  if (!toolTag || !name || !area) {
    return res.status(400).json({ message: "toolTag, name, area are required" });
  }

  const exists = await Tool.findOne({ toolTag });
  if (exists) return res.status(400).json({ message: "Tool tag already exists" });

  const tool = await Tool.create({ toolTag, name, category, area });
  res.status(201).json(tool);
}

async function checkoutTool(req, res) {
  const { id } = req.params;
  const { holderType = "user", holder = req.user.name, note = "" } = req.body;

  const tool = await Tool.findById(id);
  if (!tool) return res.status(404).json({ message: "Tool not found" });

  if (tool.status !== "available") {
    return res.status(400).json({ message: `Tool not available (status: ${tool.status})` });
  }

  tool.status = "checked_out";
  tool.currentHolderType = holderType;
  tool.currentHolder = holder;
  tool.lastActionNote = note;
  await tool.save();

  res.json(tool);
}

async function returnTool(req, res) {
  const { id } = req.params;
  const { note = "" } = req.body;

  const tool = await Tool.findById(id);
  if (!tool) return res.status(404).json({ message: "Tool not found" });

  tool.status = "available";
  tool.currentHolderType = "none";
  tool.currentHolder = "";
  tool.lastActionNote = note;
  await tool.save();

  res.json(tool);
}

async function updateToolStatus(req, res) {
  const { id } = req.params;
  const { status, note = "" } = req.body;

  const allowed = ["available", "checked_out", "missing", "calibration", "damaged"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const tool = await Tool.findById(id);
  if (!tool) return res.status(404).json({ message: "Tool not found" });

  tool.status = status;
  tool.lastActionNote = note;

  if (status !== "checked_out") {
    tool.currentHolderType = "none";
    tool.currentHolder = "";
  }

  await tool.save();
  res.json(tool);
}

module.exports = { getTools, createTool, checkoutTool, returnTool, updateToolStatus };
