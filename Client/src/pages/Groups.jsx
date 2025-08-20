import React, { useEffect, useState } from "react";
import Sidebar from "../components/Layout/Sidebar";
import { fetchMyGroups, createGroup, joinGroupByCode } from "../api/groups";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u?.id) {
          setUserId(u.id);
          load(u.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const load = async (uid) => {
    if (!uid) return;
    try {
      const { data } = await fetchMyGroups(uid);
      setGroups(data);
    } catch (e) {
      console.error(e);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!userId) {
      alert("Please log in to create a group.");
      return;
    }
    if (!trimmed) {
      alert("Group name is required.");
      return;
    }
    try {
      await createGroup({
        name: trimmed,
        description: description.trim(),
        userId,
      });
      setName("");
      setDescription("");
      await load(userId);
    } catch (e) {
      console.error(e);
    }
  };

  const onJoin = async (e) => {
    e.preventDefault();
    const code = joinCode.trim();
    if (!userId) {
      alert("Please log in to join a group.");
      return;
    }
    if (!code) {
      alert("Invite code is required.");
      return;
    }
    try {
      await joinGroupByCode(code, userId);
      setJoinCode("");
      await load(userId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      {/* On mobile, remove left margin for hidden sidebar, and add top padding for the fixed mobile header */}
      <div className="flex-1 md:ml-40 ml-0 md:pt-0 pt-14">
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4">Study Groups</h1>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <form onSubmit={onCreate} className="bg-white p-4 rounded-lg border">
              <h2 className="font-medium mb-2">Create Group</h2>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded mb-2 text-sm"
                placeholder="Group name"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded mb-2 text-sm"
                placeholder="Description (optional)"
              />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">
                Create
              </button>
            </form>

            <form onSubmit={onJoin} className="bg-white p-4 rounded-lg border">
              <h2 className="font-medium mb-2">Join by Code</h2>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full border p-2 rounded mb-2 text-sm"
                placeholder="Invite code"
              />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">
                Join
              </button>
            </form>
          </div>

          <h2 className="font-medium mt-8 mb-3">Your Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div key={g._id} className="bg-white border rounded-lg p-4">
                <div className="font-semibold">{g.name}</div>
                <div className="text-sm text-slate-600">{g.description}</div>
                <div className="text-xs text-slate-500 mt-2">Code: {g.code}</div>
                <button
                  onClick={() => navigate(`/groups/${g._id}`)}
                  className="mt-3 bg-indigo-600 text-white px-3 py-1.5 rounded text-sm"
                >
                  Open Chat
                </button>
              </div>
            ))}
            {groups.length === 0 && (
              <div className="text-slate-600">No groups yet. Create or join one.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;
