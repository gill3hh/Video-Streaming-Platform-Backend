import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
   uploadVideo,updateVideoDetails,removeVideo,fetchAllVideos,fetchVideoById,toggleVideoPublishStatus,
} from "../controllers/video.controller.js";

const router = Router();

// router.use(verifyJWT); 

router
    .route("/")
    .get(fetchAllVideos)
    .post(
        verifyJWT,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        uploadVideo
    );

router
    .route("/v/:videoId")
    .get(verifyJWT, fetchVideoById)
    .delete(verifyJWT, removeVideo)
    .patch(verifyJWT, upload.single("thumbnail"), updateVideoDetails);

router.route("/toggle/publish/:videoId").patch(verifyJWT, toggleVideoPublishStatus);

export default router;