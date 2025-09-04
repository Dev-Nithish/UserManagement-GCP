const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply authMiddleware to all routes
router.get("/", authMiddleware, usersController.getUsers);
router.post("/", authMiddleware, usersController.addUser);
router.put("/:id", authMiddleware, usersController.updateUser);
router.delete("/:id", authMiddleware, usersController.deleteUser);

module.exports = router;
