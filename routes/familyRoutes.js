var express = require("express");
var router = express.Router();
var familyController = require("../controllers/familyController.js");

/*
 * GET
 */

router.get("/:id", familyController.getFamily);
router.get("/schedule", familyController.getSchedule);
/*
router.get("/logout", familyController.logout);
router.get("/logged_in", familyController.loggedIn);
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

router.put("/event/create", familyController.createEvent);
router.put("/event/update", familyController.updateEvent);

/*
 * DELETE
 */
router.delete("/event/:id", familyController.deleteEvent);

module.exports = router;
