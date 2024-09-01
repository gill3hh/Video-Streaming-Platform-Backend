import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
   createNewTweet, editTweet, removeTweet, fetchUserTweets
} from "../controllers/tweet.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT, upload.none()); 

router.route("/").post(createNewTweet);
router.route("/user/:userId").get(fetchUserTweets);
router.route("/:tweetId").patch(editTweet).delete(removeTweet);

export default router;