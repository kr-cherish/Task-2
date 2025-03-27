import User from "@/model/User";
import connect from "@/app/utils/dbConnection";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
export const POST = async (request: Request) => {
  try {
    const { fname, lname, mobileNumber, email, password } = await request.json();
   
    await connect();
   
    const session = getServerSession();
    if(!session) return new Response("Unauthorized", {status:401});
    console.log(session);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already in use" },
        { status: 400 }
      );
    }  
    if (!fname || !lname || !email || !password || !mobileNumber) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json(
        { message: "Enter the valid Email formate" },
        { status: 400 }
      );
    }

    if (/^(\+\d{1,3}[- ]?)?\d{10}$/.test(mobileNumber)) {
      return NextResponse.json(
        { message: "Mobile number must be 10 digits" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
 
    const newUser = new User({
      fname,
      lname,
      mobileNumber,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    
    console.error("Registration error:", err.message);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
};
