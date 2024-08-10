import { Router } from "express";
import { 
   loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, 
   getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, 
   getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js"

import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1
      }, 
      {
         name: "coverImage",
         maxCount: 1
      }

   ]),
   registerUser)
// router.route("/login").post(login)

router.route("/login").post(loginUser)

// secured routes

//here we injected our middleware verifyJWT, that is why we use next() at the end of middleware, you can see in verifyJWT middleware
// file, what it means that now my work is done and you can move to next one. here in our case next is logoutuser. so this 
// is the purpose of next. otherwise if we wont use next then how come post will know which method to run first and what 
// after it.
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)

// we use get because we are here not storing anything or adding anything to the database, so we can use GET.
router.route("/current-user").get(verifyJWT, getCurrentUser)

// we will use patch because we are only making some change in our user and not chaning entire user details so it is very important
// to use patch as it will only affect portion of the resource.
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("/coverImage"), updateUserCoverImage)

// we will write in this way route for getting user channel because we are getting it from params and this is the syntax to get 
// it from params
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router