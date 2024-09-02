// we are creating our own middleware this is for the cookies and jwt, 

import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";



export const verifyJWT = asyncHandler(async(req, _  /* sometimes when we dont use res, we can write in this way */ , next) => {
   // here we say either get the token from the cookies or from the header, we can go to postman and see their is a header 
   // in which we get authorization. to understand more we can go through JWT documentation. 

   try {
      // here if we get it from the header we will remove bearer and space and we will be left with the token. 
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
   
      if(!token){
         throw new ApiError(401, "Unauthorized request")
      }
      // we decode our token and jwt gives us a method verify to directly verify our token if only we have the write token it will 
      // also us to logout. this is checked through the token secret key, if it matches then we have right thing and it gives us access.
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
   
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
   
      if(!user){
           
         throw new ApiError(401, "Invalid access Token")
      }
   
      req.user = user;
      next()


   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access Token")
      
   }

   
})