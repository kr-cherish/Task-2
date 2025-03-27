"use client";
import { useState, useEffect } from "react";
import { debounce } from "lodash";

export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [errors, setErrors] = useState({ title: "" });
  const [filteredTodos, setFilteredTodos] = useState([]); // Search results
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("title"); // "title" or "status"
  const [currentPage, setCurrentPage] = useState(1);

  const todosPerPage = viewMode === "grid" ? 9 : 5; // Grid shows 9, List shows 5

  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    description: "",
    date: "",
    status: "pending",
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch("/api/todo");
    const data = await res.json();
    setTodos(data.todos || []);
    setFilteredTodos(data.todos || []);
  };

  // Debounced search function
  const handleSearch = debounce((query) => {
    if (!query) {
      setFilteredTodos(todos);
      return;
    }
    const filtered = todos.filter((todo) =>
      searchType === "title"
        ? todo.title.toLowerCase().includes(query.toLowerCase())
        : todo.status.toLowerCase() === query.toLowerCase()
    );
    setFilteredTodos(filtered);
    setCurrentPage(1); // Reset pagination when searching
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.length < 5 || /\d/.test(formData.title)) {
      setErrors({ ...errors, title: "Title must be at least 5 characters long and not contain numbers!" });
      return;
    }

    const res = await fetch("/api/todo", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      fetchTodos();
      setShowModal(false);
      setIsEditing(false);
      setErrors({ title: "" });
      setFormData({ _id: "", title: "", description: "", date: "", status: "pending" });
    }
  };

  const handleEdit = (todo) => {
    setFormData(todo);
    setShowModal(true);
    setIsEditing(true);
  };

  const handleDelete = async (_id) => {
    await fetch("/api/todo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
    fetchTodos();
  };

  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Add Todo</button>
        <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="bg-gray-500 text-white px-4 py-2 rounded">
          Toggle {viewMode === "grid" ? "List" : "Grid"} View
        </button>

        <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
          placeholder={`Search by ${searchType}`} className="border p-2 rounded w-1/3" />

        <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="border p-2 rounded">
          <option value="status">Status</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Modal for Adding/Editing Todos */}
      {showModal && (
        <div className="fixed inset-1 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold">{isEditing ? "Edit Todo" : "Add Todo"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <input type="text" name="title" placeholder="Enter title (Min 5 characters, No Numbers)" value={formData.title} onChange={handleChange} required className="border p-2 w-full" />
              <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="border p-2 w-full" />
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="border p-2 w-full" />
              <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Todo List with Pagination */}
      <div className={viewMode === "grid" ? "grid grid-cols-3 gap-4" : "space-y-5"}>
        {currentTodos.map((todo) => (
          <div key={todo._id} className="border p-5 rounded shadow">
            <h2 className="text-lg font-bold">{todo.title}</h2>
            <p>{todo.description}</p>
            <p>Date: {new Date(todo.date).toLocaleDateString()}</p>
            <p>Status: {todo.status}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleEdit(todo)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(todo._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Prev</button>
          {[...Array(totalPages)].map((_, index) => (
            <button key={index} onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
              {index + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
