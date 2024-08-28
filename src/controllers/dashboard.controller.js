import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const user = req.user

    if(!user){
      throw new ApiError(400, "This user doesnt exist, User is not logged In")
    }

    const videos = await Video.aggregate([
      {
         $match: {
            owner: new mongoose.Types.ObjectId(user._id)
         }
      },
      {
         $lookup: {
            from: Like,
            localfield: video,
            foreignfield: _id
         }
      }

    ])


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }