import { Router } from "express";
import {
   switchSubscription, fetchChannelSubscribers, fetchSubscribedChannels
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); 

router
    .route("/c/:channelId")
    .get(fetchChannelSubscribers)
    .post(switchSubscription);

router.route("/u/:subscriberId").get(fetchSubscribedChannels);

export default router;