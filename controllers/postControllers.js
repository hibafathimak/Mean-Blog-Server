const posts = require('../models/postModel')


exports.createPost = async (req, res) => {
    try {
        console.log("Inside createPost");

        const { title, content, category, tags } = req.body;
        const coverImage = req.file.filename
        if (!title || !content || !category || !tags || !coverImage) {
            return res.status(400).json("All fields are required");
        }
        const newPost = new posts({
            title,
            content,
            category,
            tags: typeof tags === 'string' ? tags.split(',') : tags,
            coverImage,
            author: req.userId,
        });
        await newPost.save();
        res.status(201).json("Post Created Successfully!!");
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
};
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
                tags: typeof tags === 'string' ? tags.split(',') : tags,
                category,
                coverImage: reUploadImage,
            },
            { new: true }
        );
        res.status(200).json("Post Updation Successfull!!");
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const allPosts = await posts.find();
        res.status(200).json(allPosts);
    } catch (error) {
        res.status(500).json(error);
    }
};


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




exports.getUserPosts = async (req, res) => {
    try {
    const {userId} = req.userId;
      const blogs = await posts.find({ user: userId }).sort({ createdAt: -1 });
      res.status(200).json(blogs);
    } catch (error) {
      console.error(error);
      res.status(500).json('Failed to fetch user blogs.');
    }
  };


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
        res.status(500).json(error)
    }
}

exports.featuredPost = async (req, res) => {
    console.log("Inside featuredPostController");
    try {
        const featuresPosts = await posts.limit(9)
        res.status(200).json(featuresPosts)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.likePost = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId; 

      const post = await posts.findById(id);
      if (!post) {
        return res.status(404).json("Post not found");
      }

      const alreadyLiked = post.likes.includes(userId);
      if (alreadyLiked) {
        return res.status(409).json("You already liked this post");
      }
  
      post.likes.push(userId);
      await post.save();
  
      res.status(200).json("Post liked successfully");
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json("Internal server error");
    }
};
  
exports.unlikePost = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
  
      const post = await posts.findById(id);
      if (!post) {
        return res.status(404).json("Post not found");
      }

      post.likes.splice(likeIndex, 1);
      await post.save();
  
      res.status(200).json("Post unliked successfully");
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json("Internal server error");
    }
};
  
exports.addComment = async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = req.userId;
  
      if (!comment) {
        return res.status(400).json("Comment cannot be empty");
      }
  
      const post = await posts.findById(id);
      if (!post) {
        return res.status(404).json("Post not found");
      }
  
      post.comments.push({
        user: userId,
        comment,
      });
  
      await post.save();
  
      res.status(201).json("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json("Internal server error");
    }
};
  
exports.deleteComment = async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const userId = req.userId;
  
      const post = await posts.findById(postId);
      if (!post) {
        return res.status(404).json("Post not found");
      }
      const commentIndex = post.comments.findIndex(
        (comment) => 
          comment._id.toString() === commentId && 
          comment.user.toString() === userId
      );
  
      if (commentIndex === -1) {
        return res.status(404).json("Comment not found or unauthorized");
      }

      post.comments.splice(commentIndex, 1);
      await post.save();
  
      res.status(200).json("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json("Internal server error");
    }
};
  

exports.reportPost = async (req, res) => {
    try {
        const post = await posts.findById(req.params.id);
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
