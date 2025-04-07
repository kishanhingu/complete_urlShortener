import express from "express";
import { shortenerRoutes } from "./routes/shortener.routes.js";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
// import { connectDB } from "./config/db-client.js";
import { verifyAuthentication } from "./middlewares/verify-auth-middleware.js";
const app = express();

const PORT = env.PORT || 3000;

// Serve Static file
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// .ejs file ne show karava mate
app.set("view engine", "ejs");

// Cookie-parser
app.use(cookieParser());

// verify middleware
app.use(verifyAuthentication);

// aa khali .ejs file, pug, handlebars page direct user access kari sakay chhe.
app.use((req, res, next) => {
  res.locals.user = req.user;
  return next();
});

// auth router
app.use(authRoutes);
// router
app.use(shortenerRoutes);

try {
  // connectDB function
  // await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
} catch (error) {
  console.error(error);
}
