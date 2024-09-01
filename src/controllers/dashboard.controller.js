import mongoose from "mongoose";
import {Video} from "../models/video.model.js";
import {Subscription} from "../models/subscription.model.js";
import {Like} from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Fetch statistics for the channel
const fetchChannelStatistics = asyncHandler(async (req, res) => {
    const channelId = req.user?._id;

    const subscribersAggregation = await Subscription.aggregate([
        { $match: { channel: mongoose.Types.ObjectId(channelId) } },
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ]);

    const videosAggregation = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likeDetails"
            }
        },
        {
            $project: {
                totalLikes: { $size: "$likeDetails" },
                totalViews: "$views",
                videoCount: { $literal: 1 }
            }
        },
        {
            $group: {
                _id: null,
                likesSum: { $sum: "$totalLikes" },
                viewsSum: { $sum: "$totalViews" },
                videosSum: { $sum: "$videoCount" }
            }
        }
    ]);

    const channelStatistics = {
        totalSubscribers: subscribersAggregation[0]?.count || 0,
        totalLikes: videosAggregation[0]?.likesSum || 0,
        totalViews: videosAggregation[0]?.viewsSum || 0,
        totalVideos: videosAggregation[0]?.videosSum || 0
    };

    return res.status(200).json(
        new ApiResponse(200, channelStatistics, "Channel statistics retrieved successfully")
    );
});

// Fetch videos uploaded by the channel
const fetchChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user?._id;

    const videoList = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likeData"
            }
        },
        {
            $addFields: {
                creationDate: { $dateToParts: { date: "$createdAt" } },
                likeCount: { $size: "$likeData" }
            }
        },
        {
            $sort: { "creationDate.year": -1, "creationDate.month": -1, "creationDate.day": -1 }
        },
        {
            $project: {
                videoId: "$_id",
                videoUrl: "$videoFile.url",
                thumbnailUrl: "$thumbnail.url",
                title: 1,
                description: 1,
                creationDate: {
                    year: "$creationDate.year",
                    month: "$creationDate.month",
                    day: "$creationDate.day"
                },
                published: "$isPublished",
                likeCount: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, videoList, "Channel videos retrieved successfully")
    );
});

export { fetchChannelStatistics, fetchChannelVideos };
