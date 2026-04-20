import { User } from "../models/user.models.js";
import ApiResponse from '../utils/api-response.js'
import ApiError from '../utils/api-error.js'
import asyncHandler from '../utils/async-handler.js'
import { emailVerificationMailgenContent, sendMail } from '../utils/mail.js'
import jwt from 'jsonwebtoken'


//Generating access and refresh tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, 'Something went wrong')
    }
}



//Registering user
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, 'User with email or username already exists', [])
    }

    const user = await User.create({
        email, password, username, isEmailVerified: false
    })
    return res.json(new ApiResponse(201, user))


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
        console.error('Mailtrap error', error)
    }

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken -emailVarificationToken -emailVarificationExpiry'
    )

    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while registering user')
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registered please check your email'))
})


//login user
const login = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body
    if (!email) {
        throw new ApiError(422, 'Email is required')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, 'User not found')
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, 'Invalid credentials')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken -emailVarificationToken -emailVarificationExpiry'
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser
                }, 'User logged in successfully'
            )
        )

})

//log out
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User logged out'))
})

//getCurrentUser
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200,
                req.user,
                'fetched current user successfully'
            )
        )
})


//verifyEmail
const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params
    if (!verificationToken) throw new ApiError(400, 'Email verification token is missing')

    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex')

    const user = await User.findOne(
        {
            emailVarificationToken: hashedToken,
            emailVarificationExpiry: { $gt: Date.now() }
        }
    )

    if (!user) throw new ApiError(400, 'Token is invalid or expire')

    user.emailVarificationExpiry = undefined
    user.emailVarificationToken = undefined



    user.isEmailVerified = true
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified: true
                },
                'Email is verified'
            )
        )
})


//resend email veification
const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
    if (!user) throw new ApiError(404, 'User does not exists')

    if (user.isEmailVerified) throw new ApiError(409, 'Email is already verified')

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
        console.error('Mailtrap error', error)
    }
    return res.status(200).json(
        new ApiResponse(200, {}, ' please check your email'))
})


//refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorized access')

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if (!user) throw new ApiError(401, 'Invalid refresh token')

        if (incomingRefreshToken !== user?.refreshToken) throw new ApiError(401, ' Refresh token is expired')


        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        user.refreshToken = newRefreshToken
        await user.save()

        return res
            .status(200)
            .clearCookie('accessToken', accessToken, options)
            .clearCookie('refreshToken', newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, 'Access token refreshed'))

    } catch (error) {
        throw new ApiError(401, 'Invalid refresh token')
    }
})



//forgot passsword
const forgotPassReq = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    
    if (!user) throw new ApiError(400, 'No user exists', [])
    
    const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken()
    
    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })
     
    await sendMail(
        {
            email: user?.email,
            subject: 'Password reset  request',
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
            )

        }
    )
    
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            'Password reset mail sent to your mail'
    ))
})





export default { registerUser, login, logoutUser, getCurrentUser, verifyEmail, refreshAccessToken,forgotPassReq }
