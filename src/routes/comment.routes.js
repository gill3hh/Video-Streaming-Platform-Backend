import { Router } from "express";

import {
   fetchCommentsForVideo, createComment, modifyComment, removeComment
} from "../controllers/comment.controller.js";

import {upload} from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT, upload.none());

router.route("/:videoId").get(fetchCommentsForVideo).post(createComment);
router.route("/:commentId").delete(removeComment).patch(modifyComment);

export default router;