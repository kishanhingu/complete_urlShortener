import {
  refreshTokens,
  verifyJWTToken,
} from "../services/authRegister.service.js";

// export const verifyAuthentication = (req, res, next) => {
//   const token = req.cookies.access_token;

//   if (!token) {
//     req.user = null;
//     // console.log(`req.user1:-`, req.user);
//     return next();
//   }

//   try {
//     const decodedToken = verifyJWTToken(token);
//     req.user = decodedToken;
//     // console.log(`req.user2:-`, req.user);
//   } catch (error) {
//     req.user = null;
//   }

//   return next();
// };

//? HYBRID AUTHENTICATION
export const verifyAuthentication = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  req.user = null;

  if (!accessToken && !refreshToken) {
    return next();
  }

  if (accessToken) {
    const decodedToken = verifyJWTToken(accessToken);
    req.user = decodedToken;
    return next();
  }

  if (refreshToken) {
    try {
      const { newAccessToken, newRefreshToken } = await refreshTokens(
        refreshToken
      );

      const decodedToken = verifyJWTToken(newAccessToken);
      if (!decodedToken) throw new Error("Invalid user");
      req.user = decodedToken;

      const baseConfig = { httpOnly: true, secure: true };

      res.cookie("access_token", newAccessToken, {
        ...baseConfig,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refresh_token", newRefreshToken, {
        ...baseConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return next();
    } catch (error) {
      console.log(error);
    }
  }
  return next();
};
