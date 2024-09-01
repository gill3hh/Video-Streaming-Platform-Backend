import { Router } from 'express';
import {
   fetchChannelStatistics, fetchChannelVideos
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); 

router.route("/stats").get(fetchChannelStatistics);
router.route("/videos").get(fetchChannelVideos);

export default router