var express = require("express");
var router = express.Router();
var familyController = require("../controllers/familyController.js");

/*
 * GET
 */

router.get("/:id", familyController.getFamily);
/*
router.get("/logout", userController.logout);
router.get("/logged_in", userController.loggedIn);
*/
/*
 * POST
 */
router.post("/", familyController.create);
router.post("/invite", familyController.invite);
router.post("/invite/accept", familyController.acceptInvite);
router.post("/invite/decline", familyController.declineInvite);

/*
 * PUT
 */
/*
router.put("/:id", userController.update);
*/
/*
 * DELETE
 */

module.exports = router;
