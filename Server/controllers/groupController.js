import mongoose from "mongoose";
import { Group } from "../models/Group.js";
import { GroupMessage } from "../models/GroupMessage.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name)
      return res.status(400).json({ message: "name is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const group = new Group({ name, description, createdBy: req.user.id });
    await group.save();
    res.status(201).json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const myGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).sort({
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
    const group = await Group.findOne({ code });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const userId = req.user.id;
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
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const userId = req.user.id;
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
    // authorize membership
    const isMember = await Group.exists({ _id: groupId, members: req.user.id });
    if (!isMember) return res.status(403).json({ message: 'Not a member of this group' });

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
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ message: "content required" });

    // authorize membership
    const isMember = await Group.exists({ _id: groupId, members: req.user.id });
    if (!isMember) return res.status(403).json({ message: 'Not a member of this group' });

    const msg = await GroupMessage.create({
      group: groupId,
      sender: req.user.id,
      content,
    });
    res.status(201).json(msg);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
