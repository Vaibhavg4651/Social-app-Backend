import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


const userSchema = new mongoose.Schema(
  {
    _id: {
        type: String,
        default: uuidv4,
      },
    name: {
      type: String,
      max: 50,
    },
    user_email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    user_password: {
      type: String,
      required: true,
      min: 6,
    },
    user_name:{
      type: String,
      max: 50,
      unique: true,
    },
    user_photo_url: {
      type: String,
      default: "",
    },
    coverImg:{
     type:String,
      default: "",
    },
    user_bio: {
      type: String,
      max: 100,
      default:""
    },
    user_followers: {
      type: Array,
      default: [],
    },
    user_following: {
      type: Array,
      default: [],
    },
    post_ids: {
      type: Array,
      default: [],
    },
    created_on : {
      type: Date,
      default: Date.now
    }
  }
);
const User = mongoose.model('user', userSchema)

export default User