import {asyncHandler} from "../utils/asyncHandler.js";

import {Video} from "../models/video.models.js";
import {User} from "../models/user.models.js";
import {Comment} from "../models/comment.models.js";
import {
    uploadOnCloudinary,
    deleteOnCloudinary
} from "../utils/cloudinary.js";

import mongoose from "mongoose";
import {Like} from "../models/like.models.js";

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Fetch all videos based on query, sort, and pagination
const fetchAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pipeline = [];

    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"]
                }
            }
        });
    }

    if (userId) {
        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        });
    }

    pipeline.push({ $match: { isPublished: true } });

    if (sortBy && sortType) {
        pipeline.push({
            $sort: { [sortBy]: sortType === "asc" ? 1 : -1 }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    );

    const videoAggregation = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const videos = await Video.aggregatePaginate(videoAggregation, options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos retrieved successfully"));
});

// Upload video to cloudinary and create video entry
const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if ([title, description].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const videoFilePath = req.files?.videoFile[0].path;
    const thumbnailPath = req.files?.thumbnail[0].path;

    if (!videoFilePath || !thumbnailPath) {
        throw new ApiError(400, "Both video and thumbnail are required");
    }

    const videoFile = await uploadOnCloudinary(videoFilePath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "File upload failed");
    }

    const duration = Number(videoFile.duration);

    // Validate the duration
    if (isNaN(duration)) {
        throw new ApiError(400, "Invalid duration received from Cloudinary");
    }

    const video = await Video.create({
        title,
        description,
        duration: duration, // Use validated duration
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
        owner: req.user?._id,
        isPublished: false
    });

    if (!video) {
        throw new ApiError(500, "Video creation failed, please try again");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"));
});


// Get video details by ID
const fetchVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!mongoose.isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const videoDetails = await Video.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likeInfo"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscriberInfo"
                        }
                    },
                    {
                        $addFields: {
                            subscriberCount: { $size: "$subscriberInfo" },
                            isSubscribed: {
                                $in: [req.user?._id, "$subscriberInfo.subscriber"]
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                            subscriberCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likeInfo" },
                ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] },
                isLiked: {
                    $in: [req.user?._id, "$likeInfo.likedBy"]
                }
            }
        },
        {
            $project: {
                "videoFile.url": 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                comments: 1,
                ownerDetails: 1,
                likeCount: 1,
                isLiked: 1
            }
        }
    ]);

    if (!videoDetails || !videoDetails.length) {
        throw new ApiError(500, "Failed to retrieve video details");
    }

    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    });

    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet: { watchHistory: videoId }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, videoDetails[0], "Video details retrieved successfully"));
});

// Update video details like title, description, and thumbnail
const updateVideoDetails = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!(title && description)) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoToUpdate = await Video.findById(videoId);

    if (!videoToUpdate) {
        throw new ApiError(404, "Video not found");
    }

    if (videoToUpdate.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this video");
    }

    const oldThumbnailId = videoToUpdate.thumbnail.public_id;
    const newThumbnailPath = req.file?.path;

    if (!newThumbnailPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const newThumbnail = await uploadOnCloudinary(newThumbnailPath);

    if (!newThumbnail) {
        throw new ApiError(400, "Thumbnail upload failed");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: {
                    public_id: newThumbnail.public_id,
                    url: newThumbnail.url
                }
            }
        },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video");
    }

    if (updatedVideo) {
        await deleteOnCloudinary(oldThumbnailId);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// Delete a video
const removeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const videoToDelete = await Video.findById(videoId);

    if (!videoToDelete) {
        throw new ApiError(404, "Video not found");
    }

    if (videoToDelete.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video");
    }

    const deletedVideo = await Video.findByIdAndRemove(videoId);

    if (!deletedVideo) {
        throw new ApiError(400, "Failed to delete video");
    }

    await deleteOnCloudinary(videoToDelete.thumbnail.public_id);
    await deleteOnCloudinary(videoToDelete.videoFile.public_id, "video");

    await Like.deleteMany({ video: videoId });
    await Comment.deleteMany({ video: videoId });
    
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// Toggle the publish status of a video
const toggleVideoPublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to toggle the publish status of this video");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: !video.isPublished } },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to toggle video publish status");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { isPublished: updatedVideo.isPublished }, "Video publish status toggled successfully"));
});

export {
    uploadVideo,
    updateVideoDetails,
    removeVideo,
    fetchAllVideos,
    fetchVideoById,
    toggleVideoPublishStatus,
};
