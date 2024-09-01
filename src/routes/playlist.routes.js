import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
   createNewPlaylist,
   modifyPlaylist,
   removePlaylist,
   appendVideoToPlaylist,
   removeVideoFromPlaylist,
   fetchPlaylistById,
   fetchUserPlaylists,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT, upload.none()); 


router.route("/").post(createNewPlaylist);

router
    .route("/:playlistId")
    .get(fetchPlaylistById)
    .patch(modifyPlaylist)
    .delete(removePlaylist);

router.route("/add/:videoId/:playlistId").patch(appendVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(fetchUserPlaylists);

export default router;