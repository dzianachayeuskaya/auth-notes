const bcrypt = require("bcrypt");
const path = require("path");
const { getPath } = require(path.join(__dirname, "..", "utils"));

const { knex } = getPath(["DBMethods", "dbConnection"]);
const { makeRequest } = getPath(["DBMethods", "utils"]);
const { createDemoNote } = getPath(["DBMethods", "notes"]);

const findUserByUsername = (username) => {
  const req = knex("users").select().where({ username });

  return makeRequest(req, { getOneResult: true });
};

const findUserOrCreate = async ({ id, username }) => {
  try {
    const findReq = knex("users").select().where({ githubId: id });
    const createReq = knex("users").insert({ githubId: id, username }).returning("*");

    const user = await makeRequest(findReq, { getOneResult: true });
    if (user) {
      return user;
    }
    const newUser = await makeRequest(createReq, { getOneResult: true });

    await createDemoNote(newUser.id);
    return newUser;
  } catch (error) {
    console.log(error);
  }
};

const createUser = ({ username, password }) => {
  const req = knex("users")
    .insert({ username, password_hash: bcrypt.hashSync(password, 10) })
    .returning("*");

  return makeRequest(req, { getOneResult: true });
};

module.exports = {
  findUserByUsername,
  findUserOrCreate,
  createUser,
};
