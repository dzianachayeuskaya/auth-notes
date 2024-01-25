const { readFile } = require("node:fs/promises");
const { resolve } = require("node:path");
const path = require("path");

const { knex } = require(path.join(__dirname, "dbConnection"));
const { makeRequest, NOTE_LIMIT } = require(path.join(__dirname, "utils"));

const findNotesByUserId = (userId, query) => {
  const { age, search, page } = query;
  let limiter = null;

  const limitingRaw = (interval) => {
    return knex.raw(
      `CASE WHEN updated_at IS NOT NULL THEN updated_at > NOW() - INTERVAL '${interval}' ELSE created_at > NOW() - INTERVAL '${interval}' END`,
    );
  };

  switch (age) {
    case "1month":
      limiter = limitingRaw("1 month");
      break;
    case "3months":
      limiter = limitingRaw("3 months");
      break;
    case "alltime":
      limiter = null;
      break;
    case "archive":
      limiter = { is_archived: true };
      break;
    default:
      limiter = limitingRaw("1 week");
  }

  let request = knex("notes").select().where({
    user_id: userId,
  });

  if (search) {
    request = request.andWhere("title", "ilike", `%${search}%`);
  }

  if (limiter) {
    request = request.andWhere(limiter);
  }

  const startVisibleNoteIndex = NOTE_LIMIT * (page - 1);

  request = request.limit(NOTE_LIMIT + 1).offset(startVisibleNoteIndex);

  return makeRequest(request);
};

const findNoteByNoteId = (noteId) => {
  const req = knex("notes").select().where({ id: noteId });

  return makeRequest(req, { getOneResult: true });
};

const createNote = (userId, { title, descr }) => {
  const req = knex("notes")
    .insert({ user_id: userId, title: title || "", descr: descr || "" })
    .returning("id");

  return makeRequest(req, { getOneResult: true });
};

const createDemoNote = (userId) => {
  const filePath = resolve(path.join(__dirname, "assets", "demo.md"));

  return new Promise((resolve, reject) => {
    readFile(filePath, { encoding: "utf8" })
      .then((contents) => {
        const req = knex("notes").insert({ user_id: userId, title: "Demo", descr: contents }).returning("id");

        resolve(makeRequest(req, { getOneResult: true }));
      })
      .catch((err) => reject(err));
  });
};

const changeStatusNote = (noteId, { is_archived }) => {
  const req = knex("notes").where({ id: noteId }).update({ is_archived, updated_at: knex.fn.now() });

  return makeRequest(req);
};

const editNote = (noteId, { title, descr }) => {
  const req = knex("notes").where({ id: noteId }).update({ title, descr, updated_at: knex.fn.now() });

  return makeRequest(req);
};

const deleteNote = (noteId) => {
  const req = knex("notes").where({ id: noteId }).delete();

  return makeRequest(req);
};

const deleteArchivedNotesByUserId = (userId) => {
  const req = knex("notes").where({ user_id: userId, is_archived: true }).delete();

  return makeRequest(req);
};

module.exports = {
  findNotesByUserId,
  findNoteByNoteId,
  createNote,
  createDemoNote,
  changeStatusNote,
  editNote,
  deleteNote,
  deleteArchivedNotesByUserId,
};
