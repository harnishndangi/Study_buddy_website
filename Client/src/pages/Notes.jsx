import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Layout/Sidebar";
import axiosInstance from "../api/axiosConfig";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updated"); // 'updated' | 'title'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Only used for add form
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  // For in-place editing
  const [editNoteId, setEditNoteId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    tags: "",
  });
  // Store highlight text and file inputs per note ID to avoid cross-note interference
  const [highlightTexts, setHighlightTexts] = useState({});
  const [files, setFiles] = useState({});
  const fileInputRefs = useRef({});

  const fetchNotes = async (searchValue = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(
        `/notes${searchValue ? `?search=${encodeURIComponent(searchValue)}` : ""}`
      );
      setNotes(res.data);
    } catch {
      setError("Failed to fetch notes");
    }
    setLoading(false);
  };

  // Fetch all notes on initial mount only
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await axiosInstance.post(`/notes`, {
        title: form.title,
        content: form.content,
        tags: tagsArray,
      });
      setForm({ title: "", content: "", tags: "" });
      fetchNotes();
    } catch {
      setError("Failed to save note");
    }
    setLoading(false);
  };

  // Start in-place editing for a note
  const handleEdit = (note) => {
    setEditNoteId(note._id);
    setEditForm({
      title: note.title,
      content: note.content,
      tags: note.tags ? note.tags.join(", ") : "",
    });
    setHighlightTexts((prev) => ({ ...prev, [note._id]: "" }));
    setFiles((prev) => ({ ...prev, [note._id]: null }));
    if (fileInputRefs.current[note._id]) {
      fileInputRefs.current[note._id].value = "";
    }
  };

  // Cancel in-place editing
  const handleCancelEdit = () => {
    setEditNoteId(null);
    setEditForm({ title: "", content: "", tags: "" });
    setError("");
  };

  // Handle in-place edit form changes
  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Submit in-place note update
  const handleUpdateNote = async (noteId) => {
    setLoading(true);
    setError("");
    try {
      const tagsArray = editForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await axiosInstance.put(`/notes/${noteId}`, {
        title: editForm.title,
        content: editForm.content,
        tags: tagsArray,
      });
      setEditNoteId(null);
      setEditForm({ title: "", content: "", tags: "" });
      fetchNotes();
    } catch {
      setError("Failed to update note");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    setLoading(true);
    setError("");
    try {
      await axiosInstance.delete(`/notes/${id}`);
      fetchNotes();
    } catch {
      setError("Failed to delete note");
    }
    setLoading(false);
  };

  const handleHighlight = async (noteId) => {
    if (!highlightTexts[noteId] || !highlightTexts[noteId].trim()) return;
    setLoading(true);
    setError("");
    try {
      await axiosInstance.post(`/notes/${noteId}/highlight`, {
        highlight: highlightTexts[noteId],
      });
      setHighlightTexts((prev) => ({ ...prev, [noteId]: "" }));
      fetchNotes();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to highlight. Please try again.";
      setError(errorMessage);
    }
    setLoading(false);
  };

  const handleAttach = async (noteId) => {
    const file = files[noteId];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axiosInstance.post(`/notes/${noteId}/attach`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles((prev) => ({ ...prev, [noteId]: null }));
      if (fileInputRefs.current[noteId]) {
        fileInputRefs.current[noteId].value = "";
      }
      fetchNotes();
    } catch {
      setError("Failed to attach file");
    }
    setLoading(false);
  };

  const renderHighlights = (content, highlights) => {
    if (!highlights || highlights.length === 0) return content;
    let result = content;
    highlights.forEach((hl) => {
      const regex = new RegExp(`(${hl.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")})`, "gi");
      result = result.replace(regex, '<mark class="bg-yellow-200 p-0.5 rounded">$1</mark>');
    });
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  // client-side sort for display
  const sortedNotes = (() => {
    const list = [...notes];
    if (sort === "title") return list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    // default: updated
    return list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  })();

  return (
    <div className="flex flex-row h-screen bg-slate-50 overflow-x-auto">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto ml-0 md:ml-40 pt-14 md:pt-0">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-slate-200">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-sky-500/10 to-emerald-500/10" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" aria-hidden="true">
                      <path fill="currentColor" d="M5 3h14a2 2 0 0 1 2 2v11.5a1.5 1.5 0 0 1-2.4 1.2l-2.2-1.65a2 2 0 0 0-2.4 0l-1.2.9a2 2 0 0 1-2.4 0l-1.2-.9a2 2 0 0 0-2.4 0L3 19.5V5a2 2 0 0 1 2-2Z" />
                    </svg>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Notes</h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 sm:px-4 py-2 text-white text-sm font-medium shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      const el = document.getElementById("note-form");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
                    </svg>
                    New note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
 
        {/* Utilities: search + sort */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:w-96">
              <input
                type="search"
                placeholder="Search notes..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchNotes(search);
                }}
                disabled={loading}
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-1.06 1.06l.27.28v.79l4.5 4.5 1.5-1.5zM10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
              </svg>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm font-medium shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                onClick={() => fetchNotes(search)}
                disabled={loading}
              >
                Search
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Sort notes"
              >
                <option value="updated">Sort: Last updated</option>
                <option value="title">Sort: Title</option>
              </select>
            </div>
          </div>
        </section>

        {/* Note Form */}
        <section id="note-form" className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col gap-3 sm:gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Add a note</h2>
              <span className="text-xs text-slate-500">Fields marked * are required</span>
            </div>
            <input
              name="title"
              type="text"
              placeholder="Title *"
              className="border border-slate-300 rounded-md px-3 py-2 text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.title}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <textarea
              name="content"
              placeholder="Content *"
              className="resize-y border border-slate-300 rounded-md px-3 py-2 sm:py-3 min-h-[100px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              value={form.content}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              name="tags"
              type="text"
              placeholder="Tags (comma separated)"
              className="border border-slate-300 rounded-md px-3 py-2 text-xs sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.tags}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                type="submit"
                className="bg-emerald-600 px-4 sm:px-6 py-2 rounded-md text-white text-sm font-semibold shadow-sm hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                disabled={loading}
              >
                Add Note
              </button>
            </div>
          </form>
        </section>

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-4">
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          </div>
        )}

        {/* Notes List */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <svg
                className="animate-spin h-10 w-10 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          ) : sortedNotes.length === 0 ? (
            <EmptyState onCreate={() => {
              const el = document.getElementById("note-form");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }} />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 items-stretch">
              {sortedNotes.map((note) => (
                <article
                  key={note._id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 h-full flex flex-col min-h-[220px]"
                >
                  {/* Accent stripe */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400/60" />

                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    {editNoteId === note._id ? (
                      <>
                        <input
                          name="title"
                          type="text"
                          placeholder="Title"
                          className="border border-slate-300 rounded-md px-3 py-2 text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                          value={editForm.title}
                          onChange={handleEditFormChange}
                          required
                          disabled={loading}
                        />
                        <textarea
                          name="content"
                          placeholder="Content"
                          className="resize-y border border-slate-300 rounded-md px-3 py-2 sm:py-3 min-h-[100px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base mb-2"
                          value={editForm.content}
                          onChange={handleEditFormChange}
                          required
                          disabled={loading}
                        />
                        <input
                          name="tags"
                          type="text"
                          placeholder="Tags (comma separated)"
                          className="border border-slate-300 rounded-md px-3 py-2 text-xs sm:text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                          value={editForm.tags}
                          onChange={handleEditFormChange}
                          disabled={loading}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            onClick={handleCancelEdit}
                            disabled={loading}
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            onClick={() => handleUpdateNote(note._id)}
                            disabled={loading}
                            type="button"
                          >
                            Update
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 line-clamp-1" title={note.title}>
                            {note.title}
                          </h3>
                          <div className="text-xs text-slate-500 whitespace-nowrap">
                            {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : ""}
                          </div>
                        </div>
                        {/* Tags */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {note.tags.slice(0, 4).map((tag, i) => (
                              <span key={i} className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs">
                                #{tag}
                              </span>
                            ))}
                            {note.tags.length > 4 && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs">
                                +{note.tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Preview */}
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-4 break-words">
                          {renderHighlights(note.content, note.highlights)}
                        </p>

                        {/* Attachments */}
                        {note.attachments && note.attachments.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium text-xs text-slate-600">Attachments:</span>
                            <ul className="list-disc ml-5 text-xs">
                              {note.attachments.map((att, i) => (
                                <li key={i}>
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 underline"
                                  >
                                    {att.filename}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Highlights List */}
                        {note.highlights && note.highlights.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium text-xs text-amber-700">Highlights:</span>
                            <ul className="list-disc ml-5 text-xs text-amber-800">
                              {note.highlights.map((hl, i) => (
                                <li key={i}>{hl}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-between items-stretch sm:items-center">
                          <div className="flex gap-2">
                            <button
                              className="inline-flex items-center gap-1 rounded-md bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                              onClick={() => handleEdit(note)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              className="inline-flex items-center gap-1 rounded-md bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                              onClick={() => handleDelete(note._id)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                          <div className="flex flex-col gap-2 w-full sm:w-auto">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Highlight text"
                                className="border border-amber-300 rounded-md px-2 py-1 text-xs flex-grow focus:outline-none focus:ring-2 focus:ring-amber-400"
                                value={highlightTexts[note._id] || ""}
                                onChange={(e) =>
                                  setHighlightTexts((prev) => ({
                                    ...prev,
                                    [note._id]: e.target.value,
                                  }))
                                }
                                disabled={loading}
                              />
                              <button
                                className="inline-flex items-center gap-1 rounded-md bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
                                onClick={() => handleHighlight(note._id)}
                                disabled={loading || !(highlightTexts[note._id] && highlightTexts[note._id].trim())}
                              >
                                Highlight
                              </button>
                            </div>
                            <div className="flex gap-2 items-center">
                              <input
                                type="file"
                                className="text-xs border border-slate-300 rounded-md px-2 py-1 w-full sm:w-auto"
                                ref={(el) => {
                                  fileInputRefs.current[note._id] = el;
                                }}
                                onChange={(e) =>
                                  setFiles((prev) => ({
                                    ...prev,
                                    [note._id]: e.target.files[0],
                                  }))
                                }
                                disabled={loading}
                              />
                              <button
                                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
                                onClick={() => handleAttach(note._id)}
                                disabled={loading || !files[note._id]}
                              >
                                Attach
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </main>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-sm">
      <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-sm">
        <svg className="h-8 w-8" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14l4-3h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Create your first note</h2>
      <p className="mt-1 text-slate-600">Capture thoughts, tasks, and study takeaways. Organized and searchable.</p>
      <div className="mt-6">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white text-sm font-medium shadow-sm hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
          </svg>
          New note
        </button>
      </div>
    </div>
  );
}

export default Notes;
