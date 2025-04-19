import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// import bcrypt from "bcrypt";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
// export const generateToken = ({ id, name, email }) => {
//   return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
//     expiresIn: "30d",
//   });
// };

export const createSession = async (userId, { ip, userAgent }) => {
  const session = await prisma.sessions.create({
    data: {
      userId: userId,
      userAgent: userAgent,
      ip: ip,
    },
  });
  return session;
};

// createAccessToken
export const createAccessToken = ({
  id,
  name,
  email,
  isEmailValid,
  sessionId,
}) => {
  return jwt.sign(
    { id, name, email, isEmailValid, sessionId },
    process.env.JWT_SECRET,
    {
      expiresIn: "15min",
    }
  );
};

// createRefreshToken
export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyJWTToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// middleware ma
// findSessionById
const findSessionById = async (sessionId) => {
  const session = await prisma.sessions.findUnique({
    where: { id: sessionId },
  });
  return session;
};

// findUserById
export const findUserById = async (userId) => {
  return prisma.users.findUnique({ where: { id: userId } });
};

// refreshTokens
export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifyJWTToken(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.valid) {
      throw new Error("Invalid Session");
    }

    const user = await findUserById(currentSession.userId);

    if (!user) throw new Error("Invalid User");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentSession.id,
    };

    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken(currentSession.id);

    return { newAccessToken, newRefreshToken };
  } catch (error) {
    console.log(error);
  }
};

// clearUserSession
export const clearUserSession = async (sessionId) => {
  return prisma.sessions.delete({ where: { id: sessionId } });
};

// getAllShortLinks
export const getAllShortLinks = async (id) => {
  const data = await prisma.url_shortener.findMany({ where: { userId: id } });
  return data;
};

// generateRandomToken
export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit;

  return crypto.randomInt(min, max).toLocaleString();
};

// insertVerifyEmailToken
export const insertVerifyEmailToken = async ({ userId, token }) => {
  await prisma.is_email_valid.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return await prisma.is_email_valid.create({
    data: {
      userId,
      token,
      expiresAt: expiresDate,
    },
  });
};

// createVerifyLink
export const createVerifyLink = async ({ email, token }) => {
  const uriEncodedEmail = encodeURIComponent(email);
  return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}&email=${uriEncodedEmail}`;
};
