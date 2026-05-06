import { asyncHandler } from '../utils/asyncHanlder.js'
import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import fs from "fs"

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body

    // 1. Validation
    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, 'All fields are required')
    }

    // 2. Check if user already exists
    const isUserExists = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (isUserExists) {
        throw new ApiError(409, 'User with email or username already exists')
    }

    // 3. Extract Local Paths
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required')
    }

    // 4. Upload to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalPath) // Returns null if path is empty

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed")
    }

    // 5. Create User
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // 6. Check Creation & Return Response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

export { registerUser }
