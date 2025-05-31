import express from "express";
import { protectRoute } from "../middleware/auth_middleware.js";
import User from "../models/user_model.js";
import { getReceiverSocketId } from "../lib/socket.js";

const router = express.Router();

// Get all users
router.get("/", protectRoute, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("following followers");
    const users = await User.find({ 
      _id: { $ne: req.user._id } 
    }).select("-password");

    // Add a field to indicate mutual following
    const usersWithMutualStatus = users.map(user => {
      const isFollowingMe = user.followers.includes(req.user._id);
      const amFollowing = currentUser.following.includes(user._id);
      return {
        ...user.toJSON(),
        isMutualFollow: isFollowingMe && amFollowing
      };
    });

    res.status(200).json(usersWithMutualStatus);
  } catch (error) {
    console.log("Error in getUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fetch follow requests for the authenticated user
router.get("/requests", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("followRequests", "username profilePic fullName")
      .select("followRequests");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure followRequests exists
    const requests = user.followRequests || [];
    
    console.log("Follow requests found:", requests.length); // Debug log
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching follow requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get user by ID
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get user's followers
router.get("/followers/:userId", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("followers")
      .populate("followers", "-password -__v -email -following -followers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.followers);
  } catch (error) {
    console.log("Error in getFollowers:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get user's following list
router.get("/following/:userId", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("following")
      .populate("following", "-password -__v -email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.following);
  } catch (error) {
    console.log("Error in getFollowing:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Send follow request
router.post("/request/:id", protectRoute, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    // Validate IDs
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "You cannot request to follow yourself." });
    }

    // Find both users
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!receiver) {
      return res.status(404).json({ message: "User to follow not found." });
    }

    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }

    // Check if already following
    if (sender.following.includes(receiverId)) {
      return res.status(400).json({ message: "Already following this user." });
    }

    // Check if request already sent
    if (receiver.followRequests.includes(senderId)) {
      return res.status(400).json({ message: "Follow request already sent." });
    }

    // Add request
    receiver.followRequests.push(senderId);
    await receiver.save();    // Emit socket event for real-time notification
    const io = req.app.get("io");
    if (io) {
      // Emit to specific user's socket
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_follow_request", {
          userId: senderId,
          username: sender.username,
          fullName: sender.fullName,
          profilePic: sender.profilePic
        });
      }
      
      // Also emit a follow_request event for socket handling
      io.emit("follow_request", {
        from: senderId,
        to: receiverId
      });
    }

    res.status(200).json({
      message: "Follow request sent successfully",
      receiver: {
        _id: receiver._id,
        username: receiver.username,
        fullName: receiver.fullName
      }
    });
  } catch (error) {
    console.error("Error in follow request:", error);
    res.status(500).json({ message: "Failed to send follow request" });
  }
});

// Accept follow request
router.post("/requests/:id/accept", protectRoute, async (req, res) => {
  try {
    const requestId = req.params.id;
    // Fetch both users with all required fields
    const [user, requester] = await Promise.all([
      User.findById(req.user._id).select("+followRequests +followers"),
      User.findById(requestId).select("+following")
    ]);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    if (!user.followRequests || !user.followRequests.includes(requestId)) {
      return res.status(400).json({ message: "No follow request from this user" });
    }

    // Prepare updates
    const userUpdate = {
      $pull: { followRequests: requestId },
      $addToSet: { followers: requestId }
    };

    const requesterUpdate = {
      $addToSet: { following: user._id }
    };

    // Apply updates atomically
    await Promise.all([
      User.updateOne({ _id: user._id }, userUpdate),
      User.updateOne({ _id: requestId }, requesterUpdate)
    ]);

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(requestId).emit("requestAccepted", { 
        userId: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic
      });
    }

    res.status(200).json({ 
      message: "Follow request accepted",
      follower: {
        _id: requester._id,
        username: requester.username,
        fullName: requester.fullName,
        profilePic: requester.profilePic
      }
    });
  } catch (error) {
    console.error("Error accepting follow request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Reject follow request
router.post("/requests/:id/reject", protectRoute, async (req, res) => {
  try {
    const requestId = req.params.id;
    const user = await User.findById(req.user._id).select("+followRequests");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    if (!user.followRequests || !user.followRequests.includes(requestId)) {
      return res.status(400).json({ message: "No follow request from this user" });
    }

    // Remove request using atomic operation
    await User.updateOne(
      { _id: user._id },
      { $pull: { followRequests: requestId } }
    );

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(requestId).emit("requestRejected", { userId: user._id });
    }

    res.status(200).json({ message: "Follow request rejected" });
  } catch (error) {
    console.error("Error rejecting follow request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Follow a user
router.post("/follow/:id", protectRoute, async (req, res) => {
  const userId = req.user._id;
  const targetId = req.params.id;
  if (userId === targetId) return res.status(400).json({ message: "You cannot follow yourself." });
  try {
    const user = await User.findById(userId).select("username following");
    const target = await User.findById(targetId).select("username followers");

    if (!user || !target) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.username || !target.username) {
      return res.status(400).json({ message: "Invalid user data. Username is required." });
    }

    if (user.following.includes(targetId)) {
      return res.status(400).json({ message: "Already following." });
    }

    user.following.push(targetId);
    target.followers.push(userId);

    await user.save();
    await target.save();

    const io = req.app.get("io");
    io.emit("follow", { followerId: userId, followedId: targetId });

    res.status(200).json({
      message: "Followed successfully.",
      followersCount: target.followers.length,
      followingCount: user.following.length
    });
  } catch (error) {
    console.error("Error in follow endpoint:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Unfollow a user
router.post("/unfollow/:id", protectRoute, async (req, res) => {
  const userId = req.user._id;
  const targetId = req.params.id;
  if (userId === targetId) return res.status(400).json({ message: "You cannot unfollow yourself." });
  try {
    const user = await User.findById(userId);
    const target = await User.findById(targetId);    if (!user || !target) return res.status(404).json({ message: "User not found." });
    if (!user.following.includes(targetId)) return res.status(400).json({ message: "Not following this user." });
    
    // Remove the follow relationship in both directions
    user.following = user.following.filter(id => id.toString() !== targetId);
    target.followers = target.followers.filter(id => id.toString() !== userId);
    
    // Also make the target user unfollow the user (mutual unfollow)
    target.following = target.following.filter(id => id.toString() !== userId);
    user.followers = user.followers.filter(id => id.toString() !== targetId);
    
    await Promise.all([user.save(), target.save()]);    const io = req.app.get("io");
    
    // Emit mutual unfollow events to both users
    io.to(userId).to(targetId).emit("mutualUnfollow", { 
      initiatorId: userId,
      otherUserId: targetId,
      initiatorName: user.fullName,
      otherUserName: target.fullName
    });
    
    res.status(200).json({
      message: "Mutual unfollow successful.",
      myFollowersCount: user.followers.length,
      myFollowingCount: user.following.length,
      theirFollowersCount: target.followers.length,
      theirFollowingCount: target.following.length,
      unfollowedUser: {
        _id: target._id,
        username: target.username,
        fullName: target.fullName
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete current user
router.delete("/delete", protectRoute, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error in deleteUser controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;