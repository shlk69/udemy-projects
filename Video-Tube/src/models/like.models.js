import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
        // Optional: Only if the like is on a comment
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
        // Optional: Only if the like is on a video
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
        // Optional: Only if the like is on a tweet
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });


export const Like = mongoose.model('Like',likeSchema)