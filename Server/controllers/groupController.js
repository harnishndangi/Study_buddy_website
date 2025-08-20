import mongoose from "mongoose";
import { Group } from "../models/Group.js";
import { GroupMessage } from "../models/GroupMessage.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, userId } = req.body;
    if (!name || !userId)
      return res.status(400).json({ message: "name and userId required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const group = new Group({ name, description, createdBy: userId });
    await group.save();
    res.status(201).json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const myGroups = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId required" });
    const groups = await Group.find({ members: userId }).sort({
      updatedAt: -1,
    });
    res.json(groups);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const joinByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { userId } = req.body;
    const group = await Group.findOne({ code });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const already = group.members?.some(
      (m) => m?.toString() === String(userId)
    );
    if (!already) {
      group.members.push(new mongoose.Types.ObjectId(userId));
      await group.save();
    }
    res.json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const joinById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const already = group.members?.some(
      (m) => m?.toString() === String(userId)
    );
    if (!already) {
      group.members.push(new mongoose.Types.ObjectId(userId));
      await group.save();
    }
    res.json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, before } = req.query;
    const query = { group: groupId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    const messages = await GroupMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate("sender", "email");
    res.json(messages.reverse());
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, content } = req.body;
    if (!userId || !content)
      return res.status(400).json({ message: "userId and content required" });
    const msg = await GroupMessage.create({
      group: groupId,
      sender: userId,
      content,
    });
    res.status(201).json(msg);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
