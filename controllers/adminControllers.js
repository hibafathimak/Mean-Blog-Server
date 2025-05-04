const Users = require('../models/userModel'); 
const Posts = require('../models/postModel'); 
const posts = require('../models/postModel');


exports.getPosts = async (req, res) => {
  try {
    const allPosts = await Posts.find().populate('author', 'username email');
    res.status(200).json(allPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json('Internal server error');
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json('Internal server error');
  }
};


exports.getAllComments = async (req, res) => {
  try {
    const posts = await Posts.find().populate('comments.user', 'username email');
    
    const allComments = posts.flatMap(post =>
      post.comments.map(comment => ({
        _id: comment._id,
        comment: comment.comment,
        user: comment.user,
        postId: post._id,
        postTitle: post.title,
        createdAt: comment.createdAt
      }))
    );

    res.status(200).json(allComments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json('Internal server error');
  }
};


exports.deletePost = async (req, res) => {
  try {
    const post = await Posts.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json('Post not found');
    
    res.status(200).json('Post deleted');
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json('Internal server error');
  }
};


exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Posts.findById(postId);
    if (!post) return res.status(404).json('Post not found');

    const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) return res.status(404).json('Comment not found');

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json('Comment deleted');
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json('Internal server error');
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await Users.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json('User not found');
    
    res.status(200).json('User deleted');
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json('Internal server error');
  }
};

exports.getAllReportedPosts = async (req, res) => {
  try {
    const reportedPosts = await posts.find({}, { reports: 1, _id: 0 });

    if (!reportedPosts.length) {
      return res.status(404).json('No reported posts found');
    }

    res.status(200).json(reportedPosts);

  } catch (error) {
    console.error(error);
    res.status(500).json('Error fetching reported posts');
  }
};


