import asyncHandler from "express-async-handler";
import Post from "../models/posts.js"
import { v2 as cloudinary } from "cloudinary";

// @desc    POST a Post
// @route   POST /api/post
const post = asyncHandler(async (req, res) => {
  const {user_id , name, user_name, user_photo_url , description} = req.body;
  let { post_photo_url } = req.body;
  if (!user_id || !name || !user_name || !description) {
    throw new Error("provide all details during registeration ...");
  }


		if (post_photo_url) {
			const uploadedResponse = await cloudinary.uploader.upload(post_photo_url);
			post_photo_url = uploadedResponse.secure_url;
		}

  const newPost = new Post({
    user_id , name, user_name, user_photo_url , description , post_photo_url
  });
  const post = await newPost.save();
  res.status(200).json({ success: true, message: post });
});

// @desc    GET all Posts
// @route   GET /api/posts
const getPosts = asyncHandler(async (req, res) => {
  const post = await Post.find({}).sort({ createdAt: -1 });
  res.json(post);
});


// @desc    GET post by user_id
// @route   GET /api/post/:id

const getPostByUserId = asyncHandler(async (req, res) => {
  const { user_id} = req.query;
  try {
    const post = await Post.findById(
      user_id
    );
    res.json([post]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating field" });
  }
});

// @desc    GET Likes by postId
// @route   GET /api/likes/:id/:user

const likeUnlikePost = async (req, res) => {
	try {
		// const userId = req.user._id;
		const { id: postId , user: userId } = req.params;
		console.log(postId);

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json({ success: true, message: updatedLikes });
		} else {
			// Like post
			post.likes.push(userId);
			await post.save();

			const updatedLikes = post.likes;
			res.status(200).json({ success: true, message: updatedLikes });
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};



export { getPostByUserId , getPosts , post, likeUnlikePost};