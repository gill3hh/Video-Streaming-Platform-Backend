import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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
    console.log("email: ", email);

   // now we can check for all feilds with if else and make 5-6 conditions ,, i will also add advance code that sir told to 
   // see how we can do it with one line of code. so i will comment this if code and we will keep only advance code.
   //  if(fullname === ""){
   //    throw new ApiError(400, "fullname is required")
   //  } 

   // advance condition check

   if(
      [fullname, email, username, password].some((field)=> field?.trim() === "")
   ){
      throw new ApiError(400, "All fields are required")
   }

   const existedUser = User.findOne({
      $or: [{ username }, { email }] // this way we will find first username or email which is already in database and we use 
      // $or so that we check upon email and username both at a same time, so with $ sign we can use multiple operators.
   })

   if(existedUser){
      throw new ApiError(409, "User with email or username already exists")
   }


   const avatarLocalPath = req.files?.avatar[0]?.path; // we get req.body with express similarly we get req.files with multer and like this we can access all
   // the files such as here we are talking about images. (video 13 logic building : 31:05)

   const coverImageLocalPath = req.files?.coverImage[0]?.path; // we are using ? which is optional which means if this exists then 
   // give me ortherwise dont give. we also have this in our notes

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





   res.status(200).json({
      message: "it is created parneet singh gill"
   })
})


export {registerUser}



