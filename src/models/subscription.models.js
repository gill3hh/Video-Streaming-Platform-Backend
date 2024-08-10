import mongoose, {Schema} from "mongoose";

const SubscriptionSchema = new Schema({
   subscriber: {
      // one who is subscribing 
      type: Schema.Types.ObjectId,
      ref: "User"
   },

   channel: {
      // one to whom subscriber is subscribing
      type: Schema.Types.ObjectId,
      ref: "User"
   }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", SubscriptionSchema)