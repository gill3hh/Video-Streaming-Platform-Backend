import {asyncHandler} from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.models.js";
import mongoose, {isValidObjectId} from "mongoose";
import {User} from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const checkHealth = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, { status: "All systems operational" }, "Health check successful")
    );
});

export { checkHealth };
