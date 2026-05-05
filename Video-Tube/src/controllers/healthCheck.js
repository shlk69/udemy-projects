import {ApiResponse} from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHanlder.js'

const healthCheck = asyncHandler(async (req, res) => {
    return res.
        status(200)
        .json(new ApiResponse(
        200,'OK','Health check is doing great'
    ))
})

export {healthCheck} 