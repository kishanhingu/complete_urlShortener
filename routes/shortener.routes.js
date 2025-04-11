// import router
import { Router } from "express";
import {
  postURLShortener,
  getShortenerPage,
  redirectToShortLink,
  getShortenerEditPage,
} from "../controllers/postshortener.controller.js";
const router = Router();

// EXPRESS.JS
router.get("/", getShortenerPage);

router.post("/", postURLShortener);

// Redirect to click link
router.get("/:shortCode", redirectToShortLink);

router.route("/edit/:id").get(getShortenerEditPage);
//! export default
// export default router;

//! Named export
export const shortenerRoutes = router;
