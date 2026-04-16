import  {User}  from "../models/user.models.js";
import ApiResponse from '../utils/api-response.js'
import  ApiError  from '../utils/api-error.js'
import asyncHandler from '../utils/async-handler.js'
import {emailVerificationMailgenContent, sendMail} from '../utils/mail.js'


//Generating access and refresh tokens
const generateAccessAndRefreshToken = async  (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError (500,'Something went wrong')
    }
}



//Registering user
const registerUser = asyncHandler(async (req,res) => {
    const { username, email, password, role } = req.body
    
    const existedUser = await User.findOne({
        $or :[{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(409, 'User with email or username already exists', []) 
    }

    const user = await User.create({
        email, password, username, isEmailVerified:false
    })
    res.json(new ApiResponse(201,user))


    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.emailVarificationToken = hashedToken
    user.emailVarificationExpiry = tokenExpiry


    await user.save({ validateBeforeSave: false })
    
    try {
        await sendMail(
            {
                email: user?.email,
                subject: 'Please verify your email',
                mailgenContent: emailVerificationMailgenContent(
                    user.username,
                    `${req.protocol}://${req.get('host')}/api/v1/users/verify-email/${unHashedToken}`
                )
    
            }
        )
    } catch (error) {
        console.error('Mailtrap error',error)
    }

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken -emailVarificationToken -emailVarificationExpiry'
    )

    if (!createdUser) {
        throw new ApiError(500,'Something went wrong while registering user')
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser, 'User registered please check your email'))
})


export  default registerUser