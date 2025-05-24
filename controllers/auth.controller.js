// import { sendEmail } from "../lib/nodemailer.js";
import {
  clearResetPasswordToken,
  clearUserSession,
  clearVerifyEmailTokens,
  createAccessToken,
  createRefreshToken,
  createResetPasswordLink,
  createSession,
  // comparePassword,
  createUser,
  createUserWithOauth,
  createVerifyLink,
  editUserProfile,
  findUserByEmail,
  findUserById,
  findVerificationEmailToken,
  generateRandomToken,
  getAllShortLinks,
  getResetPasswordToken,
  // generateToken,
  getUserByEmail,
  getUserWithOauthId,
  hashPassword,
  insertVerifyEmailToken,
  linkUserWithOauth,
  updateUserPassword,
  verifyPassword,
  verifyUserEmailAndUpdate,
} from "../services/authRegister.service.js";
import {
  editUserSchema,
  forgotPasswordEmailSchema,
  forgotPasswordSchema,
  loginUserSchema,
  registerUserSchema,
  setPasswordSchema,
  verifyEmailSchema,
  verifyPasswordSchema,
} from "../validators/auth-validator.js";

import path from "path";
import fs from "fs/promises";
import ejs from "ejs";
import mjml2html from "mjml";
import { sendEmailWithResend } from "../lib/send_email.js";
import { getHtmlFromMjmlTemplate } from "../lib/get-Html-From-Mjml-Template.js";
import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { google } from "../lib/Oauth/google.js";
import { github } from "../lib/Oauth/github.js";

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

  if (!user.password) {
    req.flash(
      "errors",
      "You have created account using social login. Please login with your social account."
    );
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
      password: Boolean(user.password),
      avatarUrl: user.avatarUrl,
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

// getEditProfilePage
export const getEditProfilePage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).send("User not found");

  return res.render("auth/edit-profile", {
    name: user.name,
    errors: req.flash("errors"),
  });
};

// postEditProfilePage
export const postEditProfile = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { data, error } = editUserSchema.safeParse(req.body);

  if (error) {
    req.flash("errors", error.errors[0].message);
    return res.redirect("/edit-profile");
  }

  const updateData = await editUserProfile({
    id: req.user.id,
    name: data.name,
  });

  if (!updateData) return res.status(404).send("User not found");

  return res.redirect("/profile");
};

// getChangePasswordPage
export const getChangePasswordPage = (req, res) => {
  if (!req.user) return res.redirect("/login");

  return res.render("auth/change-password", {
    errors: req.flash("errors"),
  });
};

// postChangePassword
export const postChangePassword = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { data, error } = verifyPasswordSchema.safeParse(req.body);
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/change-password");
  }

  const { currentPassword, newPassword, confirmPassword } = data;

  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).send("User not found");

  const isPasswordValid = await verifyPassword(user.password, currentPassword);
  if (!isPasswordValid) {
    req.flash("errors", "Current password that you entered is invalid.");
    return res.redirect("/change-password");
  }

  const newHashedPassword = await hashPassword(confirmPassword);

  const updatePassword = await updateUserPassword({
    userId: user.id,
    password: newHashedPassword,
  });

  if (!updatePassword)
    return res.status(500).send("Password update failed. Please try again.");

  return res.redirect("/profile");
};

// getResetPasswordPage
export const getResetPasswordPage = async (req, res) => {
  return res.render("auth/forgot-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
  });
};

// postForgotPassword
export const postForgotPassword = async (req, res) => {
  const { data, error } = forgotPasswordEmailSchema.safeParse(req.body);

  if (error) {
    req.flash("errors", error.errors[0].message);
    return res.redirect("/forgot-password");
  }

  const user = await findUserByEmail(data.email);
  if (!user) return res.status(404).send("User not found");

  const resetPasswordLink = await createResetPasswordLink({ userId: user.id });

  const html = await getHtmlFromMjmlTemplate("forgot-password-email", {
    name: user.name,
    link: resetPasswordLink,
  });

  sendEmailWithResend({ to: user.email, subject: "Reset Your Password", html });

  req.flash("formSubmitted", true);
  res.redirect("/forgot-password");
};

// getForgotPasswordTokenPage
export const getForgotPasswordTokenPage = async (req, res) => {
  const { token } = req.params;
  const [passwordResetData] = await getResetPasswordToken(token);

  if (!passwordResetData) return res.render("auth/wrong-reset-password-token");

  return res.render("auth/set-forgot-password", {
    formSubmitted: req.flash("formSubmitted")[0],
    errors: req.flash("errors"),
    token,
  });
};

// postResetPasswordToken
export const postResetPasswordToken = async (req, res) => {
  const { token } = req.params;
  const [passwordResetData] = await getResetPasswordToken(token);

  if (!passwordResetData) {
    req.flash("errors", "Password Token is not matching");
    return res.render("auth/wrong-reset-password-token");
  }

  const { data, error } = forgotPasswordSchema.safeParse(req.body);
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect(`/forgot-password/${token}`);
  }

  const { confirmPassword } = data;

  const user = await findUserById(passwordResetData.userId);
  if (!user) return res.status(404).send("User not found");

  await clearResetPasswordToken();

  const hashedPassword = await hashPassword(confirmPassword);
  await updateUserPassword({ userId: user.id, password: hashedPassword });

  return res.redirect("/login");
};

// getGoogleLoginPage
export const getGoogleLoginPage = async (req, res) => {
  if (req.user) return res.redirect("/");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid", //this os called scopes, here we are giving openid, and profile
    "profile", //openid gives tokens if needed, and profile gives user information
    // we are telling people google about the information that we require from user.
    "email",
  ]);

  const cookieConfig = {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 10 * 1000,
    sameSite: "lax", // this is such that when google redirects to our website, cookies are maintained
  };

  res.cookie("google_oauth_state", state, cookieConfig);
  res.cookie("google_code_verifier", codeVerifier, cookieConfig);

  res.redirect(url.toString());
};

// getGoogleLoginCallback
export const getGoogleLoginCallback = async (req, res) => {
  // google redirect with code, and state in query params
  // we will use code to find out the user.

  const { code, state } = req.query;
  // console.log({ code, state });

  const {
    google_oauth_state: storedState,
    google_code_verifier: codeVerifier,
  } = req.cookies;
  // console.log({ storedState, codeVerifier });

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    state !== storedState
  ) {
    req.flash(
      "errors",
      "Couldn't login with Google because of invalid login attempt Please try again!"
    );

    return res.redirect("/login");
  }

  let token;
  try {
    token = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    req.flash(
      "errors",
      "Couldn't login with Google because of invalid login attempt Please try again!"
    );
    return res.redirect("/login");
  }

  const claims = decodeIdToken(token.idToken());
  const { sub: googleUserId, name, email, picture } = claims;

  let user = await getUserWithOauthId({
    provider: "google",
    email,
    avatarUrl: picture,
  });

  // if user exists but user is not linked with oauth
  if (user && user.oauth_accounts.length === 0) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "google",
      providerAccountId: googleUserId,
      avatarUrl: picture,
    });
  }

  // if user doesn't exist
  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "google",
      providerAccountId: googleUserId,
      avatarUrl: picture,
    });
  }

  // create session
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    isEmailValid: user.isEmailValid,
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

// getGithubLoginPage
export const getGithubLoginPage = async (req, res) => {
  if (req.user) return res.redirect("/");

  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);

  const cookieConfig = {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 10 * 1000,
    sameSite: "lax", // this is such that when google redirects to our website, cookies are maintained
  };

  res.cookie("github_oauth_state", state, cookieConfig);

  res.redirect(url.toString());
};

// getGithubLoginCallback
export const getGithubLoginCallback = async (req, res) => {
  const { code, state } = req.query;
  const { github_oauth_state: storedState } = req.cookies;

  const handleFailedLogin = () => {
    req.flash(
      "errors",
      "Couldn't login with GitHub because of invalid login attempt. Please try again!"
    );
    return res.redirect("/login");
  };

  if (!code || !state || !storedState || state !== storedState) {
    return handleFailedLogin();
  }

  let tokens;
  try {
    tokens = await github.validateAuthorizationCode(code);
  } catch (error) {
    return handleFailedLogin();
  }

  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });

  if (!githubUserResponse.ok) return handleFailedLogin();
  const githubUser = await githubUserResponse.json();
  const { id: githubUserId, name, avatar_url } = githubUser;

  const githubEmailResponse = await fetch(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    }
  );
  if (!githubEmailResponse.ok) return handleFailedLogin();
  const emails = await githubEmailResponse.json();
  const email = emails.filter((e) => e.primary)[0].email;

  if (!email) return handleFailedLogin();

  let user = await getUserWithOauthId({
    provider: "github",
    email,
    avatarUrl: avatar_url,
  });

  if (user && user.oauth_accounts.length === 0) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "github",
      providerAccountId: githubUserId.toString(),
      avatarUrl: avatar_url,
    });
  }

  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "github",
      providerAccountId: githubUserId.toString(),
      avatarUrl: avatar_url,
    });
  }

  // create session
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    isEmailValid: user.isEmailValid,
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

// getSetPasswordPage
export const getSetPasswordPage = async (req, res) => {
  if (!req.user) return res.redirect("/");

  return res.render("auth/set-password", { errors: req.flash("errors") });
};

// postSetPassword
export const postSetPassword = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { data, error } = setPasswordSchema.safeParse(req.body);

  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/set-password");
  }

  const { confirmPassword } = data;

  const user = await findUserByEmail(req.user.email);
  if (user.password) {
    req.flash(
      "errors",
      "You already have your password, Instead Change your password"
    );
    return res.redirect("/set-password");
  }

  const password = await hashPassword(confirmPassword);

  await updateUserPassword({
    userId: user.id,
    password,
  });

  return res.redirect("/profile");
};
