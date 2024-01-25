const path = require("path");
const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const LocalStrategy = require("passport-local");

const getPathToEnv = () => {
  const env = process.env.NODE_ENV || "development";
  console.log("env", env);
  if (env !== "production") {
    console.log("path to", path.resolve(__dirname, "..", `.env.${env}`));
    return { path: path.resolve(__dirname, "..", `.env.${env}`) };
  }
  return {};
};

require("dotenv").config(getPathToEnv());

const { promisify } = require("util");
const bcrypt = require("bcrypt");

const { getPath } = require(path.join(__dirname, "..", "utils"));

const { findUserOrCreate, findUserByUsername, createUser } = getPath(["DBMethods", "users"]);
const { createDemoNote } = getPath(["DBMethods", "notes"]);
console.log("process.env.HOST", process.env.HOST);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.HOST}/auth/github/callback`,
    },
    function (accessToken, refreshToken, profile, cb) {
      findUserOrCreate(profile)
        .then((user) => {
          return cb(null, user);
        })
        .catch((err) => cb(err));
    },
  ),
);

const compareAsync = promisify(bcrypt.compare);

passport.use(
  new LocalStrategy({ passReqToCallback: true }, async function verify(req, username, password, cb) {
    if (!username || !password) {
      return cb(null, false, { message: "The fields 'Username' and 'Password' are required" });
    }

    try {
      const user = await findUserByUsername(username);

      if (req.url === "/signup") {
        if (user) return cb(null, false, { message: "A user with the same name already exists" });

        const newUser = await createUser({ username, password });
        await createDemoNote(newUser.id);

        return cb(null, newUser);
      } else {
        if (!user || !(await compareAsync(password, user.password_hash)))
          return cb(null, false, { message: "Wrong username or password" });

        return cb(null, user);
      }
    } catch (err) {
      return cb(err);
    }
  }),
);

passport.serializeUser(function ({ id, username }, cb) {
  process.nextTick(function () {
    cb(null, { id, username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

const router = express.Router();

router.post(
  ["/login", "/signup"],
  passport.authenticate("local", {
    successReturnToOrRedirect: "/dashboard",
    failureRedirect: "/?authError=true",
    failureFlash: true,
  }),
);

router.get("/auth/github", passport.authenticate("github"));

router.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), function (req, res) {
  res.redirect("/dashboard");
});

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
