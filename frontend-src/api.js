const PREFIX = "/api/notes";
const NOTE_LIMIT = 20;

const req = (url, options = {}) => {
  const { body } = options;
  return fetch((PREFIX + url).replace(/\/\/$/, ""), {
    ...options,
    body: body ? JSON.stringify(body) : null,
    headers: {
      ...options.headers,
      ...(body
        ? {
            "Content-Type": "application/json",
          }
        : null),
    },
  }).then((res) => {
    return res.ok
      ? res.status === 204
        ? null
        : res.json()
      : res.text().then((message) => {
          throw new Error(message);
        });
  });
};

export const getNotes = async ({ age, search, page } = {}) => {
  const notes = await req(`/?age=${age}&search=${search}&page=${page}`);

  return { data: notes[NOTE_LIMIT] ? notes.slice(0, -1) : notes, hasMore: notes[NOTE_LIMIT] ? true : false };
};

export const createNote = async (title, text) => {
  const newNote = await req("/", { method: "POST", body: { title, descr: text } });
  return newNote;
};

export const getNote = async (id) => {
  const note = await req(`/${id}`);

  return note;
};

export const changeStatus = async (id, status) => {
  await req(`/${id}/changeStatus`, {
    method: "POST",
    body: {
      is_archived: status,
    },
  });
};

export const editNote = async (id, title, text) => {
  await req(`/${id}`, { method: "PATCH", body: { title, descr: text } });
};

export const deleteNote = async (id) => {
  await req(`/${id}`, { method: "DELETE" });
};

export const deleteAllArchived = async () => {
  await req(`/`, { method: "DELETE" });
};

export const notePdfUrl = (id) => {
  return `${process.env.HOST}${PREFIX}/${id}/download`;
};
