import mongoose from "mongoose";
import {Like} from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const switchVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    });

    if (existingLike) {
        await Like.findByIdAndRemove(existingLike._id);

        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like removed from video"));
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    });

    return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Like added to video"));
});

const switchCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (existingLike) {
        await Like.findByIdAndRemove(existingLike._id);

        return res.status(200).json(new ApiResponse(200, { isLiked: false }, "Like removed from comment"));
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Like added to comment"));
});

const switchTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (existingLike) {
        await Like.findByIdAndRemove(existingLike._id);

        return res.status(200).json(new ApiResponse(200, { tweetId, isLiked: false }, "Like removed from tweet"));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    return res.status(200).json(new ApiResponse(200, { isLiked: true }, "Like added to tweet"));
});

const fetchLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: { likedBy: new mongoose.Types.ObjectId(req.user?._id) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "uploaderInfo",
                        },
                    },
                    { $unwind: "$uploaderInfo" },
                ],
            },
        },
        { $unwind: "$videoDetails" },
        { $sort: { createdAt: -1 } },
        {
            $project: {
                _id: 0,
                videoDetails: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    uploaderInfo: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    },
                },
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Fetched liked videos successfully")
    );
});

export { switchVideoLike, switchCommentLike, switchTweetLike, fetchLikedVideos };
