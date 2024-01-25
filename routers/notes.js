const express = require("express");
const path = require("path");

const markdownit = require("markdown-it");
const { full } = require("markdown-it-emoji");
const twemoji = require("twemoji");
const puppeteer = require("puppeteer");

const { getPath } = require(path.join(__dirname, "..", "utils"));

const { findUserByUsername } = getPath(["DBMethods", "users"]);
const { findNotesByUserId, createNote, editNote, deleteNote, changeStatusNote, deleteArchivedNotesByUserId } = getPath([
  "DBMethods",
  "notes",
]);
const { findNoteFromAuthorizedUser } = getPath(["utils"]);

const router = express.Router();

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
}).use(full);
md.renderer.rules.emoji = function (token, idx) {
  return twemoji.parse(token[idx].content);
};

router.get("/", (req, res) => {
  if (!req.user) {
    return res.status(401).redirect("/");
  }

  findNotesByUserId(req.user.id, req.query)
    .then((notes) => res.json(notes))
    .catch((err) => res.status(err.status || 500).send(err.message));
});

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  try {
    const currentUser = await findUserByUsername(req.user.username);
    if (!req.body.title && !req.body.descr) {
      return res
        .status(400)
        .send("The request body must contain the following fields: title: string, descr: string - in raw format.");
    }

    const note = await createNote(currentUser.id, req.body);
    res.header("Location", `${req.protocol}://${req.hostname}/api/notes/${note.id}`).json(note);
  } catch (err) {
    res.status(err.status || 500).send(err.message);
  }
});

router.get("/:id", (req, res) => {
  findNoteFromAuthorizedUser(req)
    .then((note) =>
      res.json({
        ...note,
        html: md.render(note.descr),
      }),
    )
    .catch((err) => {
      if (typeof err === "number") {
        if (err === 401) return res.status(err).redirect("/");
        res.sendStatus(err);
      } else res.status(err.status || 500).send(err.message);
    });
});

router.get("/:id/download", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ args: ["--no-sandbox"], headless: "new" });
    const page = await browser.newPage();

    const note = await findNoteFromAuthorizedUser(req);
    const htmlContent = md.render(note.descr);
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.attachment(`MyNote_${note.title}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    if (typeof err === "number") {
      if (err === 401) return res.status(err).redirect("/");
      res.sendStatus(err);
    } else res.status(err.status || 500).send(err.message);
  }
});

router.post("/:id/changeStatus", async (req, res) => {
  if (!Object.keys(req.body).includes("is_archived")) {
    res.status(404).send("The request body must contain the field is_archived: boolean - in raw format.");
    return;
  }

  findNoteFromAuthorizedUser(req)
    .then((note) => changeStatusNote(note.id, req.body))
    .then(() => res.sendStatus(204))
    .catch((err) => {
      if (typeof err === "number") {
        res.sendStatus(err);
      } else res.status(err.status || 500).send(err.message);
    });
});

router.patch("/:id", async (req, res) => {
  if (!req.body.title && !req.body.descr) {
    res
      .status(404)
      .send("The request body must contain the following fields: title: string, descr: string - in raw format.");
    return;
  }

  findNoteFromAuthorizedUser(req)
    .then((note) => editNote(note.id, req.body))
    .then(() => res.sendStatus(204))
    .catch((err) => {
      if (typeof err === "number") {
        res.sendStatus(err);
      } else res.status(err.status || 500).send(err.message);
    });
});

router.delete("/:id", async (req, res) => {
  findNoteFromAuthorizedUser(req)
    .then((note) => deleteNote(note.id))
    .then(() => res.sendStatus(204))
    .catch((err) => {
      if (typeof err === "number") {
        res.sendStatus(err);
      } else res.status(err.status || 500).send(err.message);
    });
});

router.delete("/", async (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  deleteArchivedNotesByUserId(req.user.id)
    .then(() => res.sendStatus(204))
    .catch((err) => res.status(err.status || 500).send(err.message));
});

module.exports = router;
