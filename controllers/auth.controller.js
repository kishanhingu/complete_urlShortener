// import { sendEmail } from "../lib/nodemailer.js";
import {
  clearUserSession,
  clearVerifyEmailTokens,
  createAccessToken,
  createRefreshToken,
  createSession,
  // comparePassword,
  createUser,
  createVerifyLink,
  findUserById,
  findVerificationEmailToken,
  generateRandomToken,
  getAllShortLinks,
  // generateToken,
  getUserByEmail,
  hashPassword,
  insertVerifyEmailToken,
  verifyPassword,
  verifyUserEmailAndUpdate,
} from "../services/authRegister.service.js";
import {
  loginUserSchema,
  registerUserSchema,
  verifyEmailSchema,
} from "../validators/auth-validator.js";

import path from "path";
import fs from "fs/promises";
import ejs from "ejs";
import mjml2html from "mjml";
import { sendEmailWithResend } from "../lib/send_email.js";

// REGISTER PAGE
export const getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/register", { errors: req.flash("errors") });
};

export const postRegister = async (req, res) => {
  if (req.user) return res.redirect("/");

  // const { name, email, password, signup } = req.body;

  const { data, error } = registerUserSchema.safeParse(req.body);

  if (error) {
    req.flash("errors", error.errors[0].message);
    return res.redirect("/register");
  }

  const { name, email, password } = data;

  const userExists = await getUserByEmail(email);

  if (userExists) {
    req.flash("errors", "User already exists");
    return res.redirect("/register");
  }

  // using bcrypt
  // const hashedPassword = await hashPassword(password);
  // using argon2
  const hashedPassword = await hashPassword(password);
  const user = await createUser({ name, email, hashedPassword });

  // if (user) return res.redirect("/login");

  //? user register redirect home page
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    isEmailValid: false,
    sessionId: session.id,
  });

  const refreshToken = createRefreshToken(session.id);

  const baseConfig = { httpOnly: true, secure: true };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.redirect("/");
};

// LOGIN PAGE
export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/login", { errors: req.flash("errors") });
};

export const postLogin = async (req, res) => {
  if (req.user) return res.redirect("/");

  // const { email, password } = req.body;

  const { data, error } = loginUserSchema.safeParse(req.body);

  if (error) {
    req.flash("errors", error.errors[0].message);
    return res.redirect("/login");
  }

  const { email, password } = data;

  const user = await getUserByEmail(email);
  if (!user) {
    req.flash("errors", "Invalid email or password");
    return res.redirect("/login");
  }

  // Using Bcrypt
  // bcrypt.compare(plainTextPassword, hashedPassword)
  // const isPasswordValid = await comparePassword(password, user.password);
  // Using argon2
  const isPasswordVerify = await verifyPassword(user.password, password);
  // if (user.password !== password) {
  if (!isPasswordVerify) {
    req.flash("errors", "Invalid email or password");
    return res.redirect("/login");
  }
  // const token = generateToken({
  //   id: user.id,
  //   name: user.name,
  //   email: user.email,
  // });

  //? sessions create
  const session = await createSession(user.id, {
    userAgent: req.headers["user-agent"],
    ip: req.clientIp,
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    isEmailValid: false,
    sessionId: session.id,
  });

  const refreshToken = createRefreshToken(session.id);

  const baseConfig = { httpOnly: true, secure: true };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // res.setHeader("Set-Cookie", "isLoggedIn=true; path=/;");
  // res.cookie("isLoggedIn", true);
  // res.cookie("access_token", token);
  return res.redirect("/");
};

// getMe protected route
export const getMe = (req, res) => {
  if (!req.user) return res.send(`<h1>You are not logged in 😛😛😛😛😛😛</h1>`);
  return res.send(`<h1>Hello ➡️ ${req.user.name} ➡️➡️ ${req.user.email}</h1>`);
};

// User Logout
export const userLogout = async (req, res) => {
  await clearUserSession(req.user.sessionId);

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect("/login");
};

// getProfilePage
export const getProfilePage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const user = await findUserById(req.user.id);
  if (!user) return res.redirect("/login");

  const userShortLinks = await getAllShortLinks(user.id);

  return res.render("auth/profile", {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      createdAt: user.createdAt,
      links: userShortLinks,
    },
  });
};

// getVerifyEmailPage
export const getVerifyEmailPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const user = await findUserById(req.user.id);

  if (user.isEmailValid || !user) return res.redirect("/");

  return res.render("auth/verify-email", { email: user.email });
};

// resendVerificationLink
export const resendVerificationLink = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const user = await findUserById(req.user.id);

  if (user.isEmailValid || !user) return res.redirect("/");

  const randomToken = generateRandomToken();

  await insertVerifyEmailToken({ userId: req.user.id, token: randomToken });

  const verifyEmailLink = await createVerifyLink({
    email: user.email,
    token: randomToken,
  });
  console.log("VERIFY_EMAIL_LINK ➡️ ➡️ ➡️", verifyEmailLink);

  // 1. read MJML file
  const mjmlTemplatePath = path.join(
    import.meta.dirname,
    "..",
    "emails",
    "verify-email.mjml"
  );
  const readMjmlTemplateFile = await fs.readFile(mjmlTemplatePath, "utf-8");

  // 2. to replace the placeholders with the actual values
  const filledTemplate = ejs.render(readMjmlTemplateFile, {
    code: randomToken,
    link: verifyEmailLink,
  });

  // 3. convert MJML to HTML
  const htmlOutput = mjml2html(filledTemplate).html;

  // sendEmail({
  //   to: user.email,
  //   subject: "Verify your email",
  //   html: htmlOutput,
  // }).catch(console.error);

  await sendEmailWithResend({
    to: user.email,
    subject: "Verify your email",
    html: htmlOutput,
  }).catch(console.error);

  res.redirect("/verify-email");
};

// verifyEmailToken
export const verifyEmailToken = async (req, res) => {
  const { data, error } = verifyEmailSchema.safeParse(req.query);

  if (error) return res.send("Email or token invalid!");

  const token = await findVerificationEmailToken(data);
  // 1: token - same
  // 2: time expire
  // 3: userId - email find
  console.log("🚀 ~ verification ~ token:", token);

  if (!token) return res.send("Verification link invalid or expired!");

  await verifyUserEmailAndUpdate(token.email);
  // 1: to find email - `is_email_valid` change value

  clearVerifyEmailTokens(token.userId).catch(console.error);

  return res.redirect("/profile");
};
