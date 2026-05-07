import { asyncHandler } from '../utils/asyncHanlder.js'
import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import fs from "fs"


//Generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, 'User not found');

        // Fix typos here
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save the refresh token to the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // Skip validation if other fields (like password) aren't present

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};


//Register or create a user
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body

    // 1. Validation
    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        if (req.files?.avatar?.[0]?.path) fs.unlinkSync(req.files.avatar[0].path)
        if (req.files?.coverImage?.[0]?.path) fs.unlinkSync(req.files.coverImage[0].path)
        throw new ApiError(400, 'All fields are required')
    }

    // 2. Check if user already exists
    const isUserExists = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (isUserExists) {
        if (req.files?.avatar?.[0]?.path) fs.unlinkSync(req.files.avatar[0].path)
        if (req.files?.coverImage?.[0]?.path) fs.unlinkSync(req.files.coverImage[0].path)
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

//Login user
const loginUser = asyncHandler(async (req, res) => {

    const { email, password, username } = req.body
    if (!email && !username) throw new ApiError(400, 'Email or  username required')

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!user) throw new ApiError(404, 'User not found , register first')

    const isPassValid = await user.isPasswordCorrect(password)
    if (!isPassValid) throw new ApiError(401, 'Wrong credentials , try again')

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    if (!loggedInUser) throw new ApiError(500, 'Error while logging in')
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(new ApiResponse(
            200,
            loggedInUser,
            'User logged in successfully'
        ))


})

//Renew access and refresh token
const accessRefreshToken = asyncHandler(async (req, res) => {
    const incomingRefToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefToken) throw new ApiError(400, ' Refresh token missing')

    try {
        const decodeToken = jwt.verify(incomingRefToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodeToken?._id)
        if (!user) throw new ApiError(401, 'Invalid refresh token')

        if (user.refreshToken !== incomingRefToken) throw new ApiError(401, ' Refresh token is expired or used')

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken()
        const loggedInUser = await User.findById(user._id)
            .select("-password -refreshToken")
        
        
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    'Access and refresh token successfully created'
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token')
    }
})

export {
    registerUser,
    loginUser,

}
