import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import dotenv from 'dotenv'


dotenv.config()
//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async function (localPath) {
    try { 
        if (!localPath) return null
        const response = await cloudinary.uploader.upload(
            localPath,
            {
                resource_type:'auto'
            }
        )
        //After uploading remove from the server
        fs.unlinkSync(localPath)
        return response
    } catch (error) {
        fs.unlinkSync(localPath)
        return null
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log('deleted from cloudinary ', publicId)
        
    } catch (error) {
        console.log('Cloudinary err', error)
        return null
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}