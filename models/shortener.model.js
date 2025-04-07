//* With out Database
// import { readFile, writeFile } from "fs/promises";
// import path from "path";

// const DATA_FILE = path.join("data", "dataLinks.json");

// export const getData = async () => {
//   try {
//     const data = await readFile(DATA_FILE, "utf-8");
//     return JSON.parse(data);
//   } catch (error) {
//     if (error.code === "ENOENT") {
//       await writeFile(DATA_FILE, JSON.stringify({}));
//       return {};
//     } else {
//       throw error;
//     }
//   }
// };

// export const saveData = async (data) => {
//   await writeFile(DATA_FILE, JSON.stringify(data));
// };

//* With MONGODB database
// import { dbClient } from "../config/db-client.js";
// import { env } from "../config/env.js";

// const db = dbClient.db(env.MONGODB_DATABASE_NAME);
// const shortenerCollection = db.collection("shorteners_mongodb");

// export const getData = async () => {
//   return await shortenerCollection.find().toArray();
// };

// export const saveData = async (link) => {
//   return await shortenerCollection.insertOne(link);
// };

// export const getLinkByShortCode = async (shortCode) => {
//   return await shortenerCollection.findOne({ shortCode: shortCode });
// };

//* With MYSQL database
import { db } from "../config/db-client.js";

export const getData = async () => {
  const [data] = await db.execute("SELECT * FROM short_links");
  return data;
};

export const saveData = async (link) => {
  const [result] = await db.execute(
    `INSERT INTO short_links(shortCode, url) values(?,?)`,
    [link.shortCode, link.url]
  );
  return result;
};

export const getLinkByShortCode = async (shortCode) => {
  const [data] = await db.execute(
    `SELECT * FROM short_links WHERE shortCode= ?`,
    [shortCode]
  );
  return data[0];
};
