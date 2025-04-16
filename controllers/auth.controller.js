import {
  clearUserSession,
  createAccessToken,
  createRefreshToken,
  createSession,
  // comparePassword,
  createUser,
  // generateToken,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "../services/authRegister.service.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validators/auth-validator.js";

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
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
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
