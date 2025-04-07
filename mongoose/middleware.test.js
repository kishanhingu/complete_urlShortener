import mongoose from "mongoose";

// step 1:- to connect to the database
try {
  await mongoose.connect("mongodb://localhost:27017/mongoose_database");
  mongoose.set("debug", true);
} catch (error) {
  console.error(error);
  process.exit();
}

// step 2:- create schema
const middlewareSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    age: { type: Number, require: true },
    //   createdAt: { type: Date, default: Date.now() },
    //   updatedAt: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

//! we will use middleware
// middlewareSchema.pre(
//   ["updateOne", "updateMany", "findOneAndUpdate"],
//   function (next) {
//     this.set({ updatedAt: Date.now() });
//     next();
//   }
// );

// step 3:- creating a model
const Middleware = mongoose.model("middleware", middlewareSchema);

// Insert Data
// await Middleware.create({
//   name: "Kishan Hingu",
//   email: "kishan@gmail.com",
//   age: 20,
// });

// Update Data
await Middleware.updateOne(
  { email: "kishan@gmail.com" },
  { $set: { age: 20 } }
);

await mongoose.connection.close();

// middleware.pre("save") tyare use thase jyare
// const newUser = new Test({
//   name: "Nita Hingu",
//   email: "nita@gmail.com",
//   age: 50,
// });

// await newUser.save();
