import express from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controlers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Import the middleware

const router = express.Router();

router.route("/register").post(
     upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
     ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser); // Also fixed to call logoutUser instead of loginUser
router.route("/refresh-token").post(refreshAccessToken);
export default router;