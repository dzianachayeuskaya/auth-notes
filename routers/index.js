const path = require("path");
const express = require("express");
const { setCsrfToken } = require(path.join(__dirname, "..", "utils"));

const router = express.Router();

router.get("/", setCsrfToken(), (req, res) => {
  if (req.user) {
    return res.redirect("/dashboard");
  }

  let errors = req.flash("error");

  if (!errors.length && req.query.authError === "true") {
    errors = ["An authentication error occurred, please enter the correct username and password"];
  }
  const hasMessage = !!errors.length;
  const error = errors[errors.length - 1];

  res.render("index", { message: error, hasMessage });
});

module.exports = router;
