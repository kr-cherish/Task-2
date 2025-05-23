"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  type User = {
    fname: string,
    lname: string,
    mobileNumber: string,
    email: string
  }

  const [user, setUser] = useState<User>({
    fname: "",
    lname: "",
    mobileNumber: "",
    email: "",
  });

  useEffect(() => {
    if (session?.user) {
      setUser({
        fname: session.user.fname || "",
        lname: session.user.lname || "",
        mobileNumber: session.user.mobileNumber || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        update({ fname: user.fname, lname: user.lname, mobileNumber: user.mobileNumber });
        console.log("Profile updated successfully!");
        router.push('/dashboard')
      } else {
        console.log("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="flex justify-center items-center">
  <div className="p-7 bg-gray-900 text-white rounded-[30px] mt-10 shadow-lg flex flex-col items-center justify-center max-w-md w-full">
    <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>

    <div className="mb-4 w-full">
      <label className="block mb-2 text-[18px] text-white">First Name</label>
      <Input type="text" name="fname" value={user.fname} onChange={handleChange} placeholder="Update First Name" />
    </div>

    <div className="mb-4 w-full">
      <label className="block mb-2 text-[18px] text-white ">Last Name</label>
      <Input type="text" name="lname" value={user.lname} onChange={handleChange} placeholder="Update Last Name" />
    </div>

    <div className="mb-4 w-full">
      <label className="block mb-2 text-[18px] text-white">Mobile No</label>
      <Input type="text" name="mobileNumber" value={user.mobileNumber} onChange={handleChange} placeholder="Update Mobile Number" />
    </div>

    <div className="mb-4 w-full">
      <label className="block mb-2 text-[18px] text-white">Email</label>
      <Input type="email" name="email" value={user.email} readOnly className="bg-gray-700 text-gray-400 w-full" />
    </div>

    <Button onClick={handleSave} className="bg-blue-600 text-[18px] hover:bg-blue-700 mt-3 w-full">
      Save Changes
    </Button>
  </div>
</div>

  );
}
