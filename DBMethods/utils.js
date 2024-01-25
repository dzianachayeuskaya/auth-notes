const makeRequest = (req, { getOneResult } = {}) => {
  req = getOneResult ? req.limit(1) : req;

  return new Promise((resolve, reject) => {
    req
      .then((results) => {
        resolve(getOneResult ? results[0] : results);
      })
      .catch((err) => reject(err));
  });
};

const NOTE_LIMIT = 20;

module.exports = { makeRequest, NOTE_LIMIT };
