import { NextResponse } from "next/server";
import Todo from "@/model/Todo";
import connectDB from "@/app/utils/dbConnection";
import { getServerSession } from "next-auth";
import authOptions from "@/app/api/auth/[...nextauth]/route"; // Your NextAuth config

export async function GET(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todos = await Todo.find({ userId: session.user.id }); 
    return NextResponse.json({ todos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, date, status } = await req.json();

  if (!title || !description || !date) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    const newTodo = new Todo({
      userId: session.user.id, 
      title,
      description,
      date,
      status: status || "pending",
    });

    await newTodo.save();
    return NextResponse.json({ message: "Todo created!", todo: newTodo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { _id, title, description, date, status } = await req.json();

  try {
    const todo = await Todo.findOne({ _id });

    if (!todo || todo.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
      _id,
      { title, description, date, status },
      { new: true }
    );

    return NextResponse.json({ message: "Todo updated!", todo: updatedTodo }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { _id } = await req.json();

  try {
    const todo = await Todo.findOne({ _id });
    if (!todo || todo.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await Todo.findByIdAndDelete(_id);
    return NextResponse.json({ message: "Todo deleted!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
