var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController.js");

/*
 * GET
 */
router.get("/logout", userController.logout);
router.get("/logged_in", userController.loggedIn);
router.get("/:id", userController.getUser);

/*
 * POST
 */
router.post("/", userController.create);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

/*
 * PUT
 */
router.put("/:id", userController.update);

/*
 * DELETE
 */
router.delete("/:id", userController.remove);

module.exports = router;
