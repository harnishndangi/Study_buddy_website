import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Layout/Sidebar";
import { useParams } from "react-router-dom";
import { fetchMessages } from "../api/groups";
import { io } from "socket.io-client";

// Get the base URL for socket connection (remove /api suffix if present)
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://study-buddy-website-30kd.onrender.com/api';
  return apiUrl.replace('/api', '');
};

const socket = io(getSocketUrl(), {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});


const GroupChat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUserId(u.id);
      } catch {
        console.error("Failed to parse user from localStorage");
      }
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchMessages(id, { limit: 50 });
        setMessages(data);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    socket.emit("join_group", { groupId: id });
    const onMsg = (msg) => {
      if (msg.group === id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("group_message", onMsg);
    return () => {
      socket.off("group_message", onMsg);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    socket.emit("group_message", { groupId: id, userId, content });
    setInput("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      {/* On mobile, remove left margin for hidden sidebar, and add top padding for the fixed mobile header */}
      <div className="flex-1 md:ml-40 ml-0 md:pt-0 pt-14">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          <div className="bg-white border rounded-lg h-[calc(100vh-8rem)] sm:h-[70vh] flex flex-col">
            {/* Header */}
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b font-semibold sticky top-0 z-10 bg-white">
              Group Chat
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`flex ${m.sender === userId || m.sender?._id === userId
                    ? "justify-end"
                    : "justify-start"
                    }`}
                >
                  <div
                    className={`rounded px-3 py-2 max-w-[85%] sm:max-w-[70%] ${m.sender === userId || m.sender?._id === userId
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100"
                      }`}
                  >
                    <div className="text-sm break-words">{m.content}</div>
                    <div className="text-[10px] opacity-70 mt-1">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={send} className="p-2.5 sm:p-3 border-t flex gap-2 sticky bottom-0 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
                placeholder="Type a message"
              />
              <button className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
