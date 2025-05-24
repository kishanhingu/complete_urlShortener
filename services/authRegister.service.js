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
  await prisma.sessions.deleteMany({ where: { userId } });

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

  return crypto.randomInt(min, max).toString();
};

// insertVerifyEmailToken
export const insertVerifyEmailToken = async ({ userId, token }) => {
  return prisma.$transaction(async (tx) => {
    try {
      await tx.is_email_valid.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      await tx.is_email_valid.deleteMany({
        where: { userId },
      });

      const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return await tx.is_email_valid.create({
        data: {
          userId,
          token,
          expiresAt: expiresDate,
        },
      });
    } catch (error) {
      console.error("Failed to insert verification token:", error);
      throw new Error("Unable to create verification token");
    }
  });
};

// createVerifyLink
// export const createVerifyLink = async ({ email, token }) => {
//   const uriEncodedEmail = encodeURIComponent(email);
//   return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}&email=${uriEncodedEmail}`;
// };

export const createVerifyLink = async ({ email, token }) => {
  const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`);
  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
};

// findVerificationEmailToken
export const findVerificationEmailToken = async ({ email, token }) => {
  const tokenData = await prisma.is_email_valid.findMany({
    where: {
      token: token,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  if (!tokenData.length) return null;

  const { userId } = tokenData[0];

  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    // token: tokenData[0].token,
    // expiresAt: tokenData[0].expiresAt,
  };
};

// verifyUserEmailAndUpdate
export const verifyUserEmailAndUpdate = async (email) => {
  return prisma.users.update({
    where: { email: email },
    data: {
      isEmailValid: true,
    },
  });
};

// clearVerifyEmailTokens
export const clearVerifyEmailTokens = async (userId) => {
  return await prisma.is_email_valid.deleteMany({ where: { userId } });
};

// editUserProfile
export const editUserProfile = async ({ id, name }) => {
  return await prisma.users.update({ where: { id: id }, data: { name: name } });
};

// updateUserPassword
export const updateUserPassword = async ({ userId, password }) => {
  return await prisma.users.update({
    where: { id: userId },
    data: { password: password },
  });
};

// findUserByEmail
export const findUserByEmail = async (email) => {
  return await prisma.users.findUnique({ where: { email } });
};

// createResetPasswordLink
export const createResetPasswordLink = async ({ userId }) => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  // delete
  await prisma.password_reset_tokens.deleteMany({ where: { userId } });

  // add token to database
  const expiresTime = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.password_reset_tokens.create({
    data: { userId, tokenHash: hashToken, expiresAt: expiresTime },
  });

  return `${process.env.FRONTEND_URL}/forgot-password/${token}`;
};

// getResetPasswordToken
export const getResetPasswordToken = async (token) => {
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  return await prisma.password_reset_tokens.findMany({
    where: {
      tokenHash: hashToken,
      expiresAt: {
        gte: new Date(),
      },
    },
  });
};

export const clearResetPasswordToken = async (userId) => {
  return await prisma.password_reset_tokens.deleteMany({ where: { userId } });
};

export const getUserWithOauthId = async ({ provider, email, avatarUrl }) => {
  const [user] = await prisma.users.findMany({
    where: {
      email: email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      isEmailValid: true,
      oauth_accounts: {
        where: {
          provider: provider,
        },
        select: {
          provider: true,
          providerAccountId: true,
        },
      },
    },
  });

  await prisma.users.update({
    where: {
      email: email,
    },
    data: {
      avatarUrl: avatarUrl,
    },
  });

  return user;
};

export const linkUserWithOauth = async ({
  userId,
  provider,
  providerAccountId,
  avatarUrl,
}) => {
  await prisma.users.update({
    where: {
      id: userId,
    },
    data: {
      isEmailValid: true,
    },
  });

  if (avatarUrl) {
    await prisma.users.update({
      where: {
        id: userId,
        // avatarUrl: null,
      },
      data: {
        avatarUrl: avatarUrl,
      },
    });
  }

  return await prisma.oauth_accounts.create({
    data: {
      userId,
      provider,
      providerAccountId,
    },
  });
};

export const createUserWithOauth = async ({
  name,
  email,
  provider,
  providerAccountId,
  avatarUrl,
}) => {
  const data = await prisma.$transaction(async (trx) => {
    const user = await trx.users.create({
      data: {
        name,
        email,
        isEmailValid: true,
        avatarUrl,
      },
    });

    const o_auth_data = await trx.oauth_accounts.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      provider: o_auth_data.provider,
      providerAccountId: o_auth_data.providerAccountId,
    };
  });

  return data;
};
