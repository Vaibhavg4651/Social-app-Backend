import express from 'express'
const router = express.Router()
import {
  authUser, registerUser, logout, getSuggestedUsers, getUserById, followUnfollowUser, getUsers , updateProfileDetails, updateProfileimages
  } from '../controllers/userController.js'
  import{
    post,getPostByUserId,getPosts,likeUnlikePost
  } from '../controllers/postController.js'
  import { protect } from '../../middlewares/authmiddleware.js'

  //user routes
  router.route('/v1/api/register').post(registerUser).get(protect, getUsers)
  router.post('/v1/api/login', authUser)
  router.get('/v1/api/user/logout',logout)
  router.patch('/v1/api/user/:id',updateProfileDetails)
  router.patch('/v1/api/userimg/:id',updateProfileimages)
  router.get('/v1/api/suggestedusers/:id',getSuggestedUsers)
  router.get('/v1/api/users/:id',getUserById)
  router.get('/v1/api/follow/:id/:user',followUnfollowUser)
  
  
  // post routes
  router.post('/v1/api/post',post)
  router.get('/v1/api/posts',getPosts)
  router.get('/v1/api/post/:id',getPostByUserId)
  router.get('/v1/api/like/:id/:user',likeUnlikePost)


  export default router