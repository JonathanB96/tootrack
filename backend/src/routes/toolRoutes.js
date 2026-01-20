const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const {
  getTools,
  createTool,
  checkoutTool,
  returnTool,
  updateToolStatus,
} = require("../controllers/toolController");

router.use(protect);

router.get("/", getTools);
router.post("/", requireRole("admin"), createTool);

router.patch("/:id/checkout", checkoutTool);
router.patch("/:id/return", returnTool);

router.patch("/:id/status", requireRole("admin"), updateToolStatus);

module.exports = router;
