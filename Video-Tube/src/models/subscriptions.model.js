import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber:{
            type: Schema.Types.ObjectId,
            ref:'User' //Subscriber
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref:'User' //channel subscribed
        }
    }
)

export const Subscription = mongoose.model('Subscription',subscriptionSchema)