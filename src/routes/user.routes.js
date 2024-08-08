import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";

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

export default router