const Ticket = require("../models/Ticket");
const Tool = require("../models/Tool");

async function createTicket(req, res) {
  const { toolId, issueType, notes = "" } = req.body;

  if (!toolId || !issueType) {
    return res.status(400).json({ message: "toolId and issueType are required" });
  }

  const tool = await Tool.findById(toolId);
  if (!tool) return res.status(404).json({ message: "Tool not found" });

  const ticket = await Ticket.create({
    tool: toolId,
    issueType,
    notes,
    createdBy: req.user.id,
  });

  if (issueType === "missing") tool.status = "missing";
  if (issueType === "damaged") tool.status = "damaged";
  if (issueType === "calibration") tool.status = "calibration";
  await tool.save();

  res.status(201).json(ticket);
}

async function getTickets(req, res) {
  const isAdmin = req.user.role === "admin";
  const filter = isAdmin ? {} : { createdBy: req.user.id };

  const tickets = await Ticket.find(filter)
    .populate("tool")
    .populate("createdBy", "name email role area")
    .populate("assignedTo", "name email role area")
    .sort({ updatedAt: -1 });

  res.json(tickets);
}

async function updateTicket(req, res) {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  const ticket = await Ticket.findById(id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  if (status) ticket.status = status;
  if (assignedTo) ticket.assignedTo = assignedTo;

  await ticket.save();
  res.json(ticket);
}

module.exports = { createTicket, getTickets, updateTicket };
