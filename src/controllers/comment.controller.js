import mongoose from "mongoose";
import {Comment} from "../models/comment.models.js";
import {Video} from "../models/video.models.js";
import {Like} from "../models/like.models.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// we will get comments for the specific video Fetch comments for a specific video
const fetchCommentsForVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json(new ApiError(404, "Video not found"));
    }

    const aggregationPipeline = [
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerData"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likesData"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likesData" },
                owner: { $arrayElemAt: ["$ownerData", 0] },
                isLiked: { $in: [req.user?._id, "$likesData.likedBy"] }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: "$owner.username",
                    fullName: "$owner.fullName",
                    avatarUrl: "$owner.avatar.url"
                },
                isLiked: 1
            }
        }
    ];

    const options = {
        page: Number(page),
        limit: Number(limit)
    };

    const comments = await Comment.aggregatePaginate(aggregationPipeline, options);
    res.status(200).json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

// Add a new comment to a video
const createComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json(new ApiError(400, "Content is required"));
    }

    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json(new ApiError(404, "Video not found"));
    }

    const newComment = new Comment({
        content,
        video: videoId,
        owner: req.user?._id
    });

    const savedComment = await newComment.save();
    if (!savedComment) {
        return res.status(500).json(new ApiError(500, "Failed to add comment"));
    }

    res.status(201).json(new ApiResponse(201, savedComment, "Comment added successfully"));
});

// Update an existing comment
const modifyComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json(new ApiError(400, "Content is required"));
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json(new ApiError(404, "Comment not found"));
    }

    if (!comment.owner.equals(req.user?._id)) {
        return res.status(403).json(new ApiError(403, "Unauthorized to edit this comment"));
    }

    comment.content = content;
    const updatedComment = await comment.save();

    if (!updatedComment) {
        return res.status(500).json(new ApiError(500, "Failed to update comment"));
    }

    res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

// Remove a comment from a video
const removeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).json(new ApiError(404, "Comment not found"));
    }

    if (!comment.owner.equals(req.user?._id)) {
        return res.status(403).json(new ApiError(403, "Unauthorized to delete this comment"));
    }

    await comment.remove();
    await LikeModel.deleteMany({ comment: commentId, likedBy: req.user._id });

    res.status(200).json(new ApiResponse(200, { commentId }, "Comment deleted successfully"));
});

export { fetchCommentsForVideo, createComment, modifyComment, removeComment };
