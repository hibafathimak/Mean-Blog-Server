const posts = require('../models/postModel')

// Create Post
exports.createPost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const coverImage = req.file.filename
        if (!title || !content || !category || !tags || !coverImage) {
            return res.status(400).json("All fields are required");
        }
        const newPost = new posts({
            title,
            content,
            category,
            tags,
            coverImage,
            author: req.userId,
        });
        await newPost.save();
        res.status(201).json("Post Created Successfully!!");
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get All Posts
exports.getAllPosts = async (req, res) => {
    try {
        const allPosts = await posts.find();
        res.status(200).json(allPosts);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Get Single Post
exports.getPostById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json("Post ID is required");
    }
    try {
        const post = await posts.findById(id);
        if (!post) {
            res.status(404).json("Post Not Found");
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json(error);
    }
};

// Update Post
exports.updatePost = async (req, res) => {
    console.log("Inside updatePost");
    const { id } = req.params
    const userId = req.userId;
    if (!id || !userId) {
        return res.status(400).json("PostId and userId is required");
    }
    const { title, content,category , tags ,coverImage } = req.body;

    const reUploadImage = req.file ? req.file.filename : coverImage;
    try {
        const updatedPost = await posts.findByIdAndUpdate(
            { _id: id },
            {
                title,
                content,
                coverImage: reUploadImage,
                tags,
                author: userId,
            },
            { new: true }
        );
        res.status(200).json("Post Updation Successfull!!");
    } catch (error) {
        res.status(401).json(error);
    }
};



// Delete Post
exports.removePost = async (req, res) => {
    console.log("Inside removePostController");
    const { id } = req.params
    if (!id) {
        return res.status(400).json("Post ID is required");
    }
    try {
        const deletedPost = await posts.findOneAndDelete({ _id: id })
        res.status(200).json("Post Deleted Successfully")
    } catch (error) {
        res.status(401).json(error)
    }
}

exports.featuredPost = async (req, res) => {
    console.log("Inside featuredPostController");
    try {
        const featuresPosts = await posts.aggregate([
            { $sample: { size: 3 } }
        ])
        res.status(200).json(featuresPosts)
    } catch (error) {
        res.status(401).json(error)
    }
}

exports.likePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.userId; // Assuming userId is extracted from auth middleware
  
      // Check if the post exists
      const post = await posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      // Check if the user already liked the post
      const alreadyLiked = post.likes.includes(userId);
      if (alreadyLiked) {
        return res.status(400).json({ error: "You already liked this post" });
      }
  
      // Add the like
      post.likes.push(userId);
      await post.save();
  
      res.status(200).json({ message: "Post liked successfully", post });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
  
exports.unlikePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.userId;
  
      const post = await posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      // Check if the user has liked the post
      const likeIndex = post.likes.indexOf(userId);
      if (likeIndex === -1) {
        return res.status(400).json({ error: "You have not liked this post" });
      }
  
      // Remove the like
      post.likes.splice(likeIndex, 1);
      await post.save();
  
      res.status(200).json({ message: "Post unliked successfully", post });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
  
exports.addComment = async (req, res) => {
    try {
      const { postId } = req.params;
      const { comment } = req.body;
      const userId = req.userId;
  
      if (!comment) {
        return res.status(400).json({ error: "Comment cannot be empty" });
      }
  
      const post = await posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      // Add the comment
      post.comments.push({
        user: userId,
        comment,
      });
  
      await post.save();
  
      res.status(201).json({ message: "Comment added successfully", post });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
  
exports.deleteComment = async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const userId = req.userId;
  
      const post = await posts.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      // Find the comment index
      const commentIndex = post.comments.findIndex(
        (comment) => 
          comment._id.toString() === commentId && 
          comment.user.toString() === userId
      );
  
      if (commentIndex === -1) {
        return res.status(404).json({ error: "Comment not found or unauthorized" });
      }
  
      // Remove the comment
      post.comments.splice(commentIndex, 1);
      await post.save();
  
      res.status(200).json({ message: "Comment deleted successfully", post });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
  
// controllers/postController.js
exports.reportPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json('Post not found');

        if (post.reportedBy.includes(req.userId))
            return res.status(400).json('You already reported this post');

        post.reportCount += 1;
        post.reportedBy.push(req.userId);

        await post.save();
        res.status(200).json('Post reported');
    } catch (error) {
        res.status(500).json('Error reporting post');
    }
};
