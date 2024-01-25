const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async function (knex) {
  await knex("session").del();

  await knex("notes").del();

  await knex("users").del();

  const users = await knex("users")
    .insert([
      { username: "user1", password_hash: bcrypt.hashSync("qwe", 10) },
      { username: "user2", password_hash: bcrypt.hashSync("pwd007", 10) },
    ])
    .returning("*");

  await knex("notes").insert([
    {
      user_id: users[0].id,
      title: "Отправить почтовый перевод",
      descr: `## Детали перевода

**Сумма перевода:** $500.00

**Получатель:** Иван Иванов

**Адрес получателя:** город Москва, проезд 1-й Автозаводский 2, почтовый индекс 115280

## Назначение перевода

Оплата услуг`,
      created_at: knex.raw("NOW() - INTERVAL '1 year'"),
      is_archived: false,
    },
    {
      user_id: users[0].id,
      title: "Что? Где? Когда?",
      descr: "Посмотреть запись программы",
      created_at: knex.raw("NOW() - INTERVAL '2 months'"),
      is_archived: false,
    },
    {
      user_id: users[0].id,
      title: "Составить план отпуска",
      descr: `- выбрать страну,
- присмотреть отель,
- определиться с продолжительностью отдыха,
- купить билеты,
- забронировать экскурсии`,
      created_at: knex.raw("NOW() - INTERVAL '2 weeks'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 weeks'"),
      is_archived: false,
    },
    {
      user_id: users[0].id,
      title: "Сходить в магазин",
      descr: `**Список продуктов:**
* салат;
* яйца;
* овощи;
* хлеб.`,
      created_at: knex.raw("NOW() - INTERVAL '1 day'"),
      is_archived: true,
    },
    {
      user_id: users[1].id,
      title: "Список дел на выходные",
      descr: `- **Поход в магазин**
- **Уборка**
- **Ужин**
- **Кино**`,
      created_at: knex.raw("NOW() - INTERVAL '1 day'"),
      is_archived: false,
    },
  ]);
};
