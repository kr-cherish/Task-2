import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/dbConnection";
import Todo from "@/model/User";

export async function GET(req: NextRequest) {
  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  try {
    const todos = await Todo.find({
      title: { $regex: query, $options: "i" }, 
    });

    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching todos" }, { status: 500 });
  }
}
