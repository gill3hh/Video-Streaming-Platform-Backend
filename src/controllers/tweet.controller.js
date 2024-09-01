import asyncHandler from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.model.js";
import mongoose from "mongoose";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createNewTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    if (!newTweet) {
        throw new ApiError(500, "Failed to create tweet, please try again");
    }

    return res.status(200).json(
        new ApiResponse(200, newTweet, "Tweet created successfully")
    );
});

const editTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingTweet = await Tweet.findById(tweetId);

    if (!existingTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (existingTweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can edit this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content } },
        { new: true }
    );

    if (!updatedTweet) {
        throw new ApiError(500, "Failed to update tweet, please try again");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

const removeTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweetToDelete = await Tweet.findById(tweetId);

    if (!tweetToDelete) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweetToDelete.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can delete this tweet");
    }

    await Tweet.findByIdAndRemove(tweetId);

    return res.status(200).json(
        new ApiResponse(200, { tweetId }, "Tweet deleted successfully")
    );
});

const fetchUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const userTweets = await Tweet.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesInfo",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                totalLikes: { $size: "$likesInfo" },
                userDetails: { $arrayElemAt: ["$userDetails", 0] },
                likedByUser: {
                    $in: [req.user?._id, "$likesInfo.likedBy"],
                },
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $project: {
                content: 1,
                userDetails: 1,
                totalLikes: 1,
                createdAt: 1,
                likedByUser: 1,
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(200, userTweets, "Tweets fetched successfully")
    );
});

export { createNewTweet, editTweet, removeTweet, fetchUserTweets };
