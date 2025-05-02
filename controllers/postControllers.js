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
  const { title, content, category, tags, coverImage } = req.body;

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
    const allPosts = await posts.find().populate('author', 'username profilePic');
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
    const post = await posts.findById(id)
    .populate('author', 'username profilePic') // Populate author fields
    .populate({
      path: 'comments.user', // Populate the 'userId' field in 'comments'
      select: 'username profilePic' // Select only the fields you need (username and profilePic)
    }).exec();

    if (!post) {
      res.status(404).json("Post Not Found");
    }
    res.status(200).json(post);
  } catch (error) {
    console.log(error)
    res.status(500).json(error);
  }
};




exports.getUserPosts = async (req, res) => {
  try {
    const blogs = await posts.find({ author: req.userId }).sort({ createdAt: -1 });
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
    const featuredPosts = await posts.find().populate('author', 'username profilePic').limit(9);
    res.status(200).json(featuredPosts)
  } catch (error) {
    res.status(500).json(error)
  }
}

exports.likeorUnlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await posts.findById(id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // User already liked it — unlike
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.status(200).json("Post unliked successfully");
    } else {
      // Not yet liked — like
      post.likes.push(userId);
      await post.save();
      return res.status(200).json("Post liked successfully");
    }
  } catch (error) {
    console.error("Error toggling like:", error);
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

    // Check if user already reported the post
    const existingReport = post.reports.find(
      report => report.reportedBy.toString() === req.userId
    );

    if (existingReport) {
      return res.status(400).json('You already reported this post');
    }

    // Add a new report entry
    post.reports.push({
      Count: 1,
      reportedBy: req.userId,
    });

    await post.save();
    res.status(200).json('Post reported');
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json('Error reporting post');
  }
};


