import mongoose from "mongoose";

// step 1:- to connect to the database
try {
  await mongoose.connect("mongodb://localhost:27017/mongoose_database");
  mongoose.set("debug", true);
} catch (error) {
  console.log(error);
  process.exit();
}

// step 2:- create schema
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true, min: 5 },
  createdAt: { type: Date, default: Date.now() },
});

// step 3:- creating a model
const Users = mongoose.model("user", userSchema);

// await Users.create({ name: "kishan", age: 20, email: "kishan@gmail.com" });

const userData = [
  { name: "Alice", email: "alice@gmail.com", age: 25 },
  { name: "Bob", email: "bob@gmail.com", age: 30 },
  { name: "Charlie", email: "charlie@gmail.com", age: 35 },
];

//CRUD operation in mongoose
// 1. Insert Multiple Data
// await Users.insertMany(userData);

//* 2.Read data
// const users = await Users.find();
// const users = await Users.find({ age: { $gt: 30 } });
// console.log(users);

//* 3.Update data
// const updateUser = await Users.updateOne(
//   { email: "bob@gmail.com" },
//   // {
//   //   $set: { age: 56 },
//   // }
//   { $inc: { age: -4 } }
// );
// console.log(updateUser);

//* 4. Delete data
// const deleteUser = await Users.deleteOne({ email: "bob@gmail.com" });
// console.log(deleteUser);

await mongoose.connection.close();
