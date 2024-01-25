const path = require("path");

const getPath = (paths) => require(path.join(__dirname, ...paths));

const { findNoteByNoteId } = getPath(["DBMethods", "notes"]);

const setCsrfToken = () => (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

const findNoteFromAuthorizedUser = (req) => {
  return new Promise((resolve, reject) => {
    if (!req.user) {
      reject(401);
    }

    findNoteByNoteId(req.params.id)
      .then((note) => {
        if (!note) {
          reject(404);
        }
        if (note.user_id !== req.user.id) {
          reject(403);
        }
        resolve(note);
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  getPath,
  setCsrfToken,
  findNoteFromAuthorizedUser,
};
