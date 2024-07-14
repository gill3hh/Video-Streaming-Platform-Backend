import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema({
   videoFile: {
      type: String,  // cloudinary url
      required: true,
   },
   thumbnail: {
      type: String,  // cloudinary url
      required: true
   },
   title: {
      type: String,  
      required: true
   },
   description: {
      type: String,  
      required: true
   },
   duration: {
      type: Number,  
      required: true
   },
   views: {
      type: Number,
      default: 0
   },
   isPublished: {
      type: Boolean,
      default: true
   },
   owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   }

}, {timestamps: true})


VideoSchema.plugin(mongooseAggregatePaginate)  // this is mongoose aggregation pipeline and we have to call it before exporting
export const Video = mongoose.model("Video", VideoSchema)