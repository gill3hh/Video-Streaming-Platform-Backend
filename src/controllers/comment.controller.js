import mongoose from "mongoose";
import {Comment} from "../models/comment.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asynchandler} from "../utils/asyncHandler.js";

import {User} from "../models/user.models.js"

const getVideoComments = asynchandler(async(req,res)=> {
   const {video} = req.params;
   if(!video){
      throw new ApiError(401, "video doesnt exist")
   }

   // first i need to find the current video id
   // then i will search for current video id in all the comments when i get all the comments
   // i will retrive the comments and the owner of the comment




   

   const comment = await Comment.aggregate([
      {
         $match: {
            video: req.params._id
         }
      },
      {
         $lookup: {
            from: "comments",
            localField: "content",
            as: "comments",
            pipeline: [{
               $lookup: {
                  from: "users",
                  localField: "owner",
                  foreignField: "_id",
                  as: "owner",
                  pipeline: [{
                     $project: {
                        username: 1
                     }
                  }]
               }
            }]
         }
      }
   ])

   if(!comment?.length){
      throw new ApiError(400, "comment doesnot found")

   }


   return res.status(200)
   .json(new ApiResponse(200, comment[0], "comments fetched successfully"))


})

const addComment = asynchandler(async(req, res)=> {

   const {content}  = req.body

   if([content].some((field) => field?.trim() === "")){
      throw new ApiError(400, "Content is required")
   }

   const video = req.params
   if(!video){
      throw new error(400, "video does not exist where i am trying to comment")
   }
   
   const owner = await User.findOne(req.user._id)




   const comment = Comment.create({
      content,
      video,
      owner
   })

})

const updateComment = asynchandler(async(req, res) => {
   // i have little doubt like when we will update a comment
   // we need the comment to update it, so in this first we will find the comment with id and then add the req.body to add data
   // or as i have done first added req.body which will allow user to type and then update it to existing comment by passing 
   // in the parameter. 

   const comment = req.body

   if(!comment){
      throw new ApiError(400, "you need to add text in order to update comment")
   }

   const updateComment = await Comment.findByIdAndUpdate(req.params?._id,
      {
         $set: {
            content: comment
         }
      },
      {new: true}
   )

   res.status(200)
   .json(new ApiResponse(200, updateComment, "comment updated successfully"))



})

const deleteComment = asynchandler(async(req,res)=> {

   const deleteComment = await Comment.findOneAndDelete(req.params._id)

   if(!deleteComment){
      throw new ApiError(400, "correct ID for the comment is not provided")
   }

   res.status(200)
   .json(new ApiResponse(200, deleteComment, "comment is deleted successfully"))

})


export {
   getVideoComments,
   addComment,
   updateComment,
   deleteComment
}