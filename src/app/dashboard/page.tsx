"use client";
import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Rows3 } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';
export default function Dashboard() {
  const [todos, setTodos] = useState<TodoFormData[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<TodoFormData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  console.log("🚀 ~ Dashboard ~ isEditing:", isEditing)
  const [viewMode, setViewMode] = useState("grid");
  const [errors, setErrors] = useState({ title: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const todosPerPage = viewMode === "grid" ? 9 : 5;

  const modalRef = useRef<HTMLDivElement>(null);

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
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  useEffect(() => {
    handleSearch(searchQuery, statusFilter);
    console.log(1);

  }, [searchQuery, statusFilter, todos]);

  const handleSearch = (query: string, status: string) => {
    let filtered = todos;

    if (query) {
      filtered = filtered.filter((todo) =>
        todo.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status) {
      filtered = filtered.filter((todo) => todo.status === status);
    }

    setFilteredTodos(filtered);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>
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

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleMarkAsDone = async (todoId:string) => {
    try {
      const updatedTodos = todos.map(todo =>
        todo._id === todoId ? { ...todo, status: "completed" } : todo
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error marking TODO as done", error);
    }
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
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Todo List</h1>

      <div className="flex flex-wrap lg:gap-4 lg:mb-4 items-center justify-between">

        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
            placeholder="Search by"
            className="p-2 rounded border border-black w-[250px]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-black rounded p-2 w-[150px]"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="lg:flex lg:ml-auto lg:gap-4 py-2 ">
          <button
            onClick={() => setViewMode("list")}
            className={`py-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-500"} transition`}
          >
            <Rows3 className="w-10 h-6 cursor-pointer" />
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={`py-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-500"} transition`}
          >
            <LayoutGrid className="w-10 h-6 cursor-pointer" />
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex gap-4 justify-center bg-blue-500 font-bold text-white  lg:w-1/4 text-[20px] py-2 px-4 rounded md:px-10"
        >
          Add Todo
        </button>
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
        <div className="lg:grid lg:grid-cols-3 lg:gap-10 md:grid md:grid-cols-2 md:gap-5 ">
          {filteredTodos.map((todo: TodoFormData) => (
            <div key={todo._id} className="border-[10px] border-white-800 p-5 rounded-[20px]  bg-gradient-to-tr from-slate-900 to-gray-900 text-white shadow-lg ">
              <h2 className="text-[20px] font-bold text-center py-3 ">{todo.title.toUpperCase()}</h2>
              <div className="text-[18px] font-medium px-5">
                <p className="py-1">{todo.description}</p>
                <p className="py-1">Date: {new Date(todo.date).toLocaleDateString()}</p>
                <p className="py-1">Status: {todo.status}</p>
              </div>
              {/* <div className="flex gap-4 px-5 py-3">
                <button className="bg-yellow-500 text-white px-7 py-2 font-medium text-[17px] rounded" onClick={() => handleEdit(todo)}>Edit</button>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setDeleteConfirmId(todo._id)}
                      className="bg-red-500 text-white font-medium px-4 py-2 text-[17px] rounded"
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
              </div> */}

              <div className="flex gap-3 ml-auto text-[17px]">
                <button
                  className={`bg-yellow-500 text-white font-medium px-7 py-2 rounded  
                ${todo.status === "completed" ? "opacity-0.8 cursor-not-allowed" : ""}`}
                  onClick={() => handleEdit(todo)}
                  disabled={todo.status === "completed"}
                >
                  Edit
                </button>

                <button
                  className={`bg-green-500 text-white font-medium px-5 py-2 rounded shrink
                ${todo.status === "completed" ? "opacity-0.9 cursor-not-allowed" : ""}`}
                  onClick={() => handleMarkAsDone(todo._id)}
                  disabled={todo.status === "completed"}
                >
                  Done
                </button>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setDeleteConfirmId(todo._id)}
                      className="bg-red-500 text-white font-medium px-4 py-2 rounded shrink "
                    >
                      Delete
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Are you sure?</DialogTitle>
                      <DialogDescription className="text-black font-mono text-[16px]">
                        This action cannot be undone. It will permanently delete this TODO item.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                      </DialogClose>
                      <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>
                        Confirm Delete
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>


            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 ">
          {filteredTodos.map((todo: TodoFormData) => (
            <div key={todo._id} className="border p-3 rounded-[10px] shadow-lg flex items-center gap-2 bg-gradient-to-tr from-slate-900 to-gray-900 text-white">
              <Image
                src="/demo.jpeg"
                width={40}
                height={40}
                alt="Logo"
                className="rounded-[8px]"
              />
              <h2 className="left-0 text-lg font-bold">{todo.title}</h2>
              {/* <div className="flex gap-3 ml-auto text-[17px] ">
                <button className="bg-yellow-500 text-white font-medium px-7 py-2 rounded" onClick={() => handleEdit(todo)} >Edit</button>
               
                 <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setDeleteConfirmId(todo._id)}
                      className="bg-red-500 text-white font-medium px-4 py-2 rounded "
                    >
                      Delete
                    </button>
                  </DialogTrigger>
                  <DialogContent className="">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Are you sure?</DialogTitle>
                      <DialogDescription className="text-black font-mono text-[16px]">
                        This action cannot be undone. It will permanently delete this TODO item.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild className="ext-[14px] text-black">
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div> */}

              <div className="flex gap-3 ml-auto text-[17px]">
                <button
                  className={`bg-yellow-500 text-white font-medium px-7 py-2 rounded 
                ${todo.status === "completed" ? "opacity-0.9 cursor-not-allowed" : ""}`}
                  onClick={() => handleEdit(todo)}
                  disabled={todo.status === "completed"}
                >
                  Edit
                </button>

                <button
                  className={`bg-green-500 text-white font-medium px-5 py-2 rounded 
                ${todo.status === "completed" ? "opacity-0.9 cursor-not-allowed" : ""}`}
                  onClick={() => handleMarkAsDone(todo._id)}
                  disabled={todo.status === "completed"}
                >
                  Done
                </button>

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setDeleteConfirmId(todo._id)}
                      className="bg-red-500 text-white font-medium px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Are you sure?</DialogTitle>
                      <DialogDescription className="text-black font-mono text-[16px]">
                        This action cannot be undone. It will permanently delete this TODO item.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                      </DialogClose>
                      <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>
                        Confirm Delete
                      </button>
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