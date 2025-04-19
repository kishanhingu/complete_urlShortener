// import crypto from "crypto";
import {
  deleteShortCode,
  findShortLinkById,
  getData,
  getLinkByShortCode,
  saveData,
  updateShortCode,
} from "../services/shortener.service.js";
import { shortenerSchema } from "../validators/shortener-validator.js";
// import { URL } from "../schema/url_schema.js";
import z from "zod";

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

    if (!req.user) return res.redirect("/login");

    const links = await getData(req.user.id);

    // let isLoggedIn = req.headers.cookie;
    // isLoggedIn = Boolean(
    //   isLoggedIn?.split("=")?.find((cookie) => cookie.trim().startsWith("true"))
    // );

    // let access_token = req.cookies.access_token;
    // console.log("🥸 IsLoggedIn:-", access_token);
    // return res.render("index", { links, host: req.host, access_token });

    return res.render("index", {
      links,
      host: req.host,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const postURLShortener = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  try {
    // const { url, shortCode } = req.body;
    // const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
    const { data, error } = shortenerSchema.safeParse(req.body);

    if (error) {
      req.flash("errors", error.errors[0].message);
      return res.redirect("/");
    }

    const { url, shortCode } = data;

    //! With MONGODB
    // const getLinks = await getData();
    //! With MONGOOSE
    // const getLinks = await URL.find();

    //! With MySQL
    // const getLinks = await getData();
    // const existData = getLinks.some((data) => data.shortCode === shortCode);

    //! Prisma Using MySQL
    const getLinks = await getData(req.user.id);
    const existData = getLinks.some((data) => data.shortCode === shortCode);

    // if (getLinks[finalShortCode]) {
    if (existData) {
      return req.flash(
        "errors",
        "Short Code already exists. Please choose another."
      );
    }
    // getLinks[finalShortCode] = url;
    // await saveData(getLinks);
    //! With MONGODB
    // await saveData({ url, shortCode });
    //! With MONGOOSE
    // await URL.create({ url, shortCode });
    //! With MySQL
    // await saveData({ url, shortCode });
    //! Prisma Using MySQL
    await saveData({ url, shortCode, userId: req.user.id });

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
    }

    return res.redirect(link.url);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

//????? getShortenerEditPage ?????//
export const getShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  // const id = req.params;
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  if (error) return res.status(404).send("404 error occurred");

  try {
    const shortLink = await findShortLinkById(id);
    if (!shortLink) return res.redirect("/");

    res.render("edit-shortLink", {
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.shortCode,
      errors: req.flash("errors"),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
};

//????? postShortenerEditPage ?????//

export const postShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) return res.status(404).send("404 error occurred");

  const { data, error: err } = shortenerSchema.safeParse(req.body);
  if (err) {
    req.flash("errors", err.errors[0].message);
    return res.redirect(`/edit/${id}`);
  }
  const { url, shortCode } = data;

  try {
    const newUpdatedShortCode = await updateShortCode({ id, url, shortCode });
    if (!newUpdatedShortCode) return res.send("404");

    res.redirect("/");
  } catch (err) {
    if (err.code === "P2002") {
      req.flash("errors", "Shortcode already exists, please choose another");
      res.redirect(`/edit/${id}`);
    }
    console.log(err);
    return res.status(500).send("Internal server error");
  }
};

//????? deleteShortLink ?????//
export const deleteShortLink = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  if (error) {
    req.flash("errors", "ShortLink is not delete");
    res.redirect("/");
  }

  try {
    const deletedShortCode = await deleteShortCode(id);
    console.log("deletedShortCode", deletedShortCode);

    if (!deleteShortLink) {
      req.flash("errors", "ShortLink is not delete");
      return res.redirect("/");
    }

    res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
