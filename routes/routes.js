const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminControllers');
const postController = require('../controllers/postControllers');
const userController = require('../controllers/userControllers');
const isAdmin  = require('../middlewares/isAdminMiddleware');
const jwtmiddleware = require('../middlewares/jwtMiddleware');
const upload = require('../middlewares/multerMiddleware');

// Admin Routes
router.get('/admin/users',jwtmiddleware, isAdmin, adminController.getAllUsers);
router.get('/admin/posts',jwtmiddleware, isAdmin, adminController.getAllPosts); 
router.get('/admin/comments',jwtmiddleware, isAdmin, adminController.getAllComments); 
router.delete('/admin/post/:id',jwtmiddleware, isAdmin, adminController.deletePost); 
router.delete('/admin/comment/:postId/:commentId',jwtmiddleware, isAdmin, adminController.deleteComment); 
router.delete('/admin/user/:id',jwtmiddleware, isAdmin, adminController.deleteUser);

// User Routes

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', jwtmiddleware, userController.getUserProfile);
router.put('/profile', jwtmiddleware, upload.single('profilePic'), userController.updateUserProfile);

// Post Routes

router.post('/create-post', jwtmiddleware, upload.single('coverImage'), postController.createPost);
router.get('/posts', postController.getAllPosts);
router.get('/posts/:id', postController.getPostById);
router.put('/update/:id', jwtmiddleware, upload.single('coverImage'), postController.updatePost);
router.delete('/delete/:id', jwtmiddleware, postController.removePost);
router.get('/featured/random', postController.featuredPost);
router.post('/:postId/like', jwtmiddleware, postController.likePost);
router.post('/:postId/unlike', jwtmiddleware, postController.unlikePost);
router.post('/:postId/comment', jwtmiddleware, postController.addComment);
router.delete('/:postId/comment/:commentId', jwtmiddleware, postController.deleteComment);

module.exports = router;
