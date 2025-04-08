import crypto from "crypto";
import {
  getData,
  getLinkByShortCode,
  saveData,
} from "../services/shortener.service.js";
// import { URL } from "../schema/url_schema.js";

//! With MONGODB & MySQL
// import {
//   getData,
//   getLinkByShortCode,
//   saveData,
// } from "../models/shortener.model.js";

//! Prisma with MySQL

export const getShortenerPage = async (req, res) => {
  try {
    // const htmlFile = await readFile(path.join("views", "index.html"));
    //! With MONGODB
    // const links = await getData();
    //! With MONGOOSE
    // const links = await URL.find();

    //! With MySQL
    // const links = await getData();

    //! Prisma Using MySQL
    const links = await getData();

    // let isLoggedIn = req.headers.cookie;
    // isLoggedIn = Boolean(
    //   isLoggedIn?.split("=")?.find((cookie) => cookie.trim().startsWith("true"))
    // );

    // let access_token = req.cookies.access_token;
    // console.log("🥸 IsLoggedIn:-", access_token);
    // return res.render("index", { links, host: req.host, access_token });

    // if (!req.user)
    //   return res.send(
    //     `<h1>You are not logged in 😛😛😛😛😛😛</h1><a href="/login"><button>Go Login</button></a>`
    //   );

    return res.render("index", { links, host: req.host });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const postURLShortener = async (req, res) => {
  try {
    const { url, shortCode } = req.body;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    //! With MONGODB
    // const getLinks = await getData();
    //! With MONGOOSE
    // const getLinks = await URL.find();

    //! With MySQL
    // const getLinks = await getData();
    // const existData = getLinks.some((data) => data.shortCode === shortCode);

    //! Prisma Using MySQL
    const getLinks = await getData();
    const existData = getLinks.some((data) => data.shortCode === shortCode);

    // if (getLinks[finalShortCode]) {
    if (existData) {
      return res
        .status(400)
        .send("Short Code already exists. Please choose another.");
    } else {
      // getLinks[finalShortCode] = url;
      // await saveData(getLinks);
      //! With MONGODB
      // await saveData({ url, shortCode });
      //! With MONGOOSE
      // await URL.create({ url, shortCode });
      //! With MySQL
      // await saveData({ url, shortCode });
      //! Prisma Using MySQL
      await saveData({ url, shortCode });
    }

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

// Redirect to click link
export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    // console.log(shortCode);

    // const link = await getData();

    // if (!link[shortCode]) {
    //   return res.status(404).send("404 error occurred");
    // } else {
    //   return res.redirect(link[shortCode]);
    // }

    //! With MONGODB
    // const link = await getLinkByShortCode(shortCode);
    //! With MONGOOSE
    // const link = await URL.findOne({ shortCode: shortCode });
    //! With MySQL
    // const link = await getLinkByShortCode(shortCode);
    //! Prisma Using MySQL
    const link = await getLinkByShortCode(shortCode);

    if (!link) {
      return res.status(404).send("404 error occurred");
    } else {
      return res.redirect(link.url);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
