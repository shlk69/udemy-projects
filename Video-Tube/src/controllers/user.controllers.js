import { asyncHandler } from '../utils/asyncHanlder.js'
import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'



const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body

    //Validation
    const requiredFields = ['fullname', 'username', 'password', 'email']
    const missingFields = requiredFields.some((field) => !(field in req.body))
    if (missingFields) throw new ApiError(400, 'All fields are required')


    //User exists or not
    const isUserExists = User.findOne({
        $or: [{ email }, { username }]
    })

    if (isUserExists) throw new ApiError(409, 'User  already exists')

    //cover and avatar image extract and upload on cloudinary
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is unavailable')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    let coverImage = ''
    if(coverLocalPath) coverImage = await uploadOnCloudinary(coverLocalPath)

     
    //User creation
    const user = User.create({
        username:username.toLoweCase(),
        email,
        password,
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || ''
    })
    
    //User created or not
    const createdUser = User.findById(user._id).select(
        '-password -refreshToken'
    )
    if (!createdUser) throw new ApiError(500, 'Unable to create user')
    return res
        .status(201)
        .json(new ApiResponse(
            200,
            createdUser,
            'User created successfully'
        ))
})

export {
    registerUser
}   