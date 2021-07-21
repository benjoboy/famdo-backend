var userModel = require("../models/userModel.js");

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {
  /**
   * userController.create()
   */
  create: function (req, res) {
    var user = new userModel({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      surname: req.body.surname,
    });
    user.save(function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when creating user",
          error: err.message,
        });
      } else if (user) {
        req.session.userId = user._id;
        req.session.email = req.body.email;
      } else {
        console.log("no user");
      }
      return res.status(201).json(user);
    });
  },
  /**
   * userController.login()
   */
  login: function (req, res, next) {
    userModel.authenticate(
      req.body.email,
      req.body.password,
      function (error, user) {
        if (error || !user) {
          var err = new Error("Wrong email or password.");
          err.status = 401;
          return next(err);
        } else {
          req.session.userId = user._id;
          req.session.email = req.body.email;
          req.session.families = user.families;
          return res.status(201).json(user);
        }
      }
    );
  },
  /**
   * userController.logout()
   */

  logout: function (req, res) {
    if (req.session.userId) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return res.status(500).json({ err: err, message: "unknown error" });
        } else {
        }
      });
      return res.status(200).json({ info: "user is logged out" });
    } else {
      return res.status(200).json({ info: "user is already logged out" });
    }
  },
  /**
   * userController.getUser()
   */

  getUser: function (req, res) {
    userModel.findById(req.session.userId).exec(function (error, user) {
      if (error) {
        return res.status(500).json({ err: error });
      } else {
        if (user === null) {
          return res.status(400).json({ err: error });
        } else {
          return res.status(200).json(user);
        }
      }
    });
  },

  /**
   * userController.profil()
   */

  profile: function (req, res, next) {
    userModel.findById(req.session.userId).exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error("Not authorized! Go back!");
          err.status = 400;
          return next(err);
        } else {
          res.render("user/profile", user);
        }
      }
    });
  },
  /**
   * userController.update()
   */
  update: function (req, res) {
    var id = req.params.id;
    userModel.findOne({ _id: id }, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when getting user",
          error: err.message,
        });
      }
      if (!user) {
        return res.status(404).json({
          message: "No such user",
        });
      }

      user.email = req.body.email ? req.body.email : user.email;
      user.email = req.body.username ? req.body.email : user.email;
      user.password = req.body.password ? req.body.password : user.password;

      user.save(function (err, user) {
        if (err) {
          return res.status(500).json({
            message: "Error when updating user.",
            error: err.message,
          });
        }

        return res.json(user);
      });
    });
  },

  /**
   * userController.remove()
   */
  remove: function (req, res) {
    var id = req.params.id;
    userModel.findByIdAndRemove(id, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: "Error when deleting the user.",
          error: err.message,
        });
      }
      return res.status(204).json();
    });
  },

  /**
   * userController.loggedIn()
   */

  loggedIn: async function (req, res) {
    console.log(req.session.userId);

    if (req.session.userId) {
      try {
        user = await userModel.findById(req.session.userId);
        return res.status(200).json({
          logged_in: true,
          user: user,
        });
      } catch (e) {
        return res.status(500).json({
          message: "error getting user",
          error: e,
        });
      }
    } else {
      return res.status(200).json({
        logged_in: false,
      });
    }
  },
};
