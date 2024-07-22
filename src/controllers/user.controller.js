import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
   res.status(200).json({
      message: "it is created parneet singh gill"
   })
})


export {registerUser}