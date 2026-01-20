const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const { createTicket, getTickets, updateTicket } = require("../controllers/ticketController");

router.use(protect);

router.post("/", createTicket);
router.get("/", getTickets);
router.patch("/:id", requireRole("admin"), updateTicket);

module.exports = router;
