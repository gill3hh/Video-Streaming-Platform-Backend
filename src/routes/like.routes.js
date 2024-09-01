import { Router } from "express";
import {
   switchVideoLike, switchCommentLike, switchTweetLike, fetchLikedVideos
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); 

router.route("/switch/v/:videoId").post(switchVideoLike);
router.route("/switch/c/:commentId").post(switchCommentLike);
router.route("/switch/t/:tweetId").post(switchTweetLike);
router.route("/videos").get(fetchLikedVideos);

export default router;