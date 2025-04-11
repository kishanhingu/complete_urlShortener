// import router
import { Router } from "express";
import {
  postURLShortener,
  getShortenerPage,
  redirectToShortLink,
  getShortenerEditPage,
  postShortenerEditPage,
  deleteShortLink,
} from "../controllers/postshortener.controller.js";
const router = Router();

// EXPRESS.JS
router.get("/", getShortenerPage);

router.post("/", postURLShortener);

// Redirect to click link
router.get("/:shortCode", redirectToShortLink);

router.route("/edit/:id").get(getShortenerEditPage).post(postShortenerEditPage);

router.route("/delete/:id").post(deleteShortLink);
//! export default
// export default router;

//! Named export
export const shortenerRoutes = router;
