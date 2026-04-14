import ApiResponse from '../utils/api-response.js'
import asyncHandler from '../utils/async-handler.js'


//HealthCheck logic

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200,{message:'Server is running'})
})


export default healthCheck