import mongoose from "mongoose";
import asynchandler from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const switchSubscription = asynchandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (existingSubscription) {
        await Subscription.findByIdAndRemove(existingSubscription._id);

        return res.status(200).json(
            new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        );
    }

    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    return res.status(200).json(
        new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
    );
});

// Controller to fetch the list of subscribers for a specific channel
const fetchChannelSubscribers = asynchandler(async (req, res) => {
    let { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    channelId = new mongoose.Types.ObjectId(channelId);

    const subscriberList = await Subscription.aggregate([
        { $match: { channel: channelId } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscriberConnections",
                        },
                    },
                    {
                        $addFields: {
                            isMutualSubscription: {
                                $cond: {
                                    if: { $in: [channelId, "$subscriberConnections.subscriber"] },
                                    then: true,
                                    else: false,
                                },
                            },
                            totalSubscribers: { $size: "$subscriberConnections" },
                        },
                    },
                ],
            },
        },
        { $unwind: "$subscriberDetails" },
        {
            $project: {
                _id: 0,
                subscriberDetails: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    isMutualSubscription: 1,
                    totalSubscribers: 1,
                },
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(200, subscriberList, "Subscribers fetched successfully")
    );
});

// Controller to fetch the list of channels to which a user has subscribed
const fetchSubscribedChannels = asynchandler(async (req, res) => {
    const { subscriberId } = req.params;

    const subscribedChannelsList = await Subscription.aggregate([
        { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videosList",
                        },
                    },
                    {
                        $addFields: {
                            mostRecentVideo: { $arrayElemAt: ["$videosList", -1] },
                        },
                    },
                ],
            },
        },
        { $unwind: "$channelDetails" },
        {
            $project: {
                _id: 0,
                channelDetails: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    mostRecentVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1,
                    },
                },
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(200, subscribedChannelsList, "Subscribed channels fetched successfully")
    );
});

export { switchSubscription, fetchChannelSubscribers, fetchSubscribedChannels };
