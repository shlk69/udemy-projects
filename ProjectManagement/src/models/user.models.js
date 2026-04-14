import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import crypto, { createHmac } from 'crypto'
import jwt from 'jsonwebtoken'


const userSchema = new Schema({
    avatar: {
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: `https://placehold.co/200x200`,
            localPath: ''
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordExpiry: {
        type: Date
    },
    emailVarificationToken: {
        type: String
    },
    emailVarificationExpiry: {
        type: Date
    }
}, {
    timestamps: true
})


//Encryption whenever password field is touched
userSchema.pre('save', async function (next) {
    //if password filed isn't touched anyhow 
    if (!this.isModified('password')) return next()
    
    // if touched
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//Checking password (The hashed ones)
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

//Generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}

//Generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

//temporary tokens
userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString('hex')

    const hashedToken = crypto.createHmac('sha256').update(unHashedToken).digest('hex')

    const tokenExpiry = Date.now() + (20 * 60 * 1000)

    return {unHashedToken,hashedToken,tokenExpiry}
}


export const User = mongoose.model('User', userSchema)