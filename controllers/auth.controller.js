import {
  // comparePassword,
  createUser,
  generateToken,
  getUserByEmail,
  hashPassword,
  verifyPassword,
} from "../services/authRegister.service.js";

// REGISTER PAGE
export const getRegisterPage = (req, res) => {
  return res.render("auth/register");
};

export const postRegister = async (req, res) => {
  const { name, email, password, signup } = req.body;

  const userExists = await getUserByEmail(email);

  if (userExists) {
    return res.redirect("/register");
  } else {
    // using bcrypt
    // const hashedPassword = await hashPassword(password);
    // using argon2
    const hashedPassword = await hashPassword(password);
    const user = await createUser({ name, email, hashedPassword });

    if (user) return res.redirect("/");
  }
};

// LOGIN PAGE
export const getLoginPage = (req, res) => {
  return res.render("auth/login");
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  // Using Bcrypt
  // bcrypt.compare(plainTextPassword, hashedPassword)
  // const isPasswordValid = await comparePassword(password, user.password);
  // Using argon2
  const isPasswordVerify = await verifyPassword(user.password, password);
  if (!user) {
    return res.redirect("/login");
    // } else if (user.password !== password) {
  } else if (!isPasswordVerify) {
    return res.redirect("/login");
  } else {
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    // res.setHeader("Set-Cookie", "isLoggedIn=true; path=/;");
    // res.cookie("isLoggedIn", true);
    res.cookie("access_token", token);
    res.redirect("/");
  }
};

// getMe protected route
export const getMe = (req, res) => {
  if (!req.user) return res.send(`<h1>You are not logged in 😛😛😛😛😛😛</h1>`);
  return res.send(`<h1>Hello ➡️ ${req.user.name} ➡️➡️ ${req.user.email}</h1>`);
};
