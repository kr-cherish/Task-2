"use client";
import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string>("");
  const todosPerPage = viewMode === "grid" ? 9 : 5;

  const modalRef = useRef(null);

  type TodoFormData = {
    _id: string;
    title: string;
    description: string;
    date: string;
    status: "pending" | "completed";
  }

  const [formData, setFormData] = useState<TodoFormData>({
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
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setIsEditing(false);
      }
    }

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSearch = debounce((query: string) => {
    if (!query) {
      setFilteredTodos(todos);
      return;
    }
    const filtered = todos.filter((todo: TodoFormData) =>
      todo.title.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredTodos(filtered);
    setCurrentPage(1);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLFormElement>
  ) => {
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

  const handleUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const res = await fetch("/api/todo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    if (res.ok) {
      fetchTodos();
      closeModal();
    }
    console.log("Updated data");

  }

  const handleEdit = async (todo: TodoFormData) => {
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

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await fetch("/api/todo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: deleteConfirmId }),
    });
    fetchTodos();
    setDeleteConfirmId("");
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

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">List View</span>
          <Switch
            checked={viewMode === "grid"}
            onCheckedChange={(checked) => setViewMode(checked ? "grid" : "list")}
          />
          <span className="text-sm font-medium">Grid View</span>
        </div>

        {/* Search */}
        <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
          placeholder={`Search by`} className="border p-2 rounded w-1/3" />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg" ref={modalRef} >
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

      <label
        className="pr-[15px] text-[15px] leading-none text-white"
        htmlFor="airplane-mode"
      >
        Airplane mode
      </label>


      {viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-4">
          {filteredTodos.map((todo: TodoFormData) => (
            <div key={todo._id} className="border p-5 rounded shadow">
              <h2 className="text-lg font-bold">{todo.title}</h2>
              <p>{todo.description}</p>
              <p>Date: {new Date(todo.date).toLocaleDateString()}</p>
              <p>Status: {todo.status}</p>
              <div className="flex gap-2 mt-2">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(todo)}>Edit</button>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setDeleteConfirmId(todo._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. It will permanently delete this TODO item.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo: TodoFormData) => (
            <div key={todo._id} className="border p-3 rounded shadow flex justify-between items-center">
              <h2 className="text-lg font-bold">{todo.title}</h2>
              <div className="flex gap-2">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(todo)} >Edit</button>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setDeleteConfirmId(todo._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. It will permanently delete this TODO item.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}