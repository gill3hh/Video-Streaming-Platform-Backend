import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const UserSchema = new Schema({
   username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
   },
   email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
   },
   fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
   },
   avatar: {
      type: String,  // cloudinary url
      required: true
   },
   coverImage: {
      type: String,  // cloudinary url
   },

   watchHistory: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Video"
      }
   ],
   password: {
      type: String,
      required: [true, 'Password is required']
   },

   refreshToken: {
      type: String
   }

}, {timestamps: true})


UserSchema.pre("save", async function(next){
   if(!this.isModified("password")) return next(); // here what we did is we dont want to always encrypt the password when we are 
   // saving other fields because everytime user update lets say add new avatar and it has nothing to do with password and in this 
   // case we dont want to encrypt our pass. so this condition if it is not changed directly return nect otherwise first 
   // encrypt and then run next()

   this.password = await bcrypt.hash(this.password, 10) // this number is just number of rounds dont worry about too much, give any u like.
   next()

})  // these are known as pre hooks, for more info go to mongoose documentation and then middleware,, what it will do
// is we cant directly encrypt passwords. so this pre hook just before adding data or any other operations makes the password encrypted
// here we dont use arrow function as call back function because in arrow function we cant use this and in this we need to use this
// keyword so that it knows which user is coming from userSchema and also here alot of algorithms works to encrypt the pass etc.
// so thats why we always use async function. so that it doesnt block our code.

// as this works as a middleware and we know that for a middleware we use next so that it knows now the flag has to move to next.


UserSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password)
}


UserSchema.methods.generateAccesstoken = function(){
   return jwt.sign({
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
   },
   process.env.ACCESS_TOKEN_SECRET,
   {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
   }
)
}


UserSchema.methods.generateRefreshtoken = function(){
   return jwt.sign({
      _id: this._id,
      
   },
   process.env.REFRESH_TOKEN_SECRET,
   {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
   }
)
}

export const User = mongoose.model("User", UserSchema)