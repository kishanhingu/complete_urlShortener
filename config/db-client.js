//? Using MongoDB
// import { MongoClient } from "mongodb";
// import { env } from "./env.js";

// export const dbClient = new MongoClient(env.MONGODB_URI);

//? Using Mongoose
// import mongoose from "mongoose";
// import { env } from "./env.js";

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(`${env.MONGODB_URI}${env.MONGODB_DATABASE_NAME}`);
//     // mongoose.set("debug", true);
//   } catch (error) {
//     console.log(error);
//     process.exit();
//   }
// };

//? Using MySQL
import mysql from "mysql2/promise";
import { env } from "./env.js";

export const db = await mysql.createConnection({
  host: env.DATABASE_HOST,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
});
