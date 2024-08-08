import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


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
         $set: {refreshToken: undefined}
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


export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken
}



