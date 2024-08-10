import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const registerUser = asyncHandler(async (req, res) => {
   

   // get user details from frontend
   // validation - not empty 
   // check if user already exists : username, email
   // check for images, check for avatar
   // upload them to cloudinary, avatar 
   // create user object - create entry in db
   // remove password and refresh token field from response 
   // check for user creation 
   // return res 

   // take user details from frontend 

    const {fullname, email, username, password} = req.body
    // console.log("email: ", email);

   // now we can check for all feilds with if else and make 5-6 conditions ,, i will also add advance code that sir told to 
   // see how we can do it with one line of code. so i will comment this if code and we will keep only advance code.
   //  if(fullname === ""){
   //    throw new ApiError(400, "fullname is required")
   //  } 

   // advance condition check

   if(
      [fullname, email, username, password].some((field) => field?.trim() === "")
   ){
      throw new ApiError(400, "All fields are required")
   }

   const existedUser = await User.findOne({
      $or: [{ username }, { email }] // this way we will find first username or email which is already in database and we use 
      // $or so that we check upon email and username both at a same time, so with $ sign we can use multiple operators.
   })

   // console.log(req.files); // images are send as files and when we print it, we get an array of objects, which contains all the 
   // fields of in our case avatar and coverImage ( postman video : 17:19 (timestamp))

   if(existedUser){
      throw new ApiError(409, "User with email or username already exists")
   }


   const avatarLocalPath = req.files?.avatar[0]?.path; // we get req.body with express similarly we get req.files with multer and like this we can access all
   // the files such as here we are talking about images. (video 13 logic building : 31:05)

   // const coverImageLocalPath = req.files?.coverImage[0]?.path; // we are using ? which is optional which means if this exists then 
   // give me ortherwise dont give. we also have this in our notes

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path
   }

   if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar) {
      throw new ApiError(400, "Avatar file is required")
   }

   const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "", // same as we didnt make coverImage mandatory so here we again use optional ?, so if it 
      // exists then give me url otherise empty string
      email,
      password,
      username: username.toLowerCase()

   })

   const createdUser =   await User.findById(user._id).select(
      "-password -refreshToken" // this is the syntax of select method it is weird though, in this everything is default selected
      // so we use - sign to tell which we dont want and it is passed through string and between fields we use space as shown 
      // above. so we want all except password and refreshToken. 
   )

   if(!createdUser) {
      throw new ApiError(500, "something went wrong while registering the user")
   }


   return res.status(201).json(
      new ApiResponse(200, createdUser, "user registered Successfully")
   )

   // res.status(200).json({
   //    message: "it is created parneet singh gill"
   // })

})

// so we created a function to generate access and refresh token, so that we dont have to write again and again and can 
// use directly from here. 
// we made this function to use in login function. 
// to better understand (video number 16 in playlist and number 15 on poster, timestamp : 23:30 )
const generateAccessAndRefreshTokens = async (userId) => {
   try {
      // here we access the user by userId, and it will access the user we created and then created access and refresh token
      const user = await User.findById(userId)
      const accessToken = user.generateAccesstoken()
      const refreshToken = user.generateRefreshtoken()

      // here we save the generated refresh token into our user object and then save it. we get the save method through moongose
      // bcoz our user is saved in moongose, so we get save method. 
      user.refreshToken = refreshToken
      await user.save({validdateBeforeSave: false}) // i made it validate false because as we set we need password aswell and 
      // by now we dont have that, so i make it not validate and just save refresh and access token in the database.

      return {accessToken, refreshToken}

   } catch (error) {
      throw new ApiError(500, "something went wrong while generating refresh and access Token")
   }
}

const loginUser = asyncHandler(async (req, res) => {
   // req body -> data
   // username or email
   // find the user
   // password check
   // access and refresh token 
   // send cookies
   

   const {email, username, password} = req.body

   if(!username && !email){
      throw new ApiError(400, "username or email is required")
   }
   // alternative way of above code if we need only one either username or email then
   // if(!(username || email)){
   // throw new ApiError(400, "username or email is required")}

   const user = await User.findOne({
      $or: [{username}, {email}]
   })

   if(!user){
      throw new ApiError(404, "User does not exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401, "Invalid User Credentials")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
   const loggedinUser = await User.findById(user._id).select("-password -refreshToken")


   const options = {
      httpOnly: true,
      secure: true
   }

   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200, 
         {
         user: loggedinUser, accessToken, refreshToken
         },
         "User logged in Successfully"
      )
   )




}) 

const logoutUser = asyncHandler(async (req, res)=> {
   // now here we want the user and then access its refresh token and earse it. 
   // so here we will use method findbyidand update instead of findbyid, we can also use that but then as we have seen above
   // we will have to include 2-3 more steps.
   // here we will have it and in it we will access user by req.user._id as if you know that in our auth middleware we stored our 
   // user and here we will get the id of that user and then we pass a objects in which we will what things to update.
   // here we will erase refreshtoken by doing it undefined and also setting a new to true. 
   // 
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset: {refreshToken: 1}   // this removes the field from document
      },
      {
         new: true 
      }
   )

   // now how to clear it from cookies (video 16, on poster 15, timestamp: 59:16)
   const options = {
      httpOnly: true,
      secure: true
   }

   return res.status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse (200, {}, "User logged out"))


})


const refreshAccessToken = asyncHandler(async(req, res) => {
   // here we are fetching the value of refresh token from the cookies because we will cross check that the person signed it and
   // its refresh token value matches to the value of refresh token to the one stored in the database, if it matches we will 
   // re login the person and refresh the token. 
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(401, "Unautorized request")
   }
   // here we will decode the token as we want the raw token which is stored in the database so to do so we need to send our
   // refresh token secret and then it will give us decoded value of the token becuase otherwise the user sees the 
   // encrypted value and we store the raw value in the database and here we need that raw value to check. 
   // method of jwt. 

   try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   
      // when we created a token in user.models, we gave _id to when creating the token, so when we get the token from cookies
      // we get the _id and with the help of this we can access the user. so that in i am doing in next line.
   
      const user = await User.findById(decodedToken?._id)
   
      if(!user){
         throw new ApiError(401, "Invalid refresh Token")
      }
      // here we will verify that the value from the cookie and the value from the database is the same
      if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "Refresh token is expired or used")
      }
   
      const options = {
         httpOnly: true,
         secure: true
      }
   
      const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
   
      return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
         new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
         )
      )
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh Token")
      
   }



   
})

const changeCurrentPassword = asyncHandler(async(req, res)=> {
   // here we wrote if we want to change the our password. so first we take inputs from req.body and then check whether the 
   // oldpassword given by the logged user is correct, if it is correct then we let the user to store new password and then save it
   // then we return res
   const {oldPassword, newPassword} = req.body

   // here we can do req.user because the user is already logged in and we can directly find the id.  

   const user = await User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
   if(!isPasswordCorrect){
      throw new ApiError(400, "Invalid old password")
   }

   user.password = newPassword
   await user.save({validdateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200,{}, "Password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req,res) => {
   // here we will return the current user and we have already stored our current user in req.user in our middleware auth. 
   return res.status(200)
   .json(200, req.user, "Current User fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
   const {fullname, email} = req.body

   if(!fullname || !email){
      throw new ApiError(400, "All fields are required")
   }

   const user  = User.findByIdAndUpdate(
      req.user?._id,
   {
      $set: {
         fullname: fullname,
         email: email
      }
   },
   {new: true}).select("-password")

   return res.status(200)
   .json(new ApiResponse(200, user, "Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req,res)=> {
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
      throw new ApiError(400, "Error while uploading on avatar")
   }

   const user  = await User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      {new : true}
   ).select("-password")

   return res.status(200)
   .json(new ApiResponse(200, user, "Avatar is updated successfully"))

})


const updateUserCoverImage = asyncHandler(async(req,res)=> {
   // first i will get the path of the file which i am trying to upload then after i get the path, i will upload it on 
   // cloudinary and cloudinary will return me url, then i will update that url in my database.
   const coverImageLocalPath = req.file?.path

   if(!coverImageLocalPath){
      throw new ApiError(400, "Cover Image file is missing")
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage.url){
      throw new ApiError(400, "Error while uploading on cover Image")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      {new : true}
   ).select("-password")

   return res.status(200)
   .json(new ApiResponse(200, user, "Cover Image is updated successfully"))

})

const getUserChannelProfile = asyncHandler(async(req,res)=> {
   const {username} = req.params

   if(!username?.trim()){
      throw new ApiError(400, "username is missing")
   }

   // User.find({username})
   // we gonna do in advance way directly but we can do as in above line first find username then get the id and then query.


   // first we get the username above from params and now in aggragtion pipeline we used match to find that user through the
   // username. so we will get that one user who has the above mentioned username and then we will find the subscribers for 
   // this username
   const channel = await User.aggregate([
      // here we will match that username and if it exists we get the username
      {
         $match: {
            username: username?.toLowerCase()
         }
      },
      {
         // through this pipeline we will get all the subscribers 
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            // this is we talked about in the diagram and i draw it in ipad.
            foreignField: "channel",
            as: "subscribers"
         }

      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            // this will give to whom i have subscriber here i is the user
            foreignField: "subscriber",
            as: "subscribedTo"
         }
      },
      {
         // now we will count, so in first field we are the count of my subscribers 
         // first we will use the field add fields function and in that we will use size function which gives the total
         // count of the documents.
         $addFields: {
            subscribersCount: {
               $size: "$subscribers"
            },
            // here i am getting a count of users i have subscribed to.
            channelsSubscribedToCount: {
               $size: "$subscribedTo"
            },
            // this takes care of the button that when we go to you tube and we see that if we have already subscribed then shows
            // subscribed otherwise subscribe. so we will send a true or false to frontend guy and then he will decide what to 
            // show on page.
            isSubscribed: {
               $cond: {
                  if: {$in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false
               }
            } 
         }
      },
      {
         // we use project to show which fields we want to show and then select the fields. only select the fields needed
         // we dont want to increase the traffic on the network
         $project: {
            fullname: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1

            
         }
      }
   ])

   if(!channel?.length){
      throw new ApiError(404, "Channel does not exists")
   }

   return res.status(200)
   .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))

}) 

const getWatchHistory = asyncHandler(async(req, res)=> {
   const user = await User.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
         $lookup: {
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            // to make it nested we can use pipeline and in that we can again use lookup it will create it nested
            pipeline: [
               {
                  $lookup: {
                     from: "users",
                     localField: "owner",
                     foreignField: "_id",
                     as: "owner",
                     // again sub pipeline as i dont want all the fields of the user so it will only project these 3 fields of the 
                     // user.
                     pipeline: [
                        {
                           $project: {
                              fullname: 1,
                              username: 1,
                              avatar: 1
                           }
                        }]
                  }

               },
               {
                  $addFields: {
                     // this way we will get the first value as we know that we will get a array as return for owner.
                     owner: {
                        $first: "$owner"
                     }
                  }
               }
            ]

         
         }
      }
   ])

   return res.status(200)
   .json(new ApiResponse(
      200, 
      user[0].watchHistory, 
      "watch history fetched successfully" ))

})



export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getWatchHistory
}



