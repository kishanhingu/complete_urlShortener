import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// import bcrypt from "bcrypt";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

//*****? REGISTER PAGE *****//
export const getUserByEmail = async (email) => {
  const user = await prisma.users.findUnique({ where: { email } });
  return user;
};

export const createUser = async ({ name, email, hashedPassword }) => {
  return await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
};

export const hashPassword = async (password) => {
  // using bcrypt
  // return await bcrypt.hash(password, 10);
  // using argon2
  return await argon2.hash(password);
};

//*****? LOGIN PAGE *****//
// using bcrypt
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
// using argon2
export const verifyPassword = async (hashedPassword, password) => {
  return await argon2.verify(hashedPassword, password);
};

// generate token
export const generateToken = ({ id, name, email }) => {
  return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const verifyJWTToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
