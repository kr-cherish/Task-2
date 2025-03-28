import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connect from "@/app/utils/dbConnection";
import Todo from "@/model/Todo";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const GET = async () => {
  try {
    await connect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const todos = await Todo.find({ userId: session.user.id });
    return NextResponse.json(todos, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching todos:", error.message);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    await connect();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, date, status } = await request.json();

    if (!title || !description || !date) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const newTodo = new Todo({
      userId: session.user.id,
      title,
      description,
      date,
      status: status || "pending",
    });

    await newTodo.save();
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error: any) {
    console.error("Error creating todo:", error.message);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};

export const DELETE = async (request: Request) => {
    try {
      await connect();
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const { _id:id } = await request.json();
      
      await Todo.findOneAndDelete({ _id: id, userId: session.user.id });

      console.log("Delete");
      return NextResponse.json({ message: "Todo deleted successfully" }, { status: 200 });
      
    } catch (error: any) {
      console.error("Error deleting todo:", error.message);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};

export async function PUT(req: Request) {
  try {
    await connect(); 
    const { _id, title, description, date, status } = await req.json();

    if (!_id) {
      return NextResponse.json({ message: "Todo ID is required" }, { status: 400 });
    }
    console.log(title);
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      _id,
      { title, description, date, status },
      { new: true }
    );

    if (!updatedTodo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error) {
    console.error("Error updating TODO:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}