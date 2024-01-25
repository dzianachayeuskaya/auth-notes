require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csurf = require("tiny-csrf");
const passport = require("passport");
const flash = require("connect-flash");
const PGSimpleStore = require("connect-pg-simple")(session);
const nunjucks = require("nunjucks");
const { getPath } = require(path.join(__dirname, "utils"));
const { conObject } = getPath(["DBMethods", "dbConnection"]);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new PGSimpleStore({
      conObject,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  }),
);

app.use(csurf(process.env.CSURF_SECRET, ["POST"], [/\/api\/notes\/*/i]));
app.use(flash());
app.use(passport.session());

app.use("/", getPath(["routers", "index"]));
app.use("/", getPath(["routers", "auth"]));
app.use("/dashboard", getPath(["routers", "dashboard"]));
app.use("/api/notes", getPath(["routers", "notes"]));

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk");

app.get("*", (req, res) => {
  res.render("error");
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.message);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`  Listening on http://localhost:${port}`);
});
