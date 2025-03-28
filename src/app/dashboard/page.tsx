"use client";
import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { Switch } from "@/components/ui/switch"


export default function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  console.log("🚀 ~ Dashboard ~ isEditing:", isEditing)
  const [viewMode, setViewMode] = useState("grid");
  const [errors, setErrors] = useState({ title: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const todosPerPage = viewMode === "grid" ? 9 : 5;

  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    description: "",
    date: "",
    status: "pending",
  });

  const fetchTodos = async () => {
    try {
      const res = await fetch(`/api/todo?_=${Date.now()}`);
      const data = await res.json();
      console.log("Fetched Data:", data);

      if (Array.isArray(data)) {
        setTodos(data);
        setFilteredTodos(data);
      } else if (data.todos) {
        setTodos(data.todos);
        setFilteredTodos(data.todos);
      } else {
        console.error("Unexpected API Response:", data);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSearch = debounce((query) => {
    if (!query) {
      setFilteredTodos(todos);
      return;
    }
    const filtered = todos.filter((todo) =>
      todo.title.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredTodos(filtered);
    setCurrentPage(1);
  }, 500);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.title.length < 5 || /\d/.test(formData.title)) {
      setErrors({ title: "Title must be at least 5 characters long and not contain numbers!" });
      return;
    }
    console.log("Entry log");

    const res = await fetch("/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    console.log("Api calling save...");

    if (res.ok) {
      fetchTodos();
      closeModal();
    }
    // console.log("Exit log");

  };

const handleUpdate = async (e) =>{
  e.preventDefault();

  const res = await fetch("/api/todo", {
    method : "PUT",
    headers : {"Content-Type" : "application/json"},
    body : JSON.stringify(formData),
  })
  if(res.ok){
    fetchTodos();
    closeModal();
  }
  console.log("Updated data");
  
}

const handleEdit = async(todo) => {
    setFormData({
      _id: todo._id,
      title: todo.title,
      description: todo.description,
      date: todo.date.split("T")[0],
      status: todo.status,
    });

    setIsEditing(true);
    setShowModal(true);
    
  };

  const handleDelete = async (id) => {
    // console.log("Deleted Id: ",id);

    setTodos((todos) => todos.filter((todo) => todo.id !== id))
    await fetch("/api/todo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id }),
    });
    // console.log("API Calling");
    fetchTodos();
  };

  const closeModal = () => {
    setIsEditing(false);
    setShowModal(false);
    setErrors({ title: "" });
    setFormData({ _id: "", title: "", description: "", date: "", status: "pending" });
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
          Toggle {viewMode === "grid" ? "List" : "Grid"} 
        </button>

        {/* Search */}
        <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
          placeholder={`Search by`} className="border p-2 rounded w-1/3" />

        <Switch />

        
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold">{!isEditing ? "Add ToDo" : "Edit Todo"}</h2>
            <form onSubmit={isEditing ? handleUpdate : handleSubmit} className="space-y-4 mt-4">
              <input type="text" name="title" placeholder="Enter title" value={formData.title} onChange={handleChange} required className="border p-2 w-full" />
              <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="border p-2 w-full" />
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="border p-2 w-full" />
              <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
                <button type="button" onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMode === "grid" ? (
        // Grid View 
        <div className="grid grid-cols-3 gap-4">
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
      ) : (
        

        //list View
      <div className="space-y-3">
          {currentTodos.map((todo) => (
            <div key={todo._id} className="border p-3 rounded shadow flex justify-between items-center">
              <h2 className="text-lg font-bold">{todo.title}</h2>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(todo)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(todo._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

        

      {/* <div className="flex justify-center mt-70 gap-2">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Prev</button>
        <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
      </div> */}
    </div>
  );
}