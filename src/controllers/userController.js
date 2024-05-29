import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// @desc    Login a user
// @route   POST /api/login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "please provide email and password" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

  const Email = email.toLowerCase();

  const user = await User.findOne({ user_email: Email });
  if (user === null) {
    throw new Error("Invalid  email or password");
  } else {
    const validate = await bcrypt.compare(password, user.user_password);
    if (validate) {
      const token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "15d",
      });
      res.cookie("token", token, {
        path: "/",
        expires: new Date(Date.now() + 1000 * 3600),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(200).json({ success: true, message: user, token: token });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  }
});

// @desc    Logout user
// @route   GET /api/logout

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true,
    expires: new Date(0),
  });
  res.cookie.token = "";
  res.status(200).json({ success: true, message: "logout successfully" });
});

// @desc    Register a new user
// @route   POST /api/register
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    user_email,
    user_password,
    user_name
  } = req.body;
  
  try{
    if (!user_email || !name || !user_password || !user_name) {
      throw new Error("provide all details during registeration ...");
    }
    const userExists = await User.findOne({user_email});

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(user_password, salt);
    const Email = user_email.toLowerCase();

    const newUser = new User({
      name,
      user_email: Email,
      user_password: hashedpassword,
      user_name
    });
    const user = await newUser.save();
    res.status(200).json({ success: true, message: user });
  } catch (error) {
      console.error(error);
        res.status(400).json({ message: "Error updating field" });
    }
  });


// @desc    Get allSuggedted users
// @route   GET /api/users
const getSuggestedUsers = asyncHandler(async (req, res) => {
  try{
  const { id } = req.params;
  const usersFollowedByMe = await User.findOne({ _id: id }).select('user_following');
  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: id },
      },
    },
    { $sample: { size: 10 } },
  ]);
  
  if (usersFollowedByMe === null || usersFollowedByMe === undefined || usersFollowedByMe == []) {
    const suggestedUsers = users.slice(0, 4);
    const updateProfileDetails = await User.findById(id);
    res.json({ success: true, message: suggestedUsers, user: updateProfileDetails });
  } else {
    const filteredUsers = users.filter((user) => !usersFollowedByMe.user_following.includes(user._id));
    const suggestedUsers = filteredUsers.slice(0, 4);
    const updateProfileDetails = await User.findById(id);
    res.json({ success: true, message: suggestedUsers, user: updateProfileDetails});
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ message: "Error updating field" });
}
});



const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json({ success: true, message: users });
});

// @desc    GET user by ID
// @route   GET /api/user/:id

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.query;
    try {
      const user = await User.findById(
        id
      );
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating field" });
    }
 
});

const followUnfollowUser = async (req, res) => {
	try {
		const { id , user } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(user);

		if (id === user.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.user_following.includes(id) || false;

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { user_followers: user } });
			await User.findByIdAndUpdate(user, { $pull: { user_following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { user_followers: user } });
			await User.findByIdAndUpdate(user, { $push: { user_following: id } });

			res.status(200).json({ success: true, message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};





// @desc    update user by ID
// @route   Put /api/user/:id

const updateProfileDetails = asyncHandler(async (req, res) => {
  const {user_id, name, user_email, user_name, user_bio} = req.body;

	const userId = user_id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		user.name = name || user.name;
		user.user_email = user_email || user.user_email;
		user.user_name = user_name || user.user_name;
		user.user_bio = user_bio || user.user_bio;

		user = await user.save();

		return res.status(200).json({ success: true, message: user });
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
});

const updateProfileimages = asyncHandler(async (req, res) => {
	let { user_id ,user_photo_url, coverImg} = req.body;

	const userId = user_id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (user_photo_url) {
			if (user.user_photo_url) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.user_photo_url.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(user_photo_url);
			user_photo_url = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.user_photo_url = user_photo_url || user.user_photo_url;
    user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		return res.status(200).json({ success: true, message: user });
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
});

export { authUser, registerUser, logout, getUsers, getSuggestedUsers, getUserById, updateProfileDetails, followUnfollowUser, updateProfileimages };
