const express = require("express");
const path = require("path");

const { setCsrfToken } = require(path.join(__dirname, "..", "utils"));

const router = express.Router();

router.get("/", setCsrfToken(), async (req, res) => {
  if (!req.user) {
    return res.status(401).redirect("/");
  }

  res.render("dashboard", {
    user: req.user,
  });
});

router.get("*", (req, res) => {
  res.render("error");
});

module.exports = router;
