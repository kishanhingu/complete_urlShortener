import { verifyJWTToken } from "../services/authRegister.service.js";

export const verifyAuthentication = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    req.user = null;
    // console.log(`req.user1:-`, req.user);
    return next();
  }

  try {
    const decodedToken = verifyJWTToken(token);
    req.user = decodedToken;
    // console.log(`req.user2:-`, req.user);
  } catch (error) {
    req.user = null;
  }

  return next();
};
