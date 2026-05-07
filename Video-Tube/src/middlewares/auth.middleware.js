import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHanlder.js"
import { ApiError } from "../utils/ApiError.js"

const verifyJwt = asyncHandler(async (req, res, next) => {

    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Access token missing")
    }

    try {

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
            .select("-password -refreshToken")

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        req.user = user

        next()

    } catch (error) {

        throw new ApiError(
            401,
            error?.message || "Invalid access token"
        )
    }
})

export {
    verifyJwt
}