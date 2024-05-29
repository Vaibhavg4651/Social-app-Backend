import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


const postsSchema = new mongoose.Schema(
  {
    _id: {
        type: String,
        default: uuidv4,
      },
    user_id: {
      type: String,
      max: 50,
    },
    name: {
      type: String,
      required: true,
      max: 50,
    },
    user_name:{
      type: String,
      max: 50,
    },
    post_photo_url: {
      type: String,
      default:"",
    },
    user_photo_url: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      max: 300,
    },
    likes: {
      type: Array,
      default: [],
    },
    count_comments: {
        type: Number,
        default: 0,
    },
    created_on : {
      type: Date,
      default: Date.now
    }
  }
);
const Post = mongoose.model('posts', postsSchema)

export default Post